import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { countryName, isLocale, LOCALES, type Locale } from "@/i18n/config";
import { fill, t } from "@/i18n/dict";
import { abs } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { COUNTRIES, COUNTRY_SET } from "@/data/countries";
import { jobOverall, jobPlatform, jobs, type Job } from "@/data/jobs";
import { JsonLd } from "@/components/JsonLd";
import { JobCard } from "@/components/JobCard";

type Props = { params: Promise<{ lang: string; cc: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.flatMap((lang) => COUNTRIES.map((cc) => ({ lang, cc: cc.toLowerCase() })));
}

function groups(cc: string) {
  const g: Record<"available" | "maybe" | "unavailable", Job[]> = { available: [], maybe: [], unavailable: [] };
  for (const j of jobs) g[jobOverall(j, cc)].push(j);
  const byPrio = (a: Job, b: Job) => jobPlatform(a).priority - jobPlatform(b).priority;
  g.available.sort(byPrio);
  g.maybe.sort(byPrio);
  return g;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, cc } = await params;
  const CC = cc.toUpperCase();
  if (!isLocale(lang) || !COUNTRY_SET.has(CC)) return {};
  const d = t(lang);
  const name = countryName(CC, lang);
  const n = groups(CC).available.length;
  return pageMeta(lang, `/countries/${cc}`, fill(d.countryPage.title, { country: name }), fill(d.countryPage.lede, { country: name, n }));
}

export default async function CountryPage({ params }: Props) {
  const { lang, cc } = await params;
  const CC = cc.toUpperCase();
  if (!isLocale(lang) || !COUNTRY_SET.has(CC)) notFound();
  const d = t(lang as Locale);
  const name = countryName(CC, lang);
  const g = groups(CC);
  const unavailablePlatforms = [...new Set(g.unavailable.map((j) => jobPlatform(j).name))];

  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: fill(d.countryPage.title, { country: name }),
    numberOfItems: g.available.length,
    itemListElement: g.available.map((j, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${j.title} — ${jobPlatform(j).name}`,
      url: abs(`/${lang}/jobs/${j.id}`),
    })),
  };

  return (
    <div className="container">
      <JsonLd data={ld} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={`/${lang}/countries`}>{d.countryPage.all}</Link> / {name}
      </nav>
      <header className="detail-hero">
        <h1>{fill(d.countryPage.title, { country: name })}</h1>
        <p className="lede" style={{ margin: 0 }}>{fill(d.countryPage.lede, { country: name, n: g.available.length })}</p>
        <p className="small muted" style={{ margin: 0 }}>{d.countryPage.intro}</p>
        <div className="cta-row">
          <Link className="btn btn-primary" href={`/${lang}?c=${CC}&avail=1#jobs`}>{d.hero.ctaJobs}</Link>
          <Link className="btn btn-ghost" href={`/${lang}/payouts#${CC}`}>{d.hero.ctaPayouts}</Link>
        </div>
      </header>

      {g.available.length ? (
        <section className="section" style={{ paddingTop: 8 }} aria-labelledby="av-h">
          <h2 id="av-h" style={{ fontSize: 24, marginBottom: 16 }}>{d.countryPage.available}</h2>
          <div className="grid">
            {g.available.slice(0, 24).map((j) => (
              <JobCard key={j.id} job={j} locale={lang} d={d} cc={CC} />
            ))}
          </div>
          {g.available.length > 24 ? (
            <p style={{ textAlign: "center", marginTop: 20 }}>
              <Link className="btn btn-ghost" href={`/${lang}?c=${CC}&avail=1#jobs`}>{fill(d.filters.seeAll, { n: g.available.length })}</Link>
            </p>
          ) : null}
        </section>
      ) : null}

      {g.maybe.length ? (
        <section className="section" style={{ paddingTop: 8 }} aria-labelledby="mb-h">
          <h2 id="mb-h" style={{ fontSize: 24, marginBottom: 16 }}>{d.countryPage.maybe}</h2>
          <div className="grid">
            {g.maybe.slice(0, 12).map((j) => (
              <JobCard key={j.id} job={j} locale={lang} d={d} cc={CC} />
            ))}
          </div>
        </section>
      ) : null}

      {unavailablePlatforms.length ? (
        <section className="panel" aria-labelledby="un-h">
          <h2 id="un-h" className="panel-h">{fill(d.countryPage.unavailable, { country: name })}</h2>
          <p className="muted" style={{ margin: 0 }} translate="no">{unavailablePlatforms.join(", ")}</p>
        </section>
      ) : null}
    </div>
  );
}
