import { formatDate, formatPay, HTML_LANG, languageName, type Locale } from "@/i18n/config";
import { fill, type Dict } from "@/i18n/dict";
import type { Job } from "@/data/jobs";
import type { Details } from "@/data/details";

type Values = Dict["jobDetail"]["values"];

// «Contractor» / «full-time» / «Remote» → перевод; незнакомые значения показываем как есть
function localize(raw: string, v: Values): string {
  const t = raw.trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (/^(contract|contractor|independent-contractor|freelance|freelancer|1099)$/.test(t)) return v.contractor;
  if (/^(full-?time|fulltime|permanent)$/.test(t)) return v.fulltime;
  if (/^(part-?time|parttime)$/.test(t)) return v.parttime;
  if (/^(hourly|per-hour)$/.test(t)) return v.hourly;
  if (/^(remote|fully-remote|work-from-home)$/.test(t)) return v.remote;
  if (/^(hybrid)$/.test(t)) return v.hybrid;
  if (/^(on-?site|in-?office|office)$/.test(t)) return v.onsite;
  return raw.trim();
}

export function JobDetails({ job, details, locale, d, officialUrl }: { job: Job; details?: Details; locale: Locale; d: Dict; officialUrl: string }) {
  const jd = d.jobDetail;
  const f = details?.facts ?? {};
  const pay = formatPay(job.payMin, job.payMax, locale, job.payUnit);
  const num = new Intl.NumberFormat(locale);

  const rows: { k: string; v: string }[] = [];
  const add = (k: keyof typeof jd.facts, v: string | undefined | null) => {
    if (v != null && String(v).trim() !== "") rows.push({ k: jd.facts[k], v: String(v) });
  };
  add("pay", pay ?? d.job.payUnknown);
  add("employment", f.employment ? localize(f.employment, jd.values) : undefined);
  add("workMode", f.workMode ? localize(f.workMode, jd.values) : undefined);
  add("location", f.location ? localize(f.location, jd.values) : undefined);
  add("openings", f.openings ? num.format(f.openings) : undefined);
  add("hoursPerWeek", f.hoursPerWeek != null ? String(f.hoursPerWeek) : undefined);
  add("commitment", f.commitment ? localize(f.commitment, jd.values) : undefined);
  add("duration", f.duration);
  add("english", d.english[job.english]);
  add("language", job.language ? languageName(job.language, locale) : undefined);
  add("degree", job.degree ? d.job.degree : undefined);
  add("department", f.department);
  add("team", f.team);
  add("startDate", f.startDate);
  add("interview", f.interview ? fill(jd.minutes, { n: f.interview }) : undefined);
  add("equity", f.equity ? jd.values.offered : undefined);
  add("eligible", f.eligible);
  add("ineligible", f.ineligible);
  add("availability", f.availability);
  add("communication", f.communication);
  add("referral", f.referral ? new Intl.NumberFormat(HTML_LANG[locale], { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(f.referral) : undefined);
  add("applicants", f.applicants ? num.format(f.applicants) : undefined);
  add("status", d.status[job.status]);
  if (job.posted) add("posted", formatDate(job.posted, locale));

  const skills = [...(f.skills ?? []), ...(f.tags ?? [])];
  const blocks = details?.blocks ?? [];

  return (
    <section className="panel job-detail" aria-labelledby="jd-h">
      <h2 id="jd-h" className="panel-h">{jd.title}</h2>

      <dl className="facts">
        {rows.map((r) => (
          <div key={r.k} className="fact">
            <dt>{r.k}</dt>
            <dd>{r.v}</dd>
          </div>
        ))}
      </dl>

      {skills.length ? (
        <>
          <h3 className="sub-h">{jd.skills}</h3>
          <ul className="tags" lang="en">
            {skills.map((s) => (
              <li key={s} className="tag">{s}</li>
            ))}
          </ul>
        </>
      ) : null}

      {blocks.length ? (
        <div className="prose" lang="en">
          {blocks.map((b, i) =>
            b.t === "h" ? (
              <h3 key={i}>{b.x}</h3>
            ) : b.t === "p" ? (
              <p key={i}>{b.x}</p>
            ) : b.t === "ol" ? (
              <ol key={i}>{b.i.map((x, j) => <li key={j}>{x}</li>)}</ol>
            ) : (
              <ul key={i}>{b.i.map((x, j) => <li key={j}>{x}</li>)}</ul>
            ),
          )}
        </div>
      ) : job.summary ? (
        <div className="prose" lang="en">
          <p>{job.summary}</p>
        </div>
      ) : null}

      <p className="small muted job-source">
        {blocks.length ? (
          <>
            {fill(jd.sourceNote, { date: formatDate(details?.fetched ?? job.lastSeen ?? job.firstSeen ?? job.posted ?? new Date().toISOString().slice(0, 10), locale) }).replace(/\.\.$/, ".")}{" "}
          </>
        ) : (
          <>{jd.noDescription} </>
        )}
        <a href={officialUrl} target="_blank" rel="noopener">{jd.readOfficial}</a>
      </p>
    </section>
  );
}
