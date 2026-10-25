import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { t } from "@/i18n/dict";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const d = t(lang as Locale);
  return pageMeta(lang as Locale, "/disclosure", d.disclosure.title, d.disclosure.lede);
}

export default async function Disclosure({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const d = t(lang);
  return (
    <div className="container">
      <article className="prose" style={{ paddingTop: 40 }}>
        <h1>{d.disclosure.title}</h1>
        <p className="lede">{d.disclosure.lede}</p>
        <ul>
          {d.disclosure.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <h2>{d.disclosure.errorsTitle}</h2>
        <p>{d.disclosure.errors}</p>
      </article>
    </div>
  );
}
