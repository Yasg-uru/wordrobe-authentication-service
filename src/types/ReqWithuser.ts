import { Request } from "express";
import { JWT_Decoded } from "./jwtPayLoad";
export interface ReqWithUser extends Request {
  user: JWT_Decoded;
}
