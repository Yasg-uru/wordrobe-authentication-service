import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
export interface ReqWithUser extends Request{
    user:JwtPayload
}