export function normalizeFeed(parsed, feedUrl) {
  const items = [];
  let rawItems;
  if (parsed.rss && parsed.rss.channel && parsed.rss.channel.item) {
    rawItems = parsed.rss.channel.item;
  } else if (parsed.feed && parsed.feed.entry) {
    rawItems = parsed.feed.entry;
  } else {
    rawItems = [];
  }

  if (!Array.isArray(rawItems)) rawItems = [rawItems];

  rawItems.forEach((it) => {
    const title = it.title || it.jobtitle || "";
    const description = it.description || it.summary || "";
    const url =
      it.link &&
      (typeof it.link === "string"
        ? it.link
        : it.link.href || it.link[0] || "");
    const company = it.company || it["dc:creator"] || it["author"]?.name || "";
    const location =
      it.location ||
      it["job_location"] ||
      it["dc:coverage"] ||
      it["georss:point"] ||
      "";
    const externalId =
      (it.guid && (typeof it.guid === "object" ? it.guid._ : it.guid)) ||
      it.id ||
      url;

    const postedAt = it.pubDate
      ? new Date(it.pubDate)
      : it.published
      ? new Date(it.published)
      : new Date();

    items.push({
      title: String(title).trim(),
      description,
      company,
      location,
      url,
      externalId,
      postedAt,
      raw: it,
      feedUrl,
    });
  });
  return items;
}
