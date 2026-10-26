import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { formatDate } from "@/i18n/config";
import { fill, t } from "@/i18n/dict";
import { site } from "@/lib/site";
import { LangSwitcher } from "./LangSwitcher";

function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <rect width="26" height="26" rx="8" fill="var(--accent)" />
      <circle cx="9" cy="13" r="2.4" fill="var(--accent-ink)" />
      <circle cx="17" cy="9" r="2.4" fill="var(--accent-ink)" opacity=".7" />
      <circle cx="17" cy="17" r="2.4" fill="var(--accent-ink)" opacity=".45" />
    </svg>
  );
}

export function Header({ locale }: { locale: Locale }) {
  const d = t(locale);
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href={`/${locale}`} className="logo" aria-label={site.name}>
          <Mark />
          <span translate="no">{site.name}</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href={`/${locale}#jobs`}>{d.nav.jobs}</Link>
          <Link href={`/${locale}/countries`} className="hide-sm">
            {d.nav.countries}
          </Link>
          <Link href={`/${locale}/payouts`} className="hide-sm">
            {d.nav.payouts}
          </Link>
          <LangSwitcher locale={locale} label={d.nav.language} />
        </nav>
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  const d = t(locale);
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p style={{ margin: 0 }}>
          <span translate="no">{site.name}</span> · {fill(d.footer.verified, { date: formatDate(site.lastVerified, locale) }).replace(/\.\./g, ".")}{" "}
          {d.footer.disclaimer}
        </p>
        <p style={{ margin: 0, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href={`/${locale}/disclosure`}>{d.nav.about}</Link>
          <Link href={`/${locale}/countries`}>{d.nav.countries}</Link>
          <Link href={`/${locale}/payouts`}>{d.nav.payouts}</Link>
          <a href="/llms.txt">llms.txt</a>
        </p>
      </div>
    </footer>
  );
}
