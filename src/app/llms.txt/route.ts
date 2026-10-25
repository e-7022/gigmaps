import { formatPay, LOCALES, LOCALE_NAMES } from "@/i18n/config";
import { dicts } from "@/i18n/dict";
import { jobs, jobOverall, jobPlatform } from "@/data/jobs";
import { platforms } from "@/data/platforms";
import { COUNTRIES, REGION_ORDER, REGIONS } from "@/data/countries";
import { abs, site } from "@/lib/site";

export const dynamic = "force-static";

// llms.txt (llmstxt.org) — компактная английская версия сайта для языковых моделей.
export function GET() {
  const d = dicts.en;
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${d.meta.description}`,
    "",
    `Data verified ${site.lastVerified}. Coverage: ${COUNTRIES.length} countries (North America, European Union, Eastern Europe & Balkans, China). Eligibility comes from official platform country lists; payout status is checked per payment method (Deel, Payoneer, bank transfer, Stripe, PayPal, Wise). Referral links are labeled and never affect ordering.`,
    "",
    `Languages: ${LOCALES.map((l) => `[${LOCALE_NAMES[l]}](${abs(`/${l}`)})`).join(", ")}`,
    "",
    "## Key pages",
    `- [Job catalog](${abs("/en")}): filter by country of residence, field, English level, degree`,
    `- [Jobs by country](${abs("/en/countries")}): one page per country listing jobs available there`,
    `- [Payouts by country](${abs("/en/payouts")}): which payout methods work in each country`,
    `- [Referral policy](${abs("/en/disclosure")})`,
    "",
    "## Jobs",
    ...jobs.map((j) => {
      const p = jobPlatform(j);
      const pay = formatPay(j.payMin, j.payMax, "en", j.payUnit) ?? "rate not published";
      const extra = [j.language ? `requires ${new Intl.DisplayNames(["en"], { type: "language" }).of(j.language)}` : "", j.degree ? "advanced degree required" : ""].filter(Boolean).join("; ");
      return `- [${j.title} — ${p.name}](${abs(`/en/jobs/${j.id}`)}): ${pay}; English: ${d.english[j.english]}; status: ${d.status[j.status]}${extra ? `; ${extra}` : ""}.`;
    }),
    "",
    "## Available jobs per country (eligible + working payout)",
    ...REGION_ORDER.flatMap((r) => [
      `### ${d.country.regions[r]}`,
      ...REGIONS[r].map((cc) => {
        const ok = jobs.filter((j) => jobOverall(j, cc) === "available").map((j) => `${j.title} (${jobPlatform(j).name})`);
        return `- [${names.of(cc)}](${abs(`/en/countries/${cc.toLowerCase()}`)}): ${ok.length ? ok.join(", ") : "no confirmed options"}`;
      }),
      "",
    ]),
    "## Platforms",
    ...platforms.map((p) => `- [${p.name}](${abs(`/en/platforms/${p.slug}`)}): ${p.summary.en} ${d.platform.rule[p.rule.kind]}`),
    "",
    "## FAQ",
    ...d.faq.flatMap((f) => [`### ${f.q}`, f.a, ""]),
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
