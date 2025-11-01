import dotenv from "dotenv";
dotenv.config();
import { importQueue } from "../queues/importQueue.js";
import mongoose from "mongoose";
import JobModel from "../models/Job.js";
import ImportLog from "../models/importLog.js";
import { connectDB } from "../config/db.js";

const CONCURRENCY = parseInt(process.env.QUEUE_CONCURRENCY || "3");

const run = async () => {
  await connectDB(process.env.MONGO_URL);
  console.log("Worker connected to DB, starting to consume queue...");

  importQueue.process(CONCURRENCY, async (job) => {
    try {
      const data = job.data;
      const query = {};
      if (data.url) query.url = data.url;
      else if (data.externalId) query.externalId = data.externalId;

      const now = new Date();
      const update = {
        $set: {
          title: data.title,
          description: data.description,
          company: data.company,
          location: data.location,
          url: data.url,
          externalId: data.externalId,
          raw: data.raw,
          postedAt: data.postedAt,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      };

      const res = await JobModel.findOneAndUpdate(query, update, {
        upsert: true,
        new: true,
      });

      return { success: true, id: res._id.toString(), upserted: true };
    } catch (err) {
      console.error("Worker error importing job:", err);
      throw err;
    }
  });

  importQueue.on("failed", (job, err) => {
    console.error("Job failed:", job.id, err.message);
  });
};

run().catch((err) => {
  console.error("Worker startup error", err);
  process.exit(1);
});
