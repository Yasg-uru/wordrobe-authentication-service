import { Router } from "express";
import upload from "../middleware/multer.middleware";
import UserController from "../controller/user.controller";
const UserRouter=Router();
UserRouter.post("/create",upload.single("profileUrl"),UserController.Register)
export default UserRouter;
