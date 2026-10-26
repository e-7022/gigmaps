#!/usr/bin/env node
// Собирает итоговый список вакансий перед сборкой сайта (запускается автоматически в npm run build/dev).
// Источники по приоритету (одинаковый id → побеждает верхний):
//   1. data/jobs.upload.csv | data/jobs.upload.json  — файл из админки
//   2. data/jobs.manual.json                          — ручной список
//   3. data/jobs.scraped.json                         — результат скрапера
// Результат: src/data/generated/jobs.json, public/data/jobs.csv, public/data/jobs.json

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeDetails, normalizeJob, parseCsv, toCsv } from "./lib/jobs-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const p = (f) => path.join(ROOT, f);

async function readMaybe(f) {
  try {
    return await readFile(p(f), "utf8");
  } catch {
    return null;
  }
}

async function load(f) {
  const txt = await readMaybe(f);
  if (txt == null) return [];
  if (f.endsWith(".csv")) return parseCsv(txt);
  const data = JSON.parse(txt);
  return Array.isArray(data) ? data : data.jobs || [];
}

const warnings = [];
const warn = (m) => warnings.push(m);

const platformSrc = await readFile(p("src/data/platforms.ts"), "utf8");
const PLATFORMS = new Set([...platformSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));

const layers = [
  ["upload", [...(await load("data/jobs.upload.csv")), ...(await load("data/jobs.upload.json"))]],
  ["manual", await load("data/jobs.manual.json")],
  ["scraped", await load("data/jobs.scraped.json")],
];

// Строки без id из админки сопоставляем с существующими вакансиями по «платформа + название»
const titleKey = (r) => `${String(r.platform ?? "").trim().toLowerCase()}|${String(r.title ?? "").trim().toLowerCase()}`;
const idByTitle = new Map();
for (const [, list] of layers.slice(1)) for (const r of list) if (r.id && !idByTitle.has(titleKey(r))) idByTitle.set(titleKey(r), r.id);

const manualDetails = {};
const byId = new Map();
const byUrl = new Map();
const byTitle = new Map();
const normUrl = (u) => (u ? String(u).split(/[?#]/)[0].replace(/\/$/, "").toLowerCase() : "");
for (const [name, list] of layers) {
  for (const raw0 of list) {
    const raw = !raw0.id && idByTitle.has(titleKey(raw0)) ? { ...raw0, id: idByTitle.get(titleKey(raw0)) } : raw0;
    const j = normalizeJob({ source: name, ...raw }, warn);
    if (!j) continue;
    if (!PLATFORMS.has(j.platform)) {
      warn(`skip ${j.id}: unknown platform "${j.platform}" (add it to src/data/platforms.ts)`);
      continue;
    }
    if (byId.has(j.id)) continue;
    // Вакансия из скрапера, которая уже есть в ручном списке (та же ссылка или название): берём её статус, карточку оставляем ручную
    if (name === "scraped") {
      const twin = byUrl.get(normUrl(j.url)) || byTitle.get(titleKey(j));
      if (twin) {
        if (j.status === "closed" && twin.status !== "closed") Object.assign(twin, { status: "closed", closedAt: j.closedAt });
        if (j.lastSeen) twin.lastSeen = j.lastSeen;
        continue;
      }
    }
    // Описание, добавленное вручную в jobs.manual.json (поле details: {markdown|html|text, facts}), важнее скрапера
    if (raw.details && typeof raw.details === "object") {
      const d = normalizeDetails(raw.details);
      if (d) manualDetails[j.id] = d;
    }
    byId.set(j.id, j);
    if (j.url) byUrl.set(normUrl(j.url), j);
    byTitle.set(titleKey(j), j);
  }
}

const jobs = [...byId.values()].sort((a, b) => a.platform.localeCompare(b.platform) || a.title.localeCompare(b.title));

// Реферальные ссылки
let referrals = {};
const refTxt = await readMaybe("data/referrals.json");
if (refTxt) {
  try {
    referrals = JSON.parse(refTxt);
  } catch (e) {
    warn(`data/referrals.json is not valid JSON: ${e.message}`);
  }
}
for (const k of Object.keys(referrals)) if (!k.startsWith("_") && !PLATFORMS.has(k)) warn(`referrals.json: unknown platform "${k}"`);

// Описания вакансий (data/jobs.details.json ведёт скрапер) → только для вакансий, которые попали на сайт
let scrapedDetails = {};
const detTxt = await readMaybe("data/jobs.details.json");
if (detTxt) {
  try {
    scrapedDetails = JSON.parse(detTxt);
  } catch (e) {
    warn(`data/jobs.details.json is not valid JSON: ${e.message}`);
  }
}
const details = {};
for (const j of jobs) {
  const d = manualDetails[j.id] ?? scrapedDetails[j.id];
  if (d && (d.blocks?.length || Object.keys(d.facts || {}).length)) details[j.id] = d;
}

await mkdir(p("src/data/generated"), { recursive: true });
await mkdir(p("public/data"), { recursive: true });
await writeFile(p("src/data/generated/jobs.json"), JSON.stringify(jobs));
await writeFile(p("src/data/generated/referrals.json"), JSON.stringify(referrals));
await writeFile(p("src/data/generated/details.json"), JSON.stringify(details));
await writeFile(p("public/data/jobs.json"), JSON.stringify(jobs, null, 1));
await writeFile(p("public/data/jobs.csv"), "﻿" + toCsv(jobs));

const open = jobs.filter((j) => j.status !== "closed").length;
console.log(`build-data: ${Object.keys(details).length} jobs with full description`);
console.log(`build-data: ${jobs.length} jobs (${open} open, ${jobs.length - open} closed) from ${layers.map(([n, l]) => `${n}=${l.length}`).join(", ")}`);
for (const w of warnings) console.warn(`  ⚠ ${w}`);
