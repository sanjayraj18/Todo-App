import Router from "express";
import {
  LogoutController,
  RefreshtokenController,
  SigninController,
  SignupController,
} from "../controller/authController";

const authRouter = Router();

authRouter.post("/signup", SignupController);

authRouter.post("/signin", SigninController);

authRouter.get("/refresh", RefreshtokenController);

authRouter.post("/logout", LogoutController);

export default authRouter;
