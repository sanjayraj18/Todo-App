import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import sessionModel from "../models/session.schema";
import userModel from "../models/user.schema";

export const SignupController = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;

    const isAlreadyExists = await userModel.findOne({
      email,
    });
    if (isAlreadyExists) {
      res.status(409).json({
        message: "user already exits",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      userName,
      email,
      password: hashedPassword,
    });

    const refreshToken = jwt.sign({ userId: user._id }, config.JWT_SECRET, {
      expiresIn: "7d",
    });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const session = await sessionModel.create({
      userId: user._id,
      refreshToken: refreshTokenHash,
      ip: req.ip || "",
      userAgent: req.header("user-agent") || "",
    });

    const accessToken = jwt.sign(
      { userId: user._id, sessionId: session._id },
      config.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        userName: userName,
        email: email,
      },
      accessToken,
    });
  } catch (err) {
    console.warn("Error in Signup", err);
  }
};

export const SigninController = () => {};

export const RefreshtokenController = () => {};

export const LogoutController = () => {};
