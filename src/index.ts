import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import config from "./config";
import connectDb from "./db";
import connectRedis from "./db/redis";
import authRoutes from "./routes/authRoutes";
import todoRoutes from "./routes/todoRoutes";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/v1/", todoRoutes);
app.use("/api/v1/auth", authRoutes);

const startServer = async () => {
  try {
    await connectDb();
    await connectRedis();
  } catch (err) {
    console.warn("error in starting servers", err);
  }
};

const start = async () => {
  await startServer();
  app.listen(config.PORT, () => {
    console.log("server started");
  });
};

start();
