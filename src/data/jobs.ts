import type { L } from "@/i18n/config";
import { COUNTRIES, SANCTIONED } from "./countries";
import { bestPayout, type PayoutStatus } from "./rails";
import { getPlatform, platformApply, platformElig, type Elig, type Platform } from "./platforms";

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
  summary?: string; // краткое описание из источника (на английском)
  source?: string;
  externalId?: string;
  firstSeen?: string;
  lastSeen?: string;
  closedAt?: string;
  countries?: { allow?: string[]; deny?: string[] }; // ограничения конкретной вакансии
}

// Вакансии собираются скриптом scripts/build-data.mjs из data/*.json и файла из админки.
import generated from "./generated/jobs.json";
import { platforms as PLATFORM_LIST } from "./platforms";

const KNOWN = new Set(PLATFORM_LIST.map((p) => p.slug));
export const jobs: Job[] = (generated as Job[]).filter((j) => KNOWN.has(j.platform));

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

// Кнопка «Откликнуться» ведёт на вход/регистрацию платформы с реферальным кодом.
export function applyUrl(j: Job) {
  return platformApply(jobPlatform(j));
}

export function availableCountries(j: Job) {
  return COUNTRIES.filter((cc) => jobOverall(j, cc) === "available");
}
