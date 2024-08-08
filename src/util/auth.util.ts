import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Jwtpayload } from "../types/jwtPayLoad";
import { IUser } from "../model/user.model";
import { NextFunction, Request, Response } from "express";

export const HashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};
export const Comparepassword = async (
  password: string,
  hashedPassword: string
) => {
  return bcrypt.compare(password, hashedPassword);
};
export const GenerateToken = async (user: IUser) => {
  const { username, email, _id, isVerified } = user;

  return jwt.sign(
    { username, email, id: _id, isVerified } as Jwtpayload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRE as string,
    }
  );
};
export const sendToken =
  (res:Response,token: string,statuscode:number,user:IUser) =>  {
    const options = {
      expires: new Date(
        Date.now() +
          parseInt(process.env.COOKIE_EXPIRE as string, 10) *
            24 *
            60 *
            60 *
            1000
      ),
      httpOnly: true, // Ensures the cookie is accessible only via HTTP(S) and not JavaScript
      sameSite: "none" as "none", // Ensures the cookie is sent in cross-origin requests
      //   secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent only over HTTPS in production
    };

    res.cookie("token", token, options).status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
    });
  };
