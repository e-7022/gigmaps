// Полные описания вакансий: собирает scripts/fetch-jobs.mjs (data/jobs.details.json) → scripts/build-data.mjs → generated/details.json.
// Импортируется только серверными страницами, в клиентский бандл не попадает.
import generated from "./generated/details.json";

export type Block = { t: "h"; x: string } | { t: "p"; x: string } | { t: "ul"; i: string[] } | { t: "ol"; i: string[] };

export interface Facts {
  employment?: string;
  workMode?: string;
  location?: string;
  openings?: number;
  hoursPerWeek?: string | number;
  commitment?: string;
  duration?: string;
  department?: string;
  team?: string;
  skills?: string[];
  tags?: string[];
  referral?: number;
  interview?: number;
  equity?: boolean;
  startDate?: string;
  applicants?: number;
  eligible?: string;
  ineligible?: string;
  availability?: string;
  communication?: string;
}

export interface Details {
  blocks: Block[];
  facts: Facts;
  fetched?: string;
}

const all = generated as unknown as Record<string, Details>;

export function getDetails(id: string): Details | undefined {
  return all[id];
}

export function detailsText(d?: Details): string {
  if (!d) return "";
  return d.blocks.map((b) => (b.t === "ul" || b.t === "ol" ? b.i.map((s) => `- ${s}`).join("\n") : b.t === "h" ? `${b.x}:` : b.x)).join("\n");
}
