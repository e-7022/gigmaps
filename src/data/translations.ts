// Переводы вакансий на ru/es/fr/zh: собирает scripts/translate.mjs (data/translations/*.json) → scripts/build-data.mjs → generated/tr/<lang>.json.
// Только для серверных страниц.
import type { Locale } from "@/i18n/config";
import type { Block, Facts } from "./details";

export interface JobTr {
  title?: string;
  summary?: string;
  blocks?: Block[];
  skills?: string[];
  facts?: Partial<Record<"employment" | "workMode" | "location" | "commitment" | "duration" | "department" | "team" | "startDate" | "availability" | "communication" | "eligible" | "ineligible", string>>;
}

type Table = Record<string, JobTr>;
const loaded = new Map<string, Promise<Table>>();

function load(lang: Exclude<Locale, "en">): Promise<Table> {
  let p = loaded.get(lang);
  if (!p) {
    p = import(`./generated/tr/${lang}.json`).then((m) => (m.default ?? m) as Table);
    loaded.set(lang, p);
  }
  return p;
}

export async function getTranslation(lang: Locale, id: string): Promise<JobTr | undefined> {
  if (lang === "en") return undefined;
  return (await load(lang))[id];
}

export type { Facts };
