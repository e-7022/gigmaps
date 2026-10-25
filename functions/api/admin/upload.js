import { checkAuth, deleteFile, json, putFile } from "../../_lib/github.js";

const MAX = 5 * 1024 * 1024;

function csvHeader(text) {
  const first = text.replace(/^﻿/, "").split(/\r?\n/, 1)[0] || "";
  return first.split(/[;,]/).map((h) => h.replace(/"/g, "").trim());
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return json({ error: "Wrong password" }, 401);
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Expected multipart form data" }, 400);
  }
  const kind = form.get("kind");
  const file = form.get("file");
  if (!file || typeof file === "string") return json({ error: "No file attached" }, 400);
  if (file.size > MAX) return json({ error: "File is larger than 5 MB" }, 413);
  const name = (file.name || "").toLowerCase();
  const text = await file.text();
  const isCsv = name.endsWith(".csv");

  try {
    if (kind === "jobs") {
      let count;
      if (isCsv) {
        const head = csvHeader(text);
        if (!head.includes("platform") || !head.includes("title")) return json({ error: "CSV must have at least the columns: platform, title" }, 400);
        count = text.split(/\r?\n/).filter((l) => l.trim()).length - 1;
      } else {
        const data = JSON.parse(text);
        const list = Array.isArray(data) ? data : data.jobs;
        if (!Array.isArray(list)) return json({ error: "JSON must be an array of jobs or { jobs: [...] }" }, 400);
        if (list.some((j) => !j || !j.title || !j.platform)) return json({ error: "Every job needs platform and title" }, 400);
        count = list.length;
      }
      const target = isCsv ? "data/jobs.upload.csv" : "data/jobs.upload.json";
      const other = isCsv ? "data/jobs.upload.json" : "data/jobs.upload.csv";
      const msg = `chore(data): admin upload ${count} jobs (${file.name})`;
      await putFile(env, target, text, msg);
      await deleteFile(env, other, "chore(data): replace previous admin upload");
      return json({ ok: true, count, message: `Uploaded ${count} jobs. The site will rebuild in ~2–3 minutes.` });
    }

    if (kind === "referrals") {
      let obj = {};
      if (isCsv) {
        const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
        const head = lines.shift().split(/[;,]/).map((h) => h.trim().toLowerCase());
        const ip = head.indexOf("platform"), iu = head.indexOf("url"), ic = head.indexOf("code");
        if (ip < 0) return json({ error: "CSV must have columns: platform, url (and optionally code)" }, 400);
        for (const l of lines) {
          const c = l.split(/[;,]/);
          obj[c[ip].trim()] = { url: (c[iu] || "").trim(), code: (c[ic] || "").trim() };
        }
      } else {
        obj = JSON.parse(text);
        if (!obj || typeof obj !== "object" || Array.isArray(obj)) return json({ error: "JSON must be an object: { platform: { url, code } }" }, 400);
      }
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith("_")) continue;
        if (v?.url && !/^https:\/\//.test(v.url)) return json({ error: `Referral URL for ${k} must start with https://` }, 400);
      }
      await putFile(env, "data/referrals.json", JSON.stringify(obj, null, 2) + "\n", "chore(data): update referral links");
      return json({ ok: true, message: "Referral links saved. The site will rebuild in ~2–3 minutes." });
    }

    return json({ error: "Unknown upload kind" }, 400);
  } catch (e) {
    return json({ error: e.message || String(e) }, 400);
  }
}
