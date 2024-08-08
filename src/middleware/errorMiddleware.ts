import Errorhandler from "../util/Errorhandler.util";
import { Request, Response, NextFunction } from "express";
export const ErrorhandlerMiddleware = (
  err: Errorhandler | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof Errorhandler) {
    return res.status(err.statuscode).json({
      message: err.message,
    });
  }
  return res.status(500).json({
    message: "Internal Server Error",
  });
};
