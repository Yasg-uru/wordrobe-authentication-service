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
UserRouter.post("/login", UserController.Login);
UserRouter.get("/alluser", UserController.getAlluser);
UserRouter.post("/forgotpassword/:email", UserController.ForgotPassword);
UserRouter.post("/reset/:token", UserController.ResetPassword);

UserRouter.post("/logout", UserController.Logout);

export default UserRouter;
