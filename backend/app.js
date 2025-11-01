import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import importRoutes from "./routes/import.routes.js";
import logsRoutes from "./routes/logs.routes.js";
import { startScheduler } from "./cron/scheduler.js";
import { redisClient } from "./config/redis.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/import", importRoutes);
app.use("/api/logs", logsRoutes);

const PORT = process.env.PORT || 8000;

(async () => {
  console.log(
    "Loaded Mongo URI:",
    process.env.MONGO_URL ? "✅ Found" : "❌ Missing"
  );
  await connectDB();

  redisClient.on("connect", () => console.log("Redis connected"));
  redisClient.on("error", (err) => console.error("Redis error", err));

  startScheduler();

  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
})();
