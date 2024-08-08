import { NextFunction, Request, Response } from "express";
import UserModel from "../model/user.model";
import Errorhandler from "../util/Errorhandler.util";
import { HashPassword } from "../util/auth.util";
import sendVerificationMail from "../util/sendmail";
import UploadOnCloudinary from "../util/cloudinary.util";
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
    } catch (error) {}
  }
}
export default UserController;
