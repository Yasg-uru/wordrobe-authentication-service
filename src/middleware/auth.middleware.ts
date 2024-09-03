import { Request, Response, NextFunction } from "express";
import Errorhandler from "../util/Errorhandler.util";
import jwt from "jsonwebtoken";
import { JWT_Decoded } from "../types/jwtPayLoad";
import { ReqWithUser } from "../types/ReqWithuser";

export const isAuthenticated = (
  req: ReqWithUser,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    return next(new Errorhandler(400, "please Login to continue"));
  }
  //   console.log("this is a token :", token);

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JWT_Decoded;
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  if (!decoded) {
    return next(new Errorhandler(400, "please login to continue"));
  }
  req.user = decoded;
  next();
};
