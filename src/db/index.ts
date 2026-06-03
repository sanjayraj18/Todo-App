import mongoose from "mongoose";
import config from "../config";

const connectDb = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Db connected");
  } catch (err) {
    console.warn("Error connecting to DB:", err);
    process.exit(1);
  }
};

export default connectDb;
