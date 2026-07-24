import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("Connecting to MongoDB...");
console.log(process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🎉 MongoDB Connected Successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection Failed");
    console.error(err);
    process.exit(1);
  });