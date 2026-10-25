import type { MetadataRoute } from "next";
export const dynamic = "force-static";
import { HTML_LANG, LOCALES } from "@/i18n/config";
import { COUNTRIES } from "@/data/countries";
import { jobs } from "@/data/jobs";
import { platforms } from "@/data/platforms";
import { abs, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${site.lastVerified}T00:00:00Z`);
  const paths: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/countries", priority: 0.8, changeFrequency: "weekly" },
    { path: "/payouts", priority: 0.7, changeFrequency: "monthly" },
    { path: "/disclosure", priority: 0.2, changeFrequency: "yearly" },
    ...jobs.map((j) => ({ path: `/jobs/${j.id}`, priority: 0.8, changeFrequency: "weekly" as const })),
    ...platforms.map((p) => ({ path: `/platforms/${p.slug}`, priority: 0.6, changeFrequency: "weekly" as const })),
    ...COUNTRIES.map((cc) => ({ path: `/countries/${cc.toLowerCase()}`, priority: 0.7, changeFrequency: "weekly" as const })),
  ];
  return paths.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((l) => ({
      url: abs(`/${l}${path}`),
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: Object.fromEntries(LOCALES.map((x) => [HTML_LANG[x], abs(`/${x}${path}`)])) },
    })),
  );
}
