import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const dbConnect = async () => {
  try {
    mongoose
      .connect(process.env.MONGO_URL)
      .then(() => {
        console.log("Connected Successfully");
      })
      .catch((error) => {
        console.log("error : ", error);
        console.error("Connection Error", error.message);
      });
  } catch (error) {
    console.log(error);
    console.log("Connection error:");
  }
};

export default dbConnect;
