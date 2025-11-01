import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    company: String,
    location: String,
    url: { type: String, unique: true, index: true },
    externalId: { type: String, index: true },
    raw: Object,
    postedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);
