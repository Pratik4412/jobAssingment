import cron from "node-cron";
import { fetchFeed } from "../services/feedFetcher.js";
import { normalizeFeed } from "../services/jobNormalizer.js";
import importQueue from "../queues/importQueue.js";
import ImportLog from "../models/importLog.js";

const FEEDS = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

export function startScheduler() {
  enqueueAllFeeds().catch((err) => console.error("Initial feed error:", err));

  cron.schedule("0 * * * *", async () => {
    console.log("Running scheduled fetch:", new Date());
    await enqueueAllFeeds();
  });
}

async function enqueueAllFeeds() {
  for (const feedUrl of FEEDS) {
    const start = Date.now();
    try {
      const parsed = await fetchFeed(feedUrl);
      const items = normalizeFeed(parsed, feedUrl);
      const totalFetched = items.length;
      let pushed = 0;

      for (
        let i = 0;
        i < items.length;
        i += parseInt(process.env.BATCH_SIZE || "50")
      ) {
        const batch = items.slice(
          i,
          i + parseInt(process.env.BATCH_SIZE || "50")
        );
        await Promise.all(
          batch.map((it) =>
            importQueue.add(it, {
              attempts: 3,
              backoff: { type: "exponential", delay: 1000 },
            })
          )
        );
        pushed += batch.length;
      }

      await ImportLog.create({
        fileName: feedUrl,
        timestamp: new Date(),
        totalFetched,
        totalImported: pushed,
        newJobs: 0,
        updatedJobs: 0,
        failedJobs: [],
        durationMs: Date.now() - start,
      });
      console.log(`Enqueued ${pushed} items from ${feedUrl}`);
    } catch (err) {
      console.error("Error enqueuing feed:", feedUrl, err.message);
      await ImportLog.create({
        fileName: feedUrl,
        timestamp: new Date(),
        totalFetched: 0,
        totalImported: 0,
        newJobs: 0,
        updatedJobs: 0,
        failedJobs: [{ item: null, reason: err.message }],
        durationMs: Date.now() - start,
      });
    }
  }
}
