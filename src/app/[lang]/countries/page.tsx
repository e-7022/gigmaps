import type { Metadata } from "next";
import Link from "next/link";
import { countryName, isLocale, type Locale } from "@/i18n/config";
import { t } from "@/i18n/dict";
import { pageMeta } from "@/lib/seo";
import { REGION_ORDER, REGIONS } from "@/data/countries";
import { jobOverall, jobs } from "@/data/jobs";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const d = t(lang as Locale);
  return pageMeta(lang as Locale, "/countries", `${d.meta.tagline} — ${d.nav.countries}`, d.countryPage.intro);
}

export default async function Countries({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const d = t(lang);
  const coll = new Intl.Collator(lang === "zh" ? "zh-Hans" : lang);
  return (
    <div className="container">
      <header className="detail-hero" style={{ paddingTop: 40 }}>
        <h1>{d.nav.countries}</h1>
        <p className="lede" style={{ margin: 0 }}>{d.countryPage.intro}</p>
      </header>
      {REGION_ORDER.map((r) => (
        <section key={r} className="section" style={{ padding: "16px 0" }} aria-labelledby={`r-${r}`}>
          <h2 id={`r-${r}`} style={{ fontSize: 22, marginBottom: 12 }}>{d.country.regions[r]}</h2>
          <ul className="country-grid">
            {[...REGIONS[r]]
              .map((cc) => ({ cc, name: countryName(cc, lang) }))
              .sort((a, b) => coll.compare(a.name, b.name))
              .map(({ cc, name }) => {
                const n = jobs.filter((j) => jobOverall(j, cc) === "available").length;
                return (
                  <li key={cc}>
                    <Link href={`/${lang}/countries/${cc.toLowerCase()}`} className="country-link">
                      <span>{name}</span>
                      <span className={`count${n ? "" : " zero"} num`}>{n}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
