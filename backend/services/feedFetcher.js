import axios from "axios";
import xml2js from "xml2js";

export async function fetchFeed(url) {
  const res = await axios.get(url, { timeout: 15000 });
  const xml = res.data;
  const parsed = await xml2js.parseStringPromise(xml, {
    explicitArray: false,
    mergeAttrs: true,
  });
  return parsed;
}
