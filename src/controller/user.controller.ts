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
}
export default UserController;
