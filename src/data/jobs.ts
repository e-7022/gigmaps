import type { L } from "@/i18n/config";
import { SANCTIONED } from "./countries";
import { bestPayout, type PayoutStatus } from "./rails";
import { getPlatform, platformElig, type Elig, type Platform } from "./platforms";

export type Category = "audio" | "design" | "language" | "general";
export type English = "basic" | "written" | "fluent" | "unknown";
export type JobStatus = "open" | "maybe" | "pool" | "closed";

export interface Job {
  id: string;
  platform: string;
  title: string; // официальное название вакансии (на английском, как у работодателя)
  categories: Category[];
  payMin?: number;
  payMax?: number;
  payUnit?: "hour" | "task";
  english: English;
  language?: string; // требуемый язык (ISO 639-1), помимо английского
  degree?: boolean; // нужна учёная степень
  status: JobStatus;
  posted?: string; // YYYY-MM-DD или YYYY-MM
  url?: string; // прямая ссылка на вакансию
  note?: L;
  countries?: { allow?: string[]; deny?: string[] }; // ограничения конкретной вакансии
}

const n = (en: string, ru: string, es: string, fr: string, zh: string): L => ({ en, ru, es, fr, zh });

export const jobs: Job[] = [
  {
    id: "micro1-music-sound-annotation",
    platform: "micro1",
    title: "Music & Sound Annotation Expert",
    categories: ["audio"],
    payMin: 30,
    payMax: 45,
    english: "written",
    status: "maybe",
    posted: "2026-09-03",
    url: "https://jobs.micro1.ai/post/43067af3-efeb-435d-aeb9-6d1de8c2af0a",
    note: n(
      "3+ years of music or audio work; identify tempo, key and instruments by ear; 20–25 h/week.",
      "3+ года в музыке или аудио; темп, тональность и инструменты на слух; 20–25 ч/нед.",
      "3+ años en música o audio; identificar tempo, tonalidad e instrumentos de oído; 20–25 h/semana.",
      "3+ ans en musique ou audio ; reconnaître tempo, tonalité et instruments à l’oreille ; 20–25 h/sem.",
      "3 年以上音乐或音频经验；能听辨速度、调性和乐器；每周 20–25 小时。",
    ),
  },
  {
    id: "micro1-sound-designer",
    platform: "micro1",
    title: "Sound Designer",
    categories: ["audio"],
    payMin: 21,
    payMax: 35,
    english: "written",
    status: "open",
    posted: "2026-10",
  },
  {
    id: "micro1-russian-audio-engineer",
    platform: "micro1",
    title: "Russian Audio Engineer Expert",
    categories: ["audio", "language"],
    payMin: 24,
    payMax: 56,
    english: "fluent",
    language: "ru",
    status: "open",
    posted: "2026-03-08",
    url: "https://jobs.micro1.ai/post/71d0fb0c-b47b-4dfb-afa3-5bbc8a25b2e5",
  },
  {
    id: "micro1-russian-language-specialist",
    platform: "micro1",
    title: "Russian Language Specialist",
    categories: ["language"],
    payMin: 30,
    payMax: 60,
    english: "written",
    language: "ru",
    status: "open",
    url: "https://jobs.micro1.ai/post/997987b8-0be6-4483-a9b3-9a3e442c521c",
  },
  {
    id: "alignerr-audio-engineer",
    platform: "alignerr",
    title: "Audio Engineer (AI Training)",
    categories: ["audio"],
    payMin: 40,
    payMax: 80,
    english: "unknown",
    status: "maybe",
    posted: "2026-04-18",
    note: n(
      "EQ, compression, stereo imaging, gain staging, any DAW (Ableton listed). One test attempt.",
      "EQ, компрессия, стереобаза, гейн-стейджинг, любая DAW (Ableton указан). Одна попытка теста.",
      "EQ, compresión, imagen estéreo, ganancia, cualquier DAW (Ableton incluido). Un solo intento.",
      "EQ, compression, image stéréo, gain staging, toute DAW (Ableton cité). Un seul essai.",
      "EQ、压缩、立体声像、增益结构，任意 DAW（含 Ableton）。仅一次测试机会。",
    ),
  },
  {
    id: "alignerr-audio-quality-reviewer",
    platform: "alignerr",
    title: "Audio Quality Reviewer",
    categories: ["audio"],
    english: "unknown",
    status: "pool",
  },
  {
    id: "meridial-stem-separation",
    platform: "meridial",
    title: "Stem Source Separation Expert",
    categories: ["audio"],
    payMin: 20,
    payMax: 20,
    english: "unknown",
    status: "open",
    posted: "2026-08-10",
    note: n(
      "Identify instruments in short clips for separation into 4–6+ stems.",
      "Определять инструменты в коротких фрагментах для разделения на 4–6+ стемов.",
      "Identificar instrumentos en clips cortos para separarlos en 4–6+ stems.",
      "Identifier les instruments dans de courts extraits pour les séparer en 4 à 6+ stems.",
      "在短片段中识别乐器，用于分离为 4–6 个以上分轨。",
    ),
  },
  {
    id: "meridial-russian-voice-actor",
    platform: "meridial",
    title: "Russian Voice Actor",
    categories: ["audio", "language"],
    english: "unknown",
    language: "ru",
    status: "open",
  },
  {
    id: "meridial-audio-specialist",
    platform: "meridial",
    title: "Audio Specialist",
    categories: ["audio"],
    payMin: 11,
    payMax: 30,
    english: "unknown",
    status: "open",
  },
  {
    id: "meridial-audio-editor",
    platform: "meridial",
    title: "Audio Editor",
    categories: ["audio"],
    payMin: 15,
    payMax: 30,
    english: "unknown",
    status: "open",
  },
  {
    id: "mindrift-ai-tutor",
    platform: "mindrift",
    title: "AI Tutor (expert projects)",
    categories: ["general"],
    payMin: 15,
    payMax: 100,
    english: "unknown",
    status: "pool",
    note: n(
      "Entry level $15–30/h; domain experts $60–100+/h. Projects open periodically.",
      "Начальный уровень $15–30/ч; эксперты $60–100+/ч. Проекты открываются периодически.",
      "Nivel inicial $15–30/h; expertos $60–100+/h. Los proyectos se abren periódicamente.",
      "Débutant 15–30 $/h ; experts 60–100+ $/h. Projets ouverts par vagues.",
      "入门 15–30 美元/小时；领域专家 60–100+ 美元/小时。项目不定期开放。",
    ),
  },
  {
    id: "rex-creative-generalist",
    platform: "rex",
    title: "Creative & Generalist Expert",
    categories: ["design", "general"],
    payMin: 35,
    payMax: 65,
    english: "basic",
    degree: true,
    status: "pool",
  },
  {
    id: "outlier-music-expert",
    platform: "outlier",
    title: "Music Expert",
    categories: ["audio"],
    payMax: 320,
    payUnit: "task",
    english: "unknown",
    degree: true,
    status: "open",
    url: "https://outlier.ai/experts/music",
    note: n(
      "Degree in music theory or composition; not for hobbyists or performers only.",
      "Профильная степень по теории музыки или композиции; не для любителей и исполнителей.",
      "Título en teoría musical o composición; no para aficionados ni solo intérpretes.",
      "Diplôme en théorie musicale ou composition ; pas pour amateurs ou interprètes seuls.",
      "需音乐理论或作曲学位；不适合业余爱好者或纯演奏者。",
    ),
  },
  {
    id: "outlier-generalist",
    platform: "outlier",
    title: "AI Trainer – Generalist / Writer",
    categories: ["general", "language"],
    payMin: 15,
    payMax: 40,
    english: "written",
    status: "pool",
  },
  {
    id: "turing-digital-creative",
    platform: "turing",
    title: "Digital Creative Expert",
    categories: ["design"],
    payMin: 30,
    payMax: 70,
    english: "fluent",
    status: "open",
    posted: "2026-09-09",
    note: n(
      "Hands-on Photoshop, Premiere, Illustrator, Blender, FL Studio or DaVinci Resolve. Rate is an estimate.",
      "Практика в Photoshop, Premiere, Illustrator, Blender, FL Studio или DaVinci Resolve. Ставка — оценка.",
      "Experiencia con Photoshop, Premiere, Illustrator, Blender, FL Studio o DaVinci Resolve. Tarifa estimada.",
      "Pratique de Photoshop, Premiere, Illustrator, Blender, FL Studio ou DaVinci Resolve. Tarif estimé.",
      "熟练使用 Photoshop、Premiere、Illustrator、Blender、FL Studio 或 DaVinci Resolve。报酬为估算。",
    ),
  },
  {
    id: "turing-music-domain-expert",
    platform: "turing",
    title: "Music Domain Expert",
    categories: ["audio"],
    payMin: 40,
    payMax: 50,
    english: "fluent",
    degree: true,
    status: "open",
  },
  {
    id: "telus-music-audio-community",
    platform: "telus-digital",
    title: "AI Music & Audio Expert Community",
    categories: ["audio"],
    payMin: 5,
    payMax: 25,
    english: "unknown",
    status: "open",
    posted: "2026-10-20",
    url: "https://www.telusinternational.ai/cmp/public/jobs/available/129508",
  },
  {
    id: "pareto-ai-trainer",
    platform: "pareto",
    title: "AI Trainer",
    categories: ["general"],
    english: "unknown",
    status: "pool",
    url: "https://pareto.ai/careers/ai-trainer",
  },
  {
    id: "invisible-ai-trainer",
    platform: "invisible",
    title: "AI Trainer (language & reasoning)",
    categories: ["general", "language"],
    payMin: 8,
    payMax: 65,
    english: "written",
    status: "pool",
  },
  {
    id: "xai-ai-tutor-russian",
    platform: "xai",
    title: "AI Tutor – Russian",
    categories: ["language"],
    english: "written",
    language: "ru",
    status: "open",
  },
  {
    id: "xai-ai-tutor-audio-editing",
    platform: "xai",
    title: "AI Tutor – Audio Editing",
    categories: ["audio"],
    payMin: 30,
    payMax: 75,
    english: "written",
    status: "closed",
  },
  {
    id: "appen-local-projects",
    platform: "appen",
    title: "Local Language & Speech Projects",
    categories: ["language", "general"],
    payMin: 15,
    payMax: 25,
    english: "basic",
    status: "pool",
    note: n(
      "Paid per recording session; projects are tied to your country and native language.",
      "Оплата за сессию записи; проекты привязаны к стране и родному языку.",
      "Pago por sesión de grabación; proyectos ligados a tu país e idioma nativo.",
      "Payé par session d’enregistrement ; projets liés à votre pays et langue maternelle.",
      "按录音场次付费；项目与所在国家和母语挂钩。",
    ),
  },
  {
    id: "oneforma-language-projects",
    platform: "oneforma",
    title: "Language & Data Projects",
    categories: ["language", "general"],
    english: "basic",
    status: "pool",
  },
  {
    id: "clickworker-microtasks",
    platform: "clickworker",
    title: "Microtasks & UHRS",
    categories: ["general"],
    english: "basic",
    status: "open",
  },
  {
    id: "snorkel-arts-expert",
    platform: "snorkel",
    title: "Humanities & Arts Expert",
    categories: ["design"],
    english: "fluent",
    degree: true,
    status: "pool",
  },
  {
    id: "mercor-language-audio",
    platform: "mercor",
    title: "Language & Audio Expert",
    categories: ["audio", "language"],
    payMin: 35,
    payMax: 50,
    english: "fluent",
    status: "pool",
  },
  {
    id: "mercor-music-lyrics-russian",
    platform: "mercor",
    title: "Music & Lyrics Expert – Russian",
    categories: ["audio", "language"],
    payMin: 35,
    payMax: 49,
    english: "fluent",
    language: "ru",
    status: "open",
  },
  {
    id: "mercor-visual-designers",
    platform: "mercor",
    title: "Visual Designers (Arts & Design)",
    categories: ["design"],
    payMin: 60,
    payMax: 80,
    english: "fluent",
    status: "open",
    url: "https://work.mercor.com/jobs/list_AAABmFZVyd1yM6csqB1IUJCq/visual-designers",
  },
  {
    id: "mercor-photography",
    platform: "mercor",
    title: "Photography Experts",
    categories: ["design"],
    english: "fluent",
    status: "open",
    url: "https://work.mercor.com/jobs/list_AAABmKEKq-ubzWVW1NFGoZW-/photography-experts",
  },
  {
    id: "dataannotation-russian",
    platform: "dataannotation",
    title: "Russian Bilingual Annotator",
    categories: ["language"],
    payMin: 20,
    payMax: 40,
    english: "written",
    language: "ru",
    status: "open",
    url: "https://dataannotation.tech/russian-ru",
  },
  {
    id: "dataannotation-generalist",
    platform: "dataannotation",
    title: "AI Trainer – Generalist",
    categories: ["general"],
    payMin: 20,
    payMax: 40,
    english: "fluent",
    status: "open",
    countries: { allow: ["US", "CA", "IE"] },
  },
  {
    id: "prolific-studies",
    platform: "prolific",
    title: "Research Studies & AI Tasks",
    categories: ["general"],
    english: "basic",
    status: "open",
  },
  {
    id: "handshake-music-expert",
    platform: "handshake-ai",
    title: "Music Expert",
    categories: ["audio"],
    payMin: 80,
    payMax: 125,
    english: "fluent",
    degree: true,
    status: "open",
    countries: { allow: ["US"] },
  },
  {
    id: "afterquery-bilingual-audio-ru",
    platform: "afterquery",
    title: "Bilingual Audio Contributor (RU/EN)",
    categories: ["audio", "language"],
    payMin: 30,
    payMax: 30,
    english: "written",
    language: "ru",
    status: "open",
  },
  {
    id: "welo-ai-trainers-russian",
    platform: "welocalize",
    title: "AI Trainers Network – Russian",
    categories: ["language"],
    english: "written",
    language: "ru",
    status: "pool",
    countries: { deny: ["ME"] },
  },
];

export function getJob(id: string) {
  return jobs.find((j) => j.id === id);
}

export function jobPlatform(j: Job): Platform {
  return getPlatform(j.platform)!;
}

export function jobElig(j: Job, cc: string): Elig {
  if (j.countries?.allow && !j.countries.allow.includes(cc)) return "no";
  if (j.countries?.deny?.includes(cc)) return "no";
  if (SANCTIONED.has(cc)) return "no";
  return platformElig(jobPlatform(j), cc);
}

export function jobPayout(j: Job, cc: string): PayoutStatus {
  return bestPayout(jobPlatform(j).rails, cc);
}

export type Overall = "available" | "maybe" | "unavailable";
export function jobOverall(j: Job, cc: string): Overall {
  const e = jobElig(j, cc);
  const p = jobPayout(j, cc);
  if (e === "no" || p === "blocked" || j.status === "closed") return "unavailable";
  if ((e === "yes" || e === "likely") && (p === "works" || p === "likely")) return "available";
  return "maybe";
}

export function applyUrl(j: Job) {
  const p = jobPlatform(j);
  return { href: p.referralUrl || j.url || p.url, isRef: Boolean(p.referralUrl) };
}
