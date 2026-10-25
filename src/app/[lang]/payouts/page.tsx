import type { Metadata } from "next";
import { countryName, isLocale, type Locale } from "@/i18n/config";
import { t } from "@/i18n/dict";
import { pageMeta } from "@/lib/seo";
import { REGION_ORDER, REGIONS } from "@/data/countries";
import { railLabel, railStatus, type Rail } from "@/data/rails";

type Props = { params: Promise<{ lang: string }> };
const COLS: Rail[] = ["deel", "payoneer", "bank", "stripe", "paypal", "wise"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const d = t(lang as Locale);
  return pageMeta(lang as Locale, "/payouts", d.payouts.title, d.payouts.lede);
}

export default async function Payouts({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const d = t(lang);
  const coll = new Intl.Collator(lang === "zh" ? "zh-Hans" : lang);
  return (
    <div className="container">
      <article className="prose" style={{ paddingTop: 40 }}>
        <h1>{d.payouts.title}</h1>
        <p className="lede">{d.payouts.lede}</p>
        <p>{d.payouts.p1}</p>
        <p>{d.payouts.p2}</p>
        <p>{d.payouts.p3}</p>
      </article>

      <div className="legend small muted" style={{ margin: "24px 0 12px" }}>
        {(["works", "likely", "unknown", "blocked"] as const).map((s) => (
          <span key={s}><i className={`p-${s}`} /> {d.payout[s]}</span>
        ))}
      </div>

      {REGION_ORDER.map((r) => (
        <section key={r} style={{ marginBottom: 24 }} aria-labelledby={`pr-${r}`}>
          <h2 id={`pr-${r}`} style={{ fontSize: 22, marginBottom: 12 }}>{d.country.regions[r]}</h2>
          <div className="table-wrap">
            <table>
              <caption className="sr-only">{d.payouts.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{d.payouts.country}</th>
                  {COLS.map((c) => (
                    <th key={c} scope="col" translate="no">{railLabel(c, lang)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...REGIONS[r]]
                  .map((cc) => ({ cc, name: countryName(cc, lang) }))
                  .sort((a, b) => coll.compare(a.name, b.name))
                  .map(({ cc, name }) => (
                    <tr key={cc} id={cc}>
                      <th scope="row" style={{ fontWeight: 600, color: "var(--text)" }}>{name}</th>
                      {COLS.map((c) => {
                        const s = railStatus(c, cc);
                        return (
                          <td key={c}>
                            <span className={`dotcell p-${s}`} title={d.payout[s]}>
                              <i aria-hidden="true" />
                              <span className="sr-only">{d.payout[s]}</span>
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
