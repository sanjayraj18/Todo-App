import dotenv from "dotenv";

dotenv.config();

if (!process.env.PORT) {
  throw new Error("port not found");
}

if (!process.env.MONGO_URI) {
  throw new Error("Mongo URI not found");
}

if (!process.env.JWT_SECRET) {
  throw new Error("jwt secret not found");
}

if (!process.env.REDIS_PORT) {
  throw new Error("redis port not found");
}

if (!process.env.REDIS_HOST) {
  throw new Error("redis host not found");
}

if (!process.env.REDIS_PASSWORD) {
  throw new Error("redis password not found");
}

const config = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};

export default config;
