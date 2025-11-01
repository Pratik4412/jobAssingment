import express from "express";
import ImportLog from "../models/importLog.js";
const router = express.Router();

router.get("/import-logs", async (req, res) => {
  const page = Math.max(0, parseInt(req.query.page || "0"));
  const limit = Math.min(100, parseInt(req.query.limit || "20"));
  const logs = await ImportLog.find()
    .sort({ timestamp: -1 })
    .skip(page * limit)
    .limit(limit);
  const total = await ImportLog.countDocuments();
  res.json({ data: logs, page, limit, total });
});

export default router;
