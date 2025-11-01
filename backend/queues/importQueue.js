import Queue from "bull";
import dotenv from "dotenv";
dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

export const importQueue = new Queue("import-queue", { redis: redisConfig });

export default importQueue;
