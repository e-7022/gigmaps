import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, isLocale, LOCALES } from "@/i18n/config";
import { fill, t } from "@/i18n/dict";
import { abs } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { getPlatform, platformApply, platforms } from "@/data/platforms";
import { jobs } from "@/data/jobs";
import { railLabel } from "@/data/rails";
import { JsonLd } from "@/components/JsonLd";
import { JobCard } from "@/components/JobCard";

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.flatMap((lang) => platforms.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = getPlatform(slug);
  if (!p || !isLocale(lang)) return {};
  const n = jobs.filter((j) => j.platform === p.slug && j.status !== "closed").length;
  return pageMeta(lang, `/platforms/${p.slug}`, `${p.name}: ${n} ${t(lang).platform.jobs.toLowerCase()} · ${t(lang).platform.rails}`, p.summary[lang]);
}

export default async function PlatformPage({ params }: Props) {
  const { lang, slug } = await params;
  const p = getPlatform(slug);
  if (!p || !isLocale(lang)) notFound();
  const d = t(lang);
  const list = jobs.filter((j) => j.platform === p.slug);
  const ap = platformApply(p);

  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: abs(`/${lang}/platforms/${p.slug}`),
    name: p.name,
    dateModified: p.verified,
    inLanguage: lang,
    about: { "@type": "Organization", name: p.name, url: p.url },
  };

  return (
    <div className="container">
      <JsonLd data={ld} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={`/${lang}#jobs`}>{d.breadcrumbHome}</Link> / <span translate="no">{p.name}</span>
      </nav>
      <header className="detail-hero">
        <h1 translate="no">{p.name}</h1>
        {p.owner ? <p className="muted" style={{ margin: 0 }} translate="no">{p.owner}</p> : null}
        <p className="lede" style={{ margin: 0 }}>{p.summary[lang]}</p>
        <div className="cta-row">
          <a className="btn btn-primary" href={ap.href} target="_blank" rel={ap.isRef ? "sponsored noopener" : "noopener"}>
            {ap.isRef ? d.job.applyRef : d.job.apply}
          </a>
          <a className="btn btn-ghost" href={p.url} target="_blank" rel="noopener">{d.job.official}</a>
        </div>
      </header>

      <div className="two-col">
        <section className="panel">
          <p style={{ marginTop: 0 }}>{d.platform.rule[p.rule.kind]}</p>
          {"source" in p.rule ? (
            <p className="small" style={{ marginBottom: 0 }}>
              <a href={p.rule.source} target="_blank" rel="noopener">{d.platform.source}</a>
            </p>
          ) : null}
        </section>
        <aside className="panel">
          <dl className="meta">
            <dt>{d.platform.rails}</dt>
            <dd translate="no">{p.rails.length ? p.rails.map((r) => railLabel(r, lang)).join(", ") : d.platform.railsUnknown}</dd>
            <dt>{d.job.verified}</dt>
            <dd><time dateTime={p.verified}>{formatDate(p.verified, lang)}</time></dd>
          </dl>
        </aside>
      </div>

      <section className="section" aria-labelledby="pj-h">
        <h2 id="pj-h" style={{ fontSize: 24, marginBottom: 16 }}>{d.platform.jobs}</h2>
        <div className="grid">
          {list.filter((j) => j.status !== "closed").slice(0, 24).map((j) => (
            <JobCard key={j.id} job={j} locale={lang} d={d} />
          ))}
        </div>
        {list.length > 24 ? (
          <p style={{ textAlign: "center", marginTop: 20 }}>
            <Link className="btn btn-ghost" href={`/${lang}?p=${p.slug}#jobs`}>{fill(d.filters.seeAll, { n: list.length })}</Link>
          </p>
        ) : null}
      </section>
    </div>
  );
}
