import { NextFunction, Request, Response } from "express";
import UserModel from "../model/user.model";
import Errorhandler from "../util/Errorhandler.util";
import crypto from "crypto";

import {
  Comparepassword,
  GenerateToken,
  HashPassword,
  sendToken,
} from "../util/auth.util";
import  sendVerificationMail,{ sendResetPasswordMail } from "../util/sendmail";
import UploadOnCloudinary from "../util/cloudinary.util";
import { ReqWithUser } from "../types/ReqWithuser";
// import sendVerificationMail from "src/util/sendmail";
// import {sendResetPasswordMail } from "../util/sendmail" 

class UserController {
  public static async Register(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { username, email, password } = req.body;
      const ExisitingUser = await UserModel.findOne({
        email,
        isVerified: true,
      });
      if (ExisitingUser) {
        return next(new Errorhandler(400, "User Already verified"));
      }
      const ExisitingUserUnverified = await UserModel.findOne({
        email,
        isVerified: false,
      });
      let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      if (ExisitingUserUnverified) {
        ExisitingUserUnverified.passwordHash = await HashPassword(password);
        ExisitingUserUnverified.verifycode = verifyCode;
        ExisitingUserUnverified.VerifyCodeExpiry = new Date(
          Date.now() + 3600000
        );
        await ExisitingUserUnverified.save();
        const EmailResponse = await sendVerificationMail(
          username,
          email,
          verifyCode
        );
        if (!EmailResponse.success) {
          return next(new Errorhandler(400, EmailResponse.message));
        }
      } else {
        const passwordHash = await HashPassword(password);
        if (req.file && req.file.path) {
          const cloudinaryUrl = await UploadOnCloudinary(req.file.path);
          const profileUrl = cloudinaryUrl?.secure_url;
          const newUser = new UserModel({
            username,
            email,
            passwordHash,
            isVerified: false,
            verifycode: verifyCode,
            profileUrl: profileUrl,
            VerifyCodeExpiry: new Date(Date.now() + 3600000),
          });
          await newUser.save();
        } else {
          const newUser = new UserModel({
            username,
            email,
            passwordHash,
            isVerified: false,
            verifycode: verifyCode,
            profileUrl: null,
            VerifyCodeExpiry: new Date(Date.now() + 3600000),
          });
          await newUser.save();
        }
        const EmailResponse = await sendVerificationMail(
          username,
          email,
          verifyCode
        );
        if (!EmailResponse.success) {
          return next(new Errorhandler(400, EmailResponse.message));
        }
      }
      res.status(201).json({
        success: true,
        message:
          "Registered user successfully , Please verify your account first",
      });
    } catch (error) {
      next(new Errorhandler(500, "Internal server Error"));
    }
  }
  public static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) {
        return next(new Errorhandler(404, "user not found"));
      }
      const isValidCode = user.verifycode === code;
      const isNotCodeVerify = new Date(user.VerifyCodeExpiry) > new Date();
      if (isNotCodeVerify && isValidCode) {
        user.isVerified = true;
        await user.save();
        res.status(200).json({
          success: true,
          message:
            "your account has been verified successfully , please Login to continue",
        });
      } else if (!isNotCodeVerify) {
        return next(
          new Errorhandler(
            404,
            "Expired verification code . please signup again to get a new code"
          )
        );
      } else {
        return next(
          new Errorhandler(
            404,
            "Incorrect verification code . please signup again to get a new code"
          )
        );
      }
    } catch (error) {
      next(new Errorhandler(500, "Internal server error"));
    }
  }

  public static async Login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) {
        return next(new Errorhandler(404, "User not found"));
      }
      if (user.isVerified === false) {
        return next(
          new Errorhandler(
            400,
            "you are unable to Login please verify user account first"
          )
        );
      }
      const isCorrectPassword = await Comparepassword(
        password,
        user.passwordHash
      );
      if (!isCorrectPassword) {
        return next(new Errorhandler(400, "Incorrect Credentials"));
      }
      const token = await GenerateToken(user);

      await sendToken(res, token, 200, user);
    } catch (error) {
      next(new Errorhandler(500, "Internal server error"));
    }
  }
  public static async getAlluser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const users = await UserModel.find({});
      res.status(200).json({
        users,
      });
    } catch (error) {
      next(new Errorhandler(500, "Internal server error"));
    }
  }

  public static async Logout(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.cookie("token", null, { expires: new Date() }).status(200).json({
      message: "Logged out Successfully",
    });
  }
  public static async ForgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email } = req.params;
      const ExisitingUser = await UserModel.findOne({ email });
      if (!ExisitingUser) {
        return next(new Errorhandler(404, "User not found "));
      }
      //after this we need to create the logic of sending mail to that particular mail address
      // we need to generate the reset password token
      ExisitingUser.ForgotPasswordResetToken = crypto
        .randomBytes(20)
        .toString("hex");
      ExisitingUser.ForgotPasswordResetTokenExpiry = new Date(
        Date.now() + 3600000
      );
      await ExisitingUser.save();

      const MailResponse = await sendResetPasswordMail(
        ExisitingUser.ForgotPasswordResetToken,
        ExisitingUser.email
      );
      if (!MailResponse.success) {
        return next(new Errorhandler(400, MailResponse.message));
      }
      res.status(200).json({
        success: true,
        message: "Sent mail successfully",
      });
    } catch (error) {
      next();
    }
  }
  public static async ResetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const FindUserByToken = await UserModel.findOne({
        ForgotPasswordResetToken: token,
      });
      if (!FindUserByToken) {
        return next(new Errorhandler(404, "User not found with this token "));
      }
      FindUserByToken.passwordHash = await HashPassword(password);
      FindUserByToken.ForgotPasswordResetToken = undefined;
      FindUserByToken.ForgotPasswordResetTokenExpiry = undefined;
      await FindUserByToken.save();
      res.status(200).json({
        message: "reset password successfully please login  to continue",
      });
    } catch (error) {
      next();
    }
  }
}
export default UserController;
