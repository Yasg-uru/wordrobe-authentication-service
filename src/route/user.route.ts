import { Router } from "express";
import upload from "../middleware/multer.middleware";
import UserController from "../controller/user.controller";
const UserRouter = Router();
UserRouter.post(
  "/create",
  upload.single("profileUrl"),
  UserController.Register
);
UserRouter.post("/verify", UserController.verify);
UserRouter.post("/login",UserController.Login);


export default UserRouter;
