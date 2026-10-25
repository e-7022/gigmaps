import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatPay, isLocale, languageName, LOCALES, type Locale } from "@/i18n/config";
import { t } from "@/i18n/dict";
import { abs } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { applyUrl, getJob, jobElig, jobPlatform, jobs, type Job } from "@/data/jobs";
import { railLabel } from "@/data/rails";
import { COUNTRIES } from "@/data/countries";
import { JsonLd } from "@/components/JsonLd";
import { JobCard, overallMap } from "@/components/JobCard";
import { AvailabilityLine } from "@/components/AvailabilityLine";

type Props = { params: Promise<{ lang: string; id: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.flatMap((lang) => jobs.map((j) => ({ lang, id: j.id })));
}

function describe(j: Job, locale: Locale) {
  const d = t(locale);
  const p = jobPlatform(j);
  const pay = formatPay(j.payMin, j.payMax, locale, j.payUnit) ?? d.job.payUnknown;
  return `${j.title} — ${p.name}. ${d.job.pay}: ${pay}. ${d.job.englishLabel}: ${d.english[j.english]}. ${j.note?.[locale] ?? p.summary[locale]}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const j = getJob(id);
  if (!j || !isLocale(lang)) return {};
  return pageMeta(lang, `/jobs/${j.id}`, `${j.title} · ${jobPlatform(j).name}`, describe(j, lang));
}

export default async function JobPage({ params }: Props) {
  const { lang, id } = await params;
  const j = getJob(id);
  if (!j || !isLocale(lang)) notFound();
  const d = t(lang);
  const p = jobPlatform(j);
  const pay = formatPay(j.payMin, j.payMax, lang, j.payUnit);
  const { href, isRef } = applyUrl(j);
  const om = overallMap(j);
  const others = jobs
    .filter((x) => x.platform === j.platform && x.id !== j.id && x.status !== "closed")
    .sort((a, b) => Number(b.categories.some((c) => j.categories.includes(c))) - Number(a.categories.some((c) => j.categories.includes(c))))
    .slice(0, 6);

  const eligible = COUNTRIES.filter((cc) => {
    const e = jobElig(j, cc);
    return e === "yes" || e === "likely";
  });
  const ld: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: d.breadcrumbHome, item: abs(`/${lang}`) },
        { "@type": "ListItem", position: 2, name: p.name, item: abs(`/${lang}/platforms/${p.slug}`) },
        { "@type": "ListItem", position: 3, name: j.title, item: abs(`/${lang}/jobs/${j.id}`) },
      ],
    },
  ];
  const postedDate = j.posted ?? j.firstSeen;
  if (postedDate && j.status !== "closed" && eligible.length) {
    const posted = postedDate.length === 7 ? `${postedDate}-01` : postedDate;
    ld.push({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: j.title,
      description: describe(j, lang),
      datePosted: posted,
      validThrough: new Date(Date.parse(posted) + 90 * 864e5).toISOString().slice(0, 10),
      identifier: { "@type": "PropertyValue", name: p.name, value: j.externalId ?? j.id },
      employmentType: "CONTRACTOR",
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: eligible.map((cc) => ({ "@type": "Country", name: cc })),
      hiringOrganization: { "@type": "Organization", name: p.name, sameAs: p.url },
      directApply: false,
      url: abs(`/${lang}/jobs/${j.id}`),
      ...(j.payMin != null || j.payMax != null
        ? {
            baseSalary: {
              "@type": "MonetaryAmount",
              currency: "USD",
              value: { "@type": "QuantitativeValue", minValue: j.payMin ?? j.payMax, maxValue: j.payMax ?? j.payMin, unitText: j.payUnit === "task" ? "TASK" : "HOUR" },
            },
          }
        : {}),
    });
  }

  return (
    <div className="container">
      {ld.map((x, i) => (
        <JsonLd key={i} data={x} />
      ))}
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={`/${lang}#jobs`}>{d.breadcrumbHome}</Link> /{" "}
        <Link href={`/${lang}/platforms/${p.slug}`} translate="no">{p.name}</Link>
      </nav>

      <header className="detail-hero">
        <h1 translate="no">{j.title}</h1>
        <p className="muted" style={{ margin: 0 }}>
          <Link href={`/${lang}/platforms/${p.slug}`} translate="no">{p.name}</Link>
          {p.owner ? <> · <span translate="no">{p.owner}</span></> : null} · {d.status[j.status]}
        </p>
        {j.note ? <p className="lede" style={{ margin: 0 }}>{j.note[lang]}</p> : null}
        {j.status === "closed" ? null : <AvailabilityLine locale={lang} total={om.total} byCountry={om.m} />}
        <div className="cta-row">
          {j.status === "closed" ? null : (
            <a className="btn btn-primary" href={href} target="_blank" rel={isRef ? "sponsored noopener" : "noopener"}>
              {isRef ? d.job.applyRef : d.job.apply}
            </a>
          )}
          <a className="btn btn-ghost" href={j.url || p.url} target="_blank" rel="noopener">
            {d.job.official}
          </a>
        </div>
      </header>

      <div className="two-col">
        <section className="panel" aria-labelledby="about-h">
          <h2 id="about-h" className="panel-h">{d.job.about}</h2>
          {j.summary ? <p lang="en" style={{ marginTop: 0 }}>{j.summary}</p> : null}
          <p className="muted" style={{ margin: 0 }}>{p.summary[lang]}</p>
          <p className="small muted" style={{ marginBottom: 0 }}>
            {d.platform.rule[p.rule.kind]}{" "}
            {"source" in p.rule ? (
              <a href={p.rule.source} target="_blank" rel="noopener">{d.platform.source}</a>
            ) : null}
          </p>
        </section>
        <aside className="panel">
          <dl className="meta">
            <dt>{d.job.pay}</dt>
            <dd className="num">{pay ?? d.job.payUnknown}</dd>
            <dt>{d.job.englishLabel}</dt>
            <dd>{d.english[j.english]}</dd>
            {j.language ? (
              <>
                <dt>{d.job.languageLabel}</dt>
                <dd>{languageName(j.language, lang)}</dd>
              </>
            ) : null}
            {j.degree ? (
              <>
                <dt>—</dt>
                <dd>{d.job.degree}</dd>
              </>
            ) : null}
            <dt>{d.job.statusLabel}</dt>
            <dd>{d.status[j.status]}</dd>
            {j.posted ? (
              <>
                <dt>{d.job.posted}</dt>
                <dd><time dateTime={j.posted}>{formatDate(j.posted, lang)}</time></dd>
              </>
            ) : null}
            <dt>{d.job.payoutRails}</dt>
            <dd translate="no">{p.rails.length ? p.rails.map((r) => railLabel(r, lang)).join(", ") : d.platform.railsUnknown}</dd>
            <dt>{d.job.verified}</dt>
            <dd><time dateTime={p.verified}>{formatDate(p.verified, lang)}</time></dd>
          </dl>
        </aside>
      </div>



      {others.length ? (
        <section className="section" aria-labelledby="other-h">
          <h2 id="other-h" style={{ fontSize: 24, marginBottom: 16 }}>{d.job.otherJobs}</h2>
          <div className="grid">
            {others.map((o) => (
              <JobCard key={o.id} job={o} locale={lang} d={d} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
