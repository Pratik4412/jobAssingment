import { fetchFeed } from "../services/feedFetcher.js";
import { normalizeFeed } from "../services/jobNormalizer.js";
import importQueue from "../queues/importQueue.js";
import ImportLog from "../models/ImportLog.js";

export async function runImportForFeed(req, res) {
  const { feedUrl } = req.body;
  if (!feedUrl) return res.status(400).json({ error: "feedUrl required" });

  const start = Date.now();
  try {
    const parsed = await fetchFeed(feedUrl);
    const items = normalizeFeed(parsed, feedUrl);
    const totalFetched = items.length;

    const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "50", 10);
    let pushed = 0;
    const failed = [];
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);

      const promises = batch.map((it) =>
        importQueue.add(it, {
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 },
        })
      );
      await Promise.all(promises);
      pushed += batch.length;
    }

    const log = await ImportLog.create({
      fileName: feedUrl,
      timestamp: new Date(),
      totalFetched,
      totalImported: pushed,
      newJobs: 0,
      updatedJobs: 0,
      failedJobs: [],
      durationMs: Date.now() - start,
    });

    return res.json({
      message: "Feed enqueued",
      totalFetched,
      pushed,
      logId: log._id,
    });
  } catch (err) {
    console.error("Import error", err);
    return res
      .status(500)
      .json({ error: (err && err.message) || "Import failed" });
  }
}
