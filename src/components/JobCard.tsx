import Link from "next/link";
import { formatPay, languageName, type Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/dict";
import { applyUrl, jobOverall, jobPlatform, type Job } from "@/data/jobs";
import { COUNTRIES } from "@/data/countries";
import { AvailabilityLine } from "./AvailabilityLine";
import type { Overall } from "@/i18n/avail";

export function overallMap(job: Job) {
  const m: Record<string, Overall> = {};
  let total = 0;
  for (const cc of COUNTRIES) {
    const o = jobOverall(job, cc);
    m[cc] = o;
    if (o === "available") total++;
  }
  return { m, total };
}

export function JobCard({ job, locale, d, cc, inCatalog }: { job: Job; locale: Locale; d: Dict; cc?: string; inCatalog?: boolean }) {
  const p = jobPlatform(job);
  const pay = formatPay(job.payMin, job.payMax, locale, job.payUnit);
  const overall = cc ? jobOverall(job, cc) : null;
  const { m, total } = overallMap(job);
  const { href, isRef } = applyUrl(job);
  const href_ = `/${locale}/jobs/${job.id}`;

  return (
    <article className={`card${overall === "unavailable" || job.status === "closed" ? " dim" : ""}`}>
      <div className="card-head">
        <div style={{ minWidth: 0 }}>
          <h3>
            <Link className="card-title" href={href_} translate="no">
              {job.title}
            </Link>
          </h3>
          <div className="card-owner">
            <Link href={`/${locale}/platforms/${p.slug}`} translate="no" className="muted-link">
              {p.name}
            </Link>
            {" · "}
            {d.status[job.status]}
          </div>
        </div>
        <div className={`pay${pay ? "" : " pay-none"}`}>{pay ?? "—"}</div>
      </div>

      {job.note ? <p>{job.note[locale]}</p> : job.summary ? <p lang="en">{job.summary}</p> : null}

      {job.status === "closed" ? null : <AvailabilityLine locale={locale} total={total} byCountry={m} cc={inCatalog ? cc ?? "" : cc} />}

      <div className="badges">
        {job.categories.map((c) => (
          <span key={c} className="tag">
            {d.cat[c]}
          </span>
        ))}
        <span className="tag">
          {d.job.englishLabel}: {d.english[job.english]}
        </span>
        {job.language ? <span className="tag">{languageName(job.language, locale)}</span> : null}
        {job.degree ? <span className="tag">{d.job.degree}</span> : null}
      </div>

      <div className="card-foot">
        <Link className="btn btn-ghost btn-sm" href={href_}>
          {d.job.details}
        </Link>
        {job.status === "closed" || overall === "unavailable" ? null : (
          <a className="btn btn-primary btn-sm" href={href} target="_blank" rel={isRef ? "sponsored noopener" : "noopener"}>
            {d.job.apply}
          </a>
        )}
        {isRef ? <span className="ref-note">{d.job.refNote}</span> : null}
      </div>
    </article>
  );
}
