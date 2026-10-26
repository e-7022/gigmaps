// Общие функции для скрапера, сборки данных и импорта файлов.
// Без зависимостей: работает в Node 18+ и в GitHub Actions.

export const CATEGORIES = ["audio", "design", "language", "tech", "science", "medicine", "law", "business", "general"];

// Направления micro1 (domain_slug) → категории сайта
const DOMAIN_CATS = {
  "language-audio": ["audio", "language"], "arts-design": ["design"], "software-engineering": ["tech"],
  "ai-machine-learning": ["tech"], "data-analysis": ["tech"], "cybersecurity": ["tech"], "robotics": ["tech"],
  "applied-engineering": ["science"], "sciences-research": ["science"], "medicine": ["medicine"], "law": ["law"],
  finance: ["business"], "business-operations": ["business"], "sales-marketing": ["business"],
  "retail-hospitality": ["business"], education: ["general"], humanities: ["general"], generalist: ["general"], other: [],
};
export const ENGLISH = ["basic", "written", "fluent", "unknown"];
export const STATUSES = ["open", "maybe", "pool", "closed"];

// Страны каталога (ISO) и их английские названия для разбора поля location
export const COUNTRY_NAMES = {
  US: ["united states", "usa", "u.s.", "us only", "us-based", "america"],
  CA: ["canada"],
  MX: ["mexico"],
  AT: ["austria"], BE: ["belgium"], BG: ["bulgaria"], HR: ["croatia"], CY: ["cyprus"],
  CZ: ["czech"], DK: ["denmark"], EE: ["estonia"], FI: ["finland"], FR: ["france"],
  DE: ["germany"], GR: ["greece"], HU: ["hungary"], IE: ["ireland"], IT: ["italy"],
  LV: ["latvia"], LT: ["lithuania"], LU: ["luxembourg"], MT: ["malta"], NL: ["netherlands"],
  PL: ["poland"], PT: ["portugal"], RO: ["romania"], SK: ["slovakia"], SI: ["slovenia"],
  ES: ["spain"], SE: ["sweden"],
  UA: ["ukraine"], MD: ["moldova"], RS: ["serbia"], ME: ["montenegro"], BA: ["bosnia"],
  MK: ["north macedonia", "macedonia"], AL: ["albania"], GE: ["georgia (country)", "tbilisi"],
  AM: ["armenia"], RU: ["russia"], BY: ["belarus"], CN: ["china"],
};
const EU = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"];

const LANGS = {
  ru: "russian", es: "spanish", fr: "french", de: "german", it: "italian", pt: "portuguese",
  zh: "chinese|mandarin|cantonese", ja: "japanese", ko: "korean", ar: "arabic", hi: "hindi",
  tr: "turkish", pl: "polish", uk: "ukrainian", nl: "dutch", sv: "swedish", cs: "czech",
  ro: "romanian", el: "greek", hu: "hungarian", he: "hebrew", vi: "vietnamese", id: "indonesian",
  th: "thai", cnr: "montenegrin", bs: "bosnian", mk: "macedonian", sq: "albanian", ka: "georgian", hy: "armenian",
  be: "belarusian", sk: "slovak", sl: "slovenian", lt: "lithuanian", lv: "latvian", et: "estonian", sr: "serbian", hr: "croatian", bg: "bulgarian", fi: "finnish", da: "danish", no: "norwegian",
};

export function slugify(s) {
  return String(s)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function stripHtml(html = "") {
  return String(html)
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/<\s*(br|\/p|\/li|\/h\d)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

export function detectCategories(text, domain) {
  const t = text.toLowerCase();
  const out = [...(DOMAIN_CATS[domain] ?? [])];
  if (/(music|audio|sound|voice|vocal|singer|podcast|speech|song|lyric|stem|mixing|mastering|daw)/.test(t)) out.push("audio");
  if (/(design|photo|video|visual|art\b|artist|creative|illustrat|animation|3d|film|cinemat|ux|ui\b)/.test(t)) out.push("design");
  if (/(language|bilingual|translat|linguist|native|locali|transcri)/.test(t) || detectLanguage(t)) out.push("language");
  if (!out.length) {
    if (/(software|engineer|developer|coding|python|machine learning|\bml\b|data scien|cyber|security)/.test(t)) out.push("tech");
    else if (/(physician|medical|nurse|doctor|clinical|dentist|pharma|health)/.test(t)) out.push("medicine");
    else if (/(attorney|lawyer|legal|law\b|paralegal)/.test(t)) out.push("law");
    else if (/(financ|accounting|banking|invest|marketing|sales|operations)/.test(t)) out.push("business");
    else if (/(phd|research|chemist|biolog|physic|mathemat|stem)/.test(t)) out.push("science");
  }
  if (!out.length) out.push("general");
  return [...new Set(out)];
}

export function detectLanguage(text) {
  const t = text.toLowerCase();
  for (const [code, re] of Object.entries(LANGS)) {
    if (new RegExp(`\\b(${re})\\b`).test(t)) return code;
  }
  return undefined;
}

export function detectEnglish(text) {
  const t = text.toLowerCase();
  // Уровень по шкале CEFR рядом со словом English: берём минимальный из названных («B2 minimum, C1 preferred» → B2)
  const levels = [...t.matchAll(/english[^.\n]{0,60}?\b([abc][12])\b(?:[^.\n]{0,40}?\b([abc][12])\b)?|\b([abc][12])\b[^.\n]{0,40}english/g)]
    .flatMap((m) => [m[1], m[2], m[3]])
    .filter(Boolean)
    .map((l) => ({ a1: 0, a2: 0, b1: 0, b2: 1, c1: 2, c2: 2 })[l]);
  if (levels.length) return ["basic", "written", "fluent"][Math.min(...levels)];
  if (/(native|fluent|c1|c2|advanced|professional)[^.]{0,40}english|english[^.]{0,30}(fluency|fluent|native|c1|c2)/.test(t)) return "fluent";
  if (/(clear|strong|good)[^.]{0,20}written[^.]{0,20}english|written english/.test(t)) return "written";
  if (/basic english|conversational english/.test(t)) return "basic";
  return "unknown";
}

export function detectDegree(text) {
  return /(master'?s|ph\.?d|doctorate|graduate degree|advanced degree|dma\b)/i.test(text) || undefined;
}

// "$30-45/hr", "$30 – $45 per hour", "USD 40/hour", "$320 per task"
export function parsePay(text) {
  const t = text.replace(/,/g, "");
  const range = t.match(/\$\s?(\d{1,4}(?:\.\d+)?)\s*(?:usd)?\s*(?:\/\s*(?:hr|hour|h)\b)?\s*(?:-|–|—|to)\s*\$?\s?(\d{1,4}(?:\.\d+)?)\s*(?:usd)?\s*(?:\/|per|an?)\s*(hr|hour|h\b|task)/i);
  if (range) return { payMin: Math.round(+range[1]), payMax: Math.round(+range[2]), payUnit: /task/i.test(range[3]) ? "task" : "hour" };
  const single = t.match(/\$\s?(\d{1,4}(?:\.\d+)?)\s*(?:usd)?\s*(?:\/|per|an?)\s*(hr|hour|h\b|task)/i);
  if (single) return { payMin: Math.round(+single[1]), payMax: Math.round(+single[1]), payUnit: /task/i.test(single[2]) ? "task" : "hour" };
  return {};
}

// Возвращает список ISO-кодов из нашего каталога, упомянутых в location
export function countriesFromLocation(loc = "") {
  const t = ` ${String(loc).toLowerCase()} `;
  if (/\b(worldwide|anywhere|global|remote)\b/.test(t) && !/remote\s*[-–(,:]\s*\w/.test(t)) return undefined;
  const found = new Set();
  if (/\b(european union|\beu\b|europe)\b/.test(t)) EU.forEach((c) => found.add(c));
  for (const [cc, names] of Object.entries(COUNTRY_NAMES)) {
    if (names.some((n) => t.includes(n))) found.add(cc);
  }
  if (found.size) return [...found];
  // Указано конкретное место вне каталога (например, «Kuala Lumpur, Malaysia») — вакансия недоступна в наших странах
  if (/[a-z]{3,}/.test(t) && !/\b(remote|worldwide|anywhere|global|multiple|various|online)\b/.test(t)) return ["ZZ"];
  return undefined;
}

// Явные указания страны в названии: «US-based», «(US)», «U.S.», американские штаты и госпрограммы
export function countriesFromTitle(title = "") {
  const t = String(title);
  if (/\b(US|U\.S\.)[- ]?(based|licensed|only)\b|\(US\)|\bU\.S\.|\bUS (Macro|Tax)|American|Alaska|Hawaii|San Francisco|Medicare|\bVA\b|Veterans|National Park|Federal|DoD|Bluebook|BigLaw|AAML|HIPAA|UCMJ/i.test(t)) return ["US"];
  if (/\bLATAM\b/i.test(t)) return ["MX"];
  // «(Egypt-based)», «(Poland-based)»: страна из каталога или ZZ, если её в каталоге нет
  const based = t.match(/\(\s*([A-Z][a-z]+(?: [A-Z][a-z]+)?)[- ]based\s*\)/);
  if (based && !/^(Remote|Home|Office|Field|Cloud|Web|Team|Project)$/i.test(based[1])) {
    const n = based[1].toLowerCase();
    const cc = Object.keys(COUNTRY_NAMES).find((k) => COUNTRY_NAMES[k].some((x) => x === n || x.startsWith(n)));
    return [cc ?? "ZZ"];
  }
  return undefined;
}

export function normalizeJob(raw, warn = () => {}) {
  if (!raw || !raw.title || !raw.platform) {
    warn(`skip: missing title/platform → ${JSON.stringify(raw).slice(0, 120)}`);
    return null;
  }
  const text = `${raw.title} ${raw.description ?? ""}`;
  const id = raw.id ? slugify(raw.id) : slugify(`${raw.platform}-${raw.title}-${raw.externalId ?? ""}`);
  const j = {
    id,
    platform: String(raw.platform).trim().toLowerCase(),
    title: String(raw.title).trim(),
    categories: (Array.isArray(raw.categories) ? raw.categories : String(raw.categories ?? "").split(/[;,|]/))
      .map((c) => String(c).trim().toLowerCase())
      .filter((c) => CATEGORIES.includes(c)),
    english: ENGLISH.includes(raw.english) ? raw.english : detectEnglish(text),
    status: STATUSES.includes(raw.status) ? raw.status : "open",
    source: raw.source ?? "manual",
  };
  if (!j.categories.length) j.categories = detectCategories(String(raw.title), raw.domain);
  const num = (v) => (v === "" || v == null || Number.isNaN(+v) ? undefined : Math.round(+v));
  j.payMin = num(raw.payMin);
  j.payMax = num(raw.payMax);
  if (j.payMin == null && j.payMax == null) Object.assign(j, parsePay(text));
  if (raw.payUnit === "task") j.payUnit = "task";
  j.language = raw.language || detectLanguage(raw.title);
  if (j.language === "en") delete j.language;
  if (raw.degree === true || raw.degree === "true" || raw.degree === "1" || raw.degree === "yes") j.degree = true;
  else if (raw.degree == null || raw.degree === "") j.degree = detectDegree(text);
  if (raw.posted) j.posted = String(raw.posted).slice(0, 10);
  if (raw.url) j.url = String(raw.url).trim();
  if (raw.externalId) j.externalId = String(raw.externalId);
  if (raw.note && typeof raw.note === "object") j.note = raw.note;
  else if (raw.note_en || raw.note_ru) {
    const n = { en: raw.note_en || raw.note_ru, ru: raw.note_ru || raw.note_en, es: raw.note_es || raw.note_en, fr: raw.note_fr || raw.note_en, zh: raw.note_zh || raw.note_en };
    j.note = n;
  }
  if (raw.description && !j.note) j.summary = stripHtml(raw.description).slice(0, 280);
  const split = (v) => (Array.isArray(v) ? v : String(v ?? "").split(/[;,| ]+/)).map((c) => String(c).trim().toUpperCase()).filter((c) => /^[A-Z]{2}$/.test(c));
  const allow = raw.countries?.allow ?? split(raw.countries_allow);
  const deny = raw.countries?.deny ?? split(raw.countries_deny);
  const fromLoc = !allow.length ? (raw.location ? countriesFromLocation(raw.location) : undefined) ?? countriesFromTitle(raw.title) : undefined;
  if (allow.length || deny.length || fromLoc) j.countries = { ...(allow.length || fromLoc ? { allow: allow.length ? allow : fromLoc } : {}), ...(deny.length ? { deny } : {}) };
  for (const k of ["firstSeen", "lastSeen", "closedAt"]) if (raw[k]) j[k] = raw[k];
  for (const k of Object.keys(j)) if (j[k] === undefined) delete j[k];
  return j;
}

// --- CSV (RFC 4180, разделитель запятая или точка с запятой) ---
export function parseCsv(text) {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0];
  const sep = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim() !== ""));
  if (!head) return [];
  const keys = head.map((h) => h.trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

export const CSV_COLUMNS = [
  "id", "platform", "title", "status", "url", "payMin", "payMax", "payUnit", "english", "language", "degree",
  "categories", "posted", "countries_allow", "countries_deny", "note_en", "note_ru", "note_es", "note_fr", "note_zh",
];

export function toCsv(jobs) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [CSV_COLUMNS.join(",")];
  for (const j of jobs) {
    const row = {
      ...j,
      categories: (j.categories || []).join(";"),
      countries_allow: (j.countries?.allow || []).join(";"),
      countries_deny: (j.countries?.deny || []).join(";"),
      degree: j.degree ? "yes" : "",
      note_en: j.note?.en, note_ru: j.note?.ru, note_es: j.note?.es, note_fr: j.note?.fr, note_zh: j.note?.zh,
    };
    lines.push(CSV_COLUMNS.map((k) => esc(row[k])).join(","));
  }
  return lines.join("\n") + "\n";
}

// --- Подробности вакансии: описание в виде блоков + ключевые факты ---
// Блок: {t:"h",x} заголовок · {t:"p",x} абзац · {t:"ul"|"ol",i:[...]} список. Только обычный текст — на сайте он выводится без dangerouslySetInnerHTML.
const MAX_DESC_CHARS = 16000;

function decodeEntities(s) {
  return String(s)
    .replace(/&nbsp;|&#160;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&rsquo;/g, "’").replace(/&lsquo;/g, "‘").replace(/&ndash;/g, "–").replace(/&mdash;/g, "—")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}
const clean = (s) => decodeEntities(s).replace(/[ \t ]+/g, " ").replace(/\s*\n\s*/g, " ").trim();
const looksLikeHeading = (s) => s.length > 0 && s.length <= 70 && !/[.!?]$/.test(s) && (s.endsWith(":") || s === s.toUpperCase());

export function htmlToBlocks(html = "") {
  let src = String(html);
  // Greenhouse отдаёт HTML экранированным (&lt;p&gt;…)
  if (/&lt;\/?[a-z][^&]*&gt;/i.test(src) && !/<(p|div|ul|li|h\d|br)\b/i.test(src)) src = decodeEntities(src);
  src = src.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  const blocks = [];
  let buf = "", boldChars = 0, plainChars = 0, bold = 0, list = null, item = null, head = null;
  const pushPara = () => {
    const x = clean(buf);
    if (x) {
      if (head != null) blocks.push({ t: "h", x: x.replace(/:$/, "") });
      else if (bold === 0 && boldChars > 0 && plainChars === 0 && x.length <= 80 && !/[.!?]$/.test(x)) blocks.push({ t: "h", x: x.replace(/:$/, "") });
      else if (looksLikeHeading(x)) blocks.push({ t: "h", x: x.replace(/:$/, "") });
      else blocks.push({ t: "p", x });
    }
    buf = ""; boldChars = 0; plainChars = 0;
  };
  const closeList = () => {
    if (list && list.i.length) blocks.push(list);
    list = null;
  };
  const re = /<(\/?)([a-z][a-z0-9]*)\b([^>]*)>|([^<]+)/gi;
  let m;
  while ((m = re.exec(src))) {
    if (m[4] !== undefined) {
      const txt = m[4];
      if (item != null) item += txt;
      else {
        buf += txt;
        const n = txt.replace(/\s/g, "").length;
        if (bold > 0) boldChars += n; else plainChars += n;
      }
      continue;
    }
    const close = m[1] === "/", tag = m[2].toLowerCase(), attrs = m[3] || "";
    if (/^h[1-6]$/.test(tag)) {
      if (!close) { if (item == null) { pushPara(); head = true; } } else { pushPara(); head = null; }
    } else if (tag === "p" || tag === "div" || tag === "section" || tag === "tr") {
      if (item == null) pushPara();
    } else if (tag === "br") {
      if (item != null) item += " "; else buf += "\n";
    } else if (tag === "ul" || tag === "ol") {
      if (!close) { if (item == null) { pushPara(); closeList(); } list = list || { t: tag, i: [] }; }
      else if (item == null) closeList();
    } else if (tag === "li") {
      if (!close) {
        if (!list) { pushPara(); list = { t: "ul", i: [] }; }
        if (/data-list=["']ordered/i.test(attrs)) list.t = "ol";
        else if (/data-list=["']bullet/i.test(attrs)) list.t = "ul";
        item = "";
      } else {
        const x = clean(item ?? "");
        if (x && list) list.i.push(x);
        item = null;
      }
    } else if (tag === "strong" || tag === "b") {
      bold += close ? -1 : 1;
      if (bold < 0) bold = 0;
    }
  }
  pushPara();
  closeList();
  return capBlocks(blocks);
}

export function mdToBlocks(text = "") {
  const blocks = [];
  let list = null;
  const inline = (s) => decodeEntities(s)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2").replace(/(^|[\s(])[*_]([^*_]+)[*_](?=[\s).,;:]|$)/g, "$1$2").replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ").trim();
  const flush = () => { if (list && list.i.length) blocks.push(list); list = null; };
  for (const raw of String(text).replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    let m;
    if ((m = line.match(/^#{1,6}\s+(.*)$/))) { flush(); const x = inline(m[1]).replace(/:$/, ""); if (x) blocks.push({ t: "h", x }); continue; }
    if ((m = line.match(/^(?:\*\*|__)([^*_]{2,80}?)(?:\*\*|__):?$/))) { flush(); blocks.push({ t: "h", x: inline(m[1]).replace(/:$/, "") }); continue; }
    if ((m = line.match(/^(?:[-*•▪◦·]|\d+[.)])\s+(.*)$/))) {
      const ordered = /^\d/.test(line);
      if (!list || list.t !== (ordered ? "ol" : "ul")) { flush(); list = { t: ordered ? "ol" : "ul", i: [] }; }
      const x = inline(m[1]);
      if (x) list.i.push(x);
      continue;
    }
    flush();
    const x = inline(line);
    if (!x) continue;
    blocks.push(looksLikeHeading(x) ? { t: "h", x: x.replace(/:$/, "") } : { t: "p", x });
  }
  flush();
  return capBlocks(blocks);
}

function capBlocks(blocks) {
  const out = [];
  let n = 0;
  for (const b of blocks) {
    const len = b.t === "ul" || b.t === "ol" ? b.i.reduce((a, s) => a + s.length, 0) : b.x.length;
    if (n + len > MAX_DESC_CHARS) break;
    n += len;
    out.push(b);
  }
  // заголовок в самом конце без текста под ним бесполезен
  while (out.length && out[out.length - 1].t === "h") out.pop();
  return out;
}

export function blocksToText(blocks = []) {
  return blocks.map((b) => (b.t === "ul" || b.t === "ol" ? b.i.map((s) => `- ${s}`).join("\n") : b.t === "h" ? `${b.x}:` : b.x)).join("\n");
}

// «Label: value» из описания: формат работы, занятость, нагрузка
export function factsFromText(text = "") {
  const f = {};
  const first = (re) => {
    const m = String(text).match(re);
    return m ? m[1].replace(/\s+/g, " ").trim().replace(/[.;]$/, "").slice(0, 140) : undefined;
  };
  f.employment = first(/(?:^|\n)\s*(?:Role Type|Employment Type|Job Type|Engagement(?: Type)?)\s*:\s*([^\n]+)/i);
  f.location = first(/(?:^|\n)\s*Location\s*:\s*([^\n]+)/i);
  f.commitment = first(/(?:^|\n)\s*(?:Time per task|Time Commitment|Hours per week|Commitment|Weekly Commitment|Workload)\s*:\s*([^\n]+)/i);
  f.duration = first(/(?:^|\n)\s*(?:Project )?(?:Duration|Contract length|Contract Duration)\s*:\s*([^\n]+)/i);
  f.startDate = first(/(?:^|\n)\s*Start(?: date)?\s*:\s*([^\n]+)/i);
  return f;
}

// raw: { html? | markdown? | text?, facts? }. Возвращает { blocks, facts } или undefined, если нечего сохранять.
export function normalizeDetails(raw = {}) {
  let blocks = [];
  if (raw.html) blocks = htmlToBlocks(raw.html);
  else if (raw.markdown || raw.text) blocks = mdToBlocks(raw.markdown || raw.text);
  const text = blocksToText(blocks);
  const facts = {};
  const auto = factsFromText(text);
  const put = (k, v) => {
    if (v == null || v === "" || (Array.isArray(v) && !v.length)) return;
    facts[k] = Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean).slice(0, 30).map((s) => s.slice(0, 120)) : typeof v === "number" || typeof v === "boolean" ? v : String(v).trim().slice(0, 140);
  };
  for (const k of ["employment", "workMode", "location", "openings", "hoursPerWeek", "commitment", "duration", "department", "team", "skills", "tags", "referral", "interview", "equity", "startDate", "applicants", "domain", "eligible", "ineligible", "availability", "communication"]) {
    put(k, raw.facts?.[k] || auto[k]);
  }
  // «Role Title / Role Type / Location» в начале описания уже вынесены в факты
  while (blocks.length && /^(role title|job title|position|role type|employment type|job type|location)\s*:/i.test(blocks[0].x || "")) blocks.shift();
  if (!blocks.length && !Object.keys(facts).length) return undefined;
  return { blocks, facts };
}
