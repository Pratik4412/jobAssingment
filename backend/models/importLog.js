import mongoose from "mongoose";

const ImportLogSchema = new mongoose.Schema({
  fileName: String,
  timestamp: { type: Date, default: Date.now },
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: [
    {
      item: Object,
      reason: String,
    },
  ],
  durationMs: Number,
});

export default mongoose.model("ImportLog", ImportLogSchema);
