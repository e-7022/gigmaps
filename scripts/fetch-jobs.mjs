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
import { blocksToText, detectEnglish, normalizeDetails, normalizeJob, stripHtml } from "./lib/jobs-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data/jobs.scraped.json");
const DETAILS_OUT = path.join(ROOT, "data/jobs.details.json");
const DETAILS_MAX_AGE_DAYS = 7;
const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const FIX = args.includes("--fixtures") ? path.resolve(args[args.indexOf("--fixtures") + 1]) : null;
const today = new Date().toISOString().slice(0, 10);
const UA = "Mozilla/5.0 (compatible; GigmapBot/1.0; +https://github.com/e-7022/gigmaps)";

async function getJson(url, init = {}, src) {
  if (src._import) return src._import;
  if (FIX) return JSON.parse(await readFile(path.join(FIX, `${src.id}.json`), "utf8"));
  const res = await fetch(url, { ...init, headers: { "User-Agent": UA, Accept: "application/json", ...(init.headers || {}) }, signal: AbortSignal.timeout(30000) });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url} ${text.slice(0, 200)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Not JSON from ${url}: ${text.slice(0, 200)}`);
  }
}

const str = (v) => (typeof v === "string" || typeof v === "number" ? v : undefined);
const join = (...a) => a.flat().filter(Boolean).join(", ") || undefined;
const eligList = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : x?.name)).filter(Boolean).join(", ") : str(v)) || undefined;

// Параллельный обход списка с ограничением числа одновременных запросов
async function pool(items, limit, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const item = items[i++];
      try { await fn(item); } catch {}
    }
  }));
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
      details: {
        html: j.content,
        facts: { department: join((j.departments || []).map((d) => d.name)), location: j.location?.name, team: join((j.offices || []).map((o) => o.name)) },
      },
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
        details: {
          html: [j.description || j.descriptionPlain, ...(j.lists || []).map((l) => `<h3>${l.text}</h3><ul>${l.content}</ul>`), j.additional || j.additionalPlain].filter(Boolean).join("\n"),
          facts: {
            department: j.categories?.department, team: j.categories?.team, employment: j.categories?.commitment,
            location: join(j.categories?.location, ...(j.categories?.allLocations || []).filter((l) => l !== j.categories?.location)),
            workMode: j.workplaceType,
          },
        },
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
      details: {
        html: `${j.descriptionHtml || j.descriptionPlain || ""}${j.compensation?.compensationTierSummary ? `<h3>Compensation</h3><p>${j.compensation.compensationTierSummary}</p>` : ""}`,
        facts: {
          department: j.department, team: j.team, employment: j.employmentType,
          workMode: j.workplaceType || (j.isRemote ? "remote" : undefined),
          location: join(j.location, ...(j.secondaryLocations || []).map((l) => l.location)),
        },
      },
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
        details: {
          markdown: j.description,
          facts: {
            workMode: str(j.workArrangement), location: str(j.location), commitment: str(j.commitment), hoursPerWeek: str(j.hoursPerWeek),
            openings: typeof j.remainingSlots === "number" && j.remainingSlots > 0 ? j.remainingSlots : undefined,
            referral: typeof j.referralAmount === "number" && j.referralAmount > 0 ? j.referralAmount : undefined,
            interview: typeof j.interviewDuration === "number" ? j.interviewDuration : undefined,
            equity: j.offersEquity === true ? true : undefined,
            applicants: typeof j.recentCandidatesCount === "number" && j.recentCandidatesCount > 0 ? j.recentCandidatesCount : undefined,
            eligible: eligList(j.eligibleLocation) || eligList(j.eligibleResidenceLocation),
            ineligible: eligList(j.ineligibleLocation) || eligList(j.ineligibleResidenceLocation),
          },
        },
      };
    });
  },
  // micro1: тот же запрос, что делает страница micro1.ai/experts/opportunities
  async micro1(src) {
    const out = [];
    const toDetails = (d) => ({
      html: d.job_description,
      facts: {
        skills: Array.isArray(d.required_skills) ? d.required_skills : undefined,
        tags: Array.isArray(d.job_tags) ? d.job_tags : undefined,
        openings: typeof d.no_of_openings === "number" && d.no_of_openings > 0 ? d.no_of_openings : undefined,
        referral: d.is_referral_enabled && Number(d.referral_reward_amount) > 0 ? Number(d.referral_reward_amount) : undefined,
        location: str(d.location_name), workMode: str(d.location_type), availability: str(d.required_availability),
        communication: str(d.required_communication), startDate: str(d.hire_start_time),
      },
    });
    for (let page = 1; page <= 30; page++) {
      const url = `https://prod-api.micro1.ai/api/v1/job/portal?page=${page}&limit=100&keyword=`;
      const data = FIX || src._import
        ? page === 1 ? await getJson(url, {}, src) : { data: [] }
        : await getJson(
            url,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", Origin: "https://www.micro1.ai", Referer: "https://www.micro1.ai/experts/opportunities" },
              body: JSON.stringify({ action: "get_all_jobs" }),
            },
            src,
          );
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
          ...(j.detail ? { details: toDetails(j.detail) } : {}), // из выгрузки браузера (закладка)
        });
      }
      if (out.length >= (data.total ?? 0) || list.length < 100) break;
    }

    // Полное описание: отдельный запрос на каждую вакансию. Берём только новые и устаревшие (раз в неделю).
    const stale = (id) => {
      const p = src._prevDetails?.[id];
      return !p || (Date.now() - new Date(p.fetched || 0).getTime()) / 864e5 > DETAILS_MAX_AGE_DAYS;
    };
    if (!src._import) {
      const todo = out.filter((o) => !o.details && (FIX || stale(o.externalId)));
      let fx = {};
      if (FIX) try { fx = JSON.parse(await readFile(path.join(FIX, `${src.id}.details.json`), "utf8")); } catch {}
      await pool(todo, 6, async (o) => {
        let d = fx[o.externalId];
        if (!FIX) {
          const res = await fetch("https://prod-api.micro1.ai/api/v1/job/portal", {
            method: "POST",
            headers: { "User-Agent": UA, "Content-Type": "application/json", Origin: "https://www.micro1.ai", Referer: "https://www.micro1.ai/experts/opportunities" },
            body: JSON.stringify({ action: "get_job_description", job_id: o.externalId }),
            signal: AbortSignal.timeout(20000),
          });
          if (res.ok) d = (await res.json())?.data;
        }
        if (d) o.details = toDetails(d);
      });
    }
    for (const o of out) {
      if (o.details?.html) {
        const text = blocksText(o.details);
        const e = detectEnglish(text);
        if (e !== "unknown") o.english = e;
        // «$140 per approved task» без почасовой ставки → оплата за задание
        if (/\$\s?\d[^.\n]{0,25}per (approved |completed )?(task|project)/i.test(text) && !/(per hour|\/\s?hour|\/\s?hr|hourly)/i.test(text)) o.payUnit = "task";
      }
    }
    return out;
  },
  async json(src) {
    const data = await getJson(src.url, {}, src);
    return Array.isArray(data) ? data : data.jobs || [];
  },
};

const blocksText = (d) => blocksToText(normalizeDetails(d)?.blocks || []);

const IMPORT_MAX_AGE_DAYS = 3;
async function readImport(id) {
  try {
    const imp = JSON.parse(await readFile(path.join(ROOT, "data/import", `${id}.json`), "utf8"));
    const age = (Date.now() - new Date(imp.fetchedAt).getTime()) / 864e5;
    return age <= IMPORT_MAX_AGE_DAYS ? imp : null;
  } catch {
    return null;
  }
}

async function main() {
  const cfg = JSON.parse(await readFile(path.join(ROOT, "scripts/sources.json"), "utf8"));
  let prev = [];
  try {
    prev = JSON.parse(await readFile(OUT, "utf8"));
  } catch {}
  const prevById = new Map(prev.map((j) => [j.id, j]));
  const result = new Map(prev.map((j) => [j.id, j]));
  let prevDetails = {};
  try {
    prevDetails = JSON.parse(await readFile(DETAILS_OUT, "utf8"));
  } catch {}
  const details = { ...prevDetails };
  const report = [];
  let okSources = 0;

  for (const src of cfg.sources.filter((s) => s.enabled)) {
    const inc = src.include ? new RegExp(src.include, "i") : null;
    const exc = src.exclude ? new RegExp(src.exclude, "i") : null;
    src._prevDetails = Object.fromEntries(Object.entries(prevDetails).filter(([id]) => prevById.get(id)?.source === src.id).map(([id, d]) => [prevById.get(id)?.externalId, d]));
    try {
      let raw;
      try {
        raw = await adapters[src.type](src);
        if (!raw.length) throw new Error("source returned 0 jobs");
      } catch (e) {
        // Запасной вариант: файл, выгруженный из браузера и загруженный через админку (data/import/<id>.json)
        const imp = await readImport(src.id);
        if (!imp) throw e;
        src._import = imp;
        raw = await adapters[src.type](src);
        report.push(`  ${src.id}: live fetch failed (${e.message.slice(0, 80)}), used import from ${imp.fetchedAt}`);
      }
      const seen = new Set();
      let added = 0;
      for (const r of raw) {
        if (!r.title || (inc && !inc.test(r.title)) || (exc && exc.test(r.title))) continue;
        const j = normalizeJob({ ...r, platform: src.platform, source: src.id, id: `${src.platform}-${r.title}-${r.externalId}` }, (w) => console.warn(`  [${src.id}] ${w}`));
        if (!j) continue;
        const old = prevById.get(j.id);
        if (!old) added++;
        const det = r.details ? normalizeDetails(r.details) : undefined;
        if (det) {
          details[j.id] = { ...det, fetched: today };
          const lead = det.blocks.find((b) => b.t === "p" && b.x.length >= 80 && !/^(role|location|pay|time|next step|your tasks|job title|position)\b[^:]{0,20}:/i.test(b.x));
          if (lead) j.summary = lead.x.length > 280 ? `${lead.x.slice(0, 277).replace(/\s+\S*$/, "")}…` : lead.x;
        }
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
      if (!raw.length) throw new Error("source returned 0 jobs — keeping previous data");
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

  // описания хранятся только для вакансий, которые остались в файле
  const keep = new Set(out.map((j) => j.id));
  const detailsOut = Object.fromEntries(Object.entries(details).filter(([id]) => keep.has(id)).sort(([a], [b]) => a.localeCompare(b)));

  console.log(report.join("\n"));
  console.log(`Details: ${Object.keys(detailsOut).length} jobs with description`);
  console.log(`Total: ${out.length} jobs (${out.filter((j) => j.status !== "closed").length} open)`);
  if (!DRY) {
    await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
    await writeFile(DETAILS_OUT, "{\n" + Object.entries(detailsOut).map(([id, d]) => `${JSON.stringify(id)}:${JSON.stringify(d)}`).join(",\n") + "\n}\n");
    await writeFile(path.join(ROOT, "data/scrape-report.json"), JSON.stringify({ date: new Date().toISOString(), total: out.length, open: out.filter((j) => j.status !== "closed").length, sources: report }, null, 2) + "\n");
  }
  if (okSources === 0 && cfg.sources.some((s) => s.enabled)) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
