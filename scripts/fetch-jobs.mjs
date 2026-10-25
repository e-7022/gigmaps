#!/usr/bin/env node
// Скачивает вакансии из открытых API систем найма и обновляет data/jobs.scraped.json.
//
//   node scripts/fetch-jobs.mjs                  обычный запуск
//   node scripts/fetch-jobs.mjs --dry-run        показать изменения, ничего не записывать
//   node scripts/fetch-jobs.mjs --fixtures DIR   брать ответы из DIR/<source-id>.json (для тестов)
//
// Правила:
// - новая вакансия → status "open", firstSeen = сегодня
// - вакансия пропала из ответа источника → status "closed", closedAt = сегодня (сохраняется retentionDays дней)
// - источник упал → его вакансии не трогаем (не помечаем закрытыми)

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeJob, stripHtml } from "./lib/jobs-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data/jobs.scraped.json");
const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const FIX = args.includes("--fixtures") ? path.resolve(args[args.indexOf("--fixtures") + 1]) : null;
const today = new Date().toISOString().slice(0, 10);
const UA = "GigmapBot/1.0 (+https://github.com/e-7022/gigmaps)";

async function getJson(url, init = {}, src) {
  if (FIX) return JSON.parse(await readFile(path.join(FIX, `${src.id}.json`), "utf8"));
  const res = await fetch(url, { ...init, headers: { "User-Agent": UA, Accept: "application/json", ...(init.headers || {}) }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

const adapters = {
  async greenhouse(src) {
    const data = await getJson(`https://boards-api.greenhouse.io/v1/boards/${src.token}/jobs?content=true`, {}, src);
    return (data.jobs || []).map((j) => ({
      externalId: String(j.id),
      title: j.title,
      url: j.absolute_url,
      location: j.location?.name,
      posted: j.first_published || j.updated_at,
      description: stripHtml(j.content || ""),
    }));
  },
  async lever(src) {
    const data = await getJson(`https://api.lever.co/v0/postings/${src.token}?mode=json`, {}, src);
    return (Array.isArray(data) ? data : []).map((j) => {
      const sal = j.salaryRange;
      const hourly = sal && /hour/i.test(sal.interval || "");
      return {
        externalId: j.id,
        title: j.text,
        url: j.hostedUrl,
        location: [j.categories?.location, ...(j.categories?.allLocations || [])].filter(Boolean).join(", "),
        posted: j.createdAt ? new Date(j.createdAt).toISOString() : undefined,
        description: [j.descriptionPlain, ...(j.lists || []).map((l) => `${l.text}: ${stripHtml(l.content)}`), j.additionalPlain].filter(Boolean).join("\n"),
        ...(hourly ? { payMin: sal.min, payMax: sal.max } : {}),
      };
    });
  },
  async ashby(src) {
    const data = await getJson(`https://api.ashbyhq.com/posting-api/job-board/${src.token}?includeCompensation=true`, {}, src);
    return (data.jobs || []).map((j) => ({
      externalId: j.id,
      title: j.title,
      url: j.jobUrl,
      location: [j.location, ...(j.secondaryLocations || []).map((l) => l.location)].filter(Boolean).join(", "),
      posted: j.publishedAt,
      description: `${j.descriptionPlain || ""}\n${j.compensation?.compensationTierSummary || ""}`,
    }));
  },
  async mercor(src) {
    const data = await getJson(src.url, {}, src);
    const list = Array.isArray(data) ? data : data.listings || data.data || [];
    if (!Array.isArray(list)) throw new Error("unexpected Mercor response shape");
    return list.map((j) => {
      const hourly = /hour/i.test(j.salaryFrequency || j.rateFrequency || "hour");
      return {
        externalId: j.listingId || j.id,
        title: j.jobTitle || j.title,
        url: `https://work.mercor.com/jobs/${j.listingId || j.id}`,
        location: Array.isArray(j.eligibleLocations) && j.eligibleLocations.length ? j.eligibleLocations.join(", ") : j.location,
        countries_allow: Array.isArray(j.eligibleLocations) ? j.eligibleLocations.filter((c) => /^[A-Z]{2}$/.test(c)).join(";") : "",
        posted: j.postedDate || j.createdAt,
        description: stripHtml(j.description || ""),
        ...(hourly && (j.salaryMin || j.rateMin) ? { payMin: j.salaryMin ?? j.rateMin, payMax: j.salaryMax ?? j.rateMax ?? j.salaryMin } : {}),
      };
    });
  },
  // micro1: тот же запрос, что делает страница micro1.ai/experts/opportunities
  async micro1(src) {
    const out = [];
    for (let page = 1; page <= 30; page++) {
      const url = `https://prod-api.micro1.ai/api/v1/job/portal?page=${page}&limit=100&keyword=`;
      const data = FIX
        ? page === 1 ? await getJson(url, {}, src) : { data: [] }
        : await getJson(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "get_all_jobs" }) }, src);
      const list = data.data || [];
      if (!list.length) break;
      for (const j of list) {
        const rate = j.ideal_hourly_rate;
        // штатные вакансии самой micro1 (full-time или годовой оклад) — не AI-тренинг
        if (j.engagement_type === "full-time" || (rate?.max && rate.max >= 1000) || j.ideal_yearly_compensation) continue;
        const hourly = rate && rate.max && rate.max < 1000;
        out.push({
          externalId: j.job_id,
          title: String(j.job_name || "").trim(),
          url: `https://jobs.micro1.ai/post/${j.job_id}`,
          posted: j.date_posted,
          domain: j.domain_slug,
          description: (j.skills || []).join(", "),
          ...(hourly ? { payMin: rate.min ?? rate.max, payMax: rate.max } : {}),
        });
      }
      if (out.length >= (data.total ?? 0) || list.length < 100) break;
    }
    return out;
  },
  async json(src) {
    const data = await getJson(src.url, {}, src);
    return Array.isArray(data) ? data : data.jobs || [];
  },
};

async function main() {
  const cfg = JSON.parse(await readFile(path.join(ROOT, "scripts/sources.json"), "utf8"));
  let prev = [];
  try {
    prev = JSON.parse(await readFile(OUT, "utf8"));
  } catch {}
  const prevById = new Map(prev.map((j) => [j.id, j]));
  const result = new Map(prev.map((j) => [j.id, j]));
  const report = [];
  let okSources = 0;

  for (const src of cfg.sources.filter((s) => s.enabled)) {
    const inc = src.include ? new RegExp(src.include, "i") : null;
    const exc = src.exclude ? new RegExp(src.exclude, "i") : null;
    try {
      const raw = await adapters[src.type](src);
      const seen = new Set();
      let added = 0;
      for (const r of raw) {
        if (!r.title || (inc && !inc.test(r.title)) || (exc && exc.test(r.title))) continue;
        const j = normalizeJob({ ...r, platform: src.platform, source: src.id, id: `${src.platform}-${r.title}-${r.externalId}` }, (w) => console.warn(`  [${src.id}] ${w}`));
        if (!j) continue;
        const old = prevById.get(j.id);
        if (!old) added++;
        j.firstSeen = old?.firstSeen || today;
        j.lastSeen = today;
        j.status = "open";
        delete j.closedAt;
        result.set(j.id, j);
        seen.add(j.id);
      }
      let closed = 0;
      for (const j of prev) {
        if (j.source === src.id && !seen.has(j.id) && j.status !== "closed") {
          result.set(j.id, { ...j, status: "closed", closedAt: today });
          closed++;
        }
      }
      okSources++;
      report.push(`✓ ${src.id}: ${seen.size} open (${added} new), ${closed} closed`);
    } catch (e) {
      report.push(`✗ ${src.id}: ${e.message} — previous data kept`);
    }
  }

  // Удаляем закрытые вакансии старше retentionDays
  const cutoff = new Date(Date.now() - (cfg.retentionDays ?? 90) * 864e5).toISOString().slice(0, 10);
  const out = [...result.values()]
    .filter((j) => !(j.status === "closed" && j.closedAt && j.closedAt < cutoff))
    .sort((a, b) => a.platform.localeCompare(b.platform) || a.title.localeCompare(b.title));

  console.log(report.join("\n"));
  console.log(`Total: ${out.length} jobs (${out.filter((j) => j.status !== "closed").length} open)`);
  if (!DRY) await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  if (okSources === 0 && cfg.sources.some((s) => s.enabled)) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
