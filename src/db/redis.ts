import redisClient from "../config/redis";

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("redis connected");
  } catch (err) {
    console.warn("Error in redis connection", err);
    process.exit(1);
  }
};

export default connectRedis;
