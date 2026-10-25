"use client";

import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/config";

export function LangSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");

  return (
    <label className="lang">
      <span className="sr-only">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
      </svg>
      <select
        name="lang"
        value={locale}
        onChange={(e) => {
          const next = e.target.value;
          try {
            localStorage.setItem("gigmap.lang", next);
          } catch {}
          window.location.assign(`/${next}${rest}${window.location.search}${window.location.hash}`);
        }}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={l}>
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
