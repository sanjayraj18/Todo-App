import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import sessionModel from "../models/session.schema";
import userModel from "../models/user.schema";
import { TokenService } from "../service/TokenService";

export const SignupController = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;

    const isAlreadyExists = await userModel.findOne({
      email,
    });
    if (isAlreadyExists) {
      return res.status(409).json({
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

    const session = await sessionModel.create({
      userId: user._id,
      refreshToken: refreshToken,
      ip: req.ip || "",
      userAgent: req.header("user-agent") || "",
    });

    await TokenService.storeSession(
      session._id.toString(),
      user._id.toString(),
      req.ip || "",
      req.header("user-agent") || "unknown",
    );

    await TokenService.storeRefreshToken(
      refreshToken,
      user._id.toString(),
      session._id.toString(),
    );

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

export const SigninController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(409).json({
        message: "User not found, please Signup",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "password incorrect",
      });
    }

    const userId = user?._id;
    if (!userId) {
      return res.status(500).json({
        message: "Error creating session",
      });
    }

    const refreshToken = jwt.sign({ userId: userId }, config.JWT_SECRET, {
      expiresIn: "7d",
    });

    const session = await sessionModel.create({
      userId,
      refreshToken: refreshToken,
      ip: req.ip || "",
      userAgent: req.header("user-agent") || "",
    });

    await TokenService.storeSession(
      session._id.toString(),
      userId.toString(),
      req.ip || "",
      req.header("user-agent") || "unknown",
    );

    await TokenService.storeRefreshToken(
      refreshToken,
      user._id.toString(),
      session._id.toString(),
    );

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

    res.status(200).json({
      message: "Login Successful",
      accessToken,
    });
  } catch (err) {
    console.warn("error in signin", err);
  }
};

export const RefreshtokenController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "token not found",
      });
    }

    const tokenData = await TokenService.getRefreshToken(refreshToken);
    if (!tokenData) {
      return res.status(401).json({
        message: "token expired or invalid",
        code: "TOKEN_INVALID",
      });
    }

    const sessionId = tokenData.sessionId;
    const userId = tokenData.userId;

    const session = await TokenService.getSession(sessionId);
    if (!session) {
      return res.status(401).json({
        message: "session not found",
      });
    }

    const newaccessToken = jwt.sign(
      {
        userId: userId,
        sessionId: sessionId,
      },
      config.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const newrefreshToken = jwt.sign({ userId: userId }, config.JWT_SECRET, {
      expiresIn: "7d",
    });

    const sessionDoc = await sessionModel.findById(sessionId);
    if (sessionDoc) {
      sessionDoc.refreshToken = newrefreshToken;
      await sessionDoc.save();
    }

    await TokenService.revokeRefreshToken(refreshToken);
    await TokenService.storeRefreshToken(newrefreshToken, userId, sessionId);

    res.cookie("refreshToken", newrefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "AccessToken refreshed successfully",
      newaccessToken,
    });
  } catch (err) {
    console.warn("Error in generating refreshToken", err);
  }
};

export const LogoutController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "token not found",
      });
    }

    const tokenData = await TokenService.getRefreshToken(refreshToken);
    if (!tokenData) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    const sessionId = tokenData.sessionId;

    const sessionDoc = await sessionModel.findById(sessionId);
    if (sessionDoc) {
      sessionDoc.revoked = true;
      await sessionDoc?.save();
    }

    await TokenService.revokeRefreshToken(refreshToken);
    await TokenService.revokeSession(sessionId);

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "logout successful",
    });
  } catch (err) {
    console.warn("Error in loggingout", err);
  }
};
