#!/usr/bin/env node
// Сообщает Bing, Яндексу и другим поисковикам (IndexNow) об обновлённых страницах.
// Bing — поисковая база ChatGPT и Copilot, поэтому это ускоряет попадание в ответы нейросетей.
//   SITE_URL=https://gigmaps.pages.dev node scripts/indexnow.mjs
import { readFile } from "node:fs/promises";

const SITE = (process.env.SITE_URL || "https://gigmaps.pages.dev").replace(/\/$/, "");
const key = (await readFile(new URL("./indexnow-key.txt", import.meta.url), "utf8")).trim();
const xml = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urls.length) throw new Error("sitemap has no URLs");
for (let i = 0; i < urls.length; i += 10000) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${key}.txt`, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`IndexNow: ${Math.min(i + 10000, urls.length)}/${urls.length} → HTTP ${res.status}`);
}
