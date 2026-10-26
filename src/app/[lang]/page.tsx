import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { formatDate, isLocale, type Locale } from "@/i18n/config";
import { fill, t } from "@/i18n/dict";
import { site, abs } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { jobs, jobPlatform } from "@/data/jobs";
import { platforms } from "@/data/platforms";
import { COUNTRIES } from "@/data/countries";
import { Catalog, StaticCatalog } from "@/components/Catalog";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const d = t(lang as Locale);
  return pageMeta(lang as Locale, "", d.meta.title, d.meta.description);
}

function Pin({ className, fill }: { className: string; fill: string }) {
  return (
    <svg className={`pin ${className}`} viewBox="0 0 64 80" aria-hidden="true" focusable="false">
      <path d="M32 3C16.5 3 5 14.8 5 29.5 5 49 32 77 32 77s27-28 27-47.5C59 14.8 47.5 3 32 3Z" fill={fill} stroke="var(--line)" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="32" cy="29" r="9.5" fill="var(--bg)" stroke="var(--line)" strokeWidth="2.5" />
    </svg>
  );
}

export default async function Home({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const d = t(lang);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: d.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: d.meta.tagline,
    numberOfItems: jobs.length,
    itemListElement: jobs.filter((j) => j.status !== "closed").slice(0, 100).map((j, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${j.title} — ${jobPlatform(j).name}`,
      url: abs(`/${lang}/jobs/${j.id}`),
    })),
  };

  return (
    <>
      <JsonLd data={faqLd} />
      <JsonLd data={listLd} />

      <section className="hero">
        <div className="container fade-up">
          <Pin className="pin-1" fill="var(--accent)" />
          <Pin className="pin-2" fill="var(--sun)" />
          <span className="eyebrow">
            <span className="dot" aria-hidden="true" />
            {fill(d.hero.eyebrow, { date: formatDate(site.lastVerified, lang) })}
          </span>
          <h1>{d.hero.h1}</h1>
          <p className="lede">{d.hero.lede}</p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#jobs">
              {d.hero.ctaJobs}
            </a>
            <Link className="btn btn-ghost" href={`/${lang}/payouts`}>
              {d.hero.ctaPayouts}
            </Link>
          </div>
          <div className="stats">
            <div className="stat">
              <b className="num">{jobs.length}</b>
              <span>{d.stats.jobs}</span>
            </div>
            <div className="stat">
              <b className="num">{platforms.length}</b>
              <span>{d.stats.platforms}</span>
            </div>
            <div className="stat">
              <b className="num">{COUNTRIES.length}</b>
              <span>{d.stats.countries}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="jobs" aria-labelledby="jobs-h" style={{ paddingTop: 16 }}>
        <div className="container">
          <div className="section-head">
            <h2 id="jobs-h">{d.nav.jobs}</h2>
          </div>
          <Suspense fallback={<StaticCatalog locale={lang} d={d} />}>
            <Catalog locale={lang} d={d} />
          </Suspense>
        </div>
      </section>

      <section className="section band" aria-labelledby="faq-h">
        <div className="container">
          <div className="section-head">
            <h2 id="faq-h">FAQ</h2>
          </div>
          <div className="faq">
            {d.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
