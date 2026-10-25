import Link from "next/link";
import { countryName, type Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/dict";
import { REGION_ORDER, REGIONS } from "@/data/countries";
import { jobElig, jobOverall, jobPayout, type Job } from "@/data/jobs";

export function AvailabilityGrid({ job, locale, d }: { job: Job; locale: Locale; d: Dict }) {
  return (
    <div className="avail">
      <div className="legend small muted" aria-hidden="true">
        <span><i className="o-available" /> {d.overall.available}</span>
        <span><i className="o-maybe" /> {d.overall.maybe}</span>
        <span><i className="o-unavailable" /> {d.overall.unavailable}</span>
      </div>
      {REGION_ORDER.map((r) => (
        <div key={r} className="avail-region">
          <h3 className="small muted">{d.country.regions[r]}</h3>
          <ul className="avail-list">
            {REGIONS[r].map((cc) => {
              const o = jobOverall(job, cc);
              const name = countryName(cc, locale);
              return (
                <li key={cc}>
                  <Link
                    href={`/${locale}/countries/${cc.toLowerCase()}`}
                    className={`avail-chip o-${o}`}
                    title={`${name}: ${d.elig[jobElig(job, cc)]} · ${d.payout[jobPayout(job, cc)]}`}
                  >
                    <i aria-hidden="true" />
                    {name}
                    <span className="sr-only">: {d.overall[o]}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
