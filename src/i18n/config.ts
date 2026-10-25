export const LOCALES = ["en", "ru", "es", "fr", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

// Атрибут lang / hreflang
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  ru: "ru",
  es: "es",
  fr: "fr",
  zh: "zh-Hans",
};

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  ru: "ru_RU",
  es: "es_ES",
  fr: "fr_FR",
  zh: "zh_CN",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  es: "Español",
  fr: "Français",
  zh: "中文",
};

export type L = Record<Locale, string>;

export function isLocale(x: string): x is Locale {
  return (LOCALES as readonly string[]).includes(x);
}

const regionNames = new Map<Locale, Intl.DisplayNames>();
export function countryName(cc: string, locale: Locale) {
  let dn = regionNames.get(locale);
  if (!dn) {
    dn = new Intl.DisplayNames([HTML_LANG[locale]], { type: "region" });
    regionNames.set(locale, dn);
  }
  return dn.of(cc) ?? cc;
}

const langNames = new Map<Locale, Intl.DisplayNames>();
export function languageName(code: string, locale: Locale) {
  let dn = langNames.get(locale);
  if (!dn) {
    dn = new Intl.DisplayNames([HTML_LANG[locale]], { type: "language" });
    langNames.set(locale, dn);
  }
  const name = dn.of(code) ?? code;
  return name.charAt(0).toLocaleUpperCase(HTML_LANG[locale]) + name.slice(1);
}

const dateFmts = new Map<Locale, Intl.DateTimeFormat>();
export function formatDate(iso: string, locale: Locale) {
  let f = dateFmts.get(locale);
  if (!f) {
    f = new Intl.DateTimeFormat(HTML_LANG[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    dateFmts.set(locale, f);
  }
  return f.format(new Date(`${iso.length === 7 ? `${iso}-01` : iso}T00:00:00Z`));
}

const usd = new Map<Locale, Intl.NumberFormat>();
function money(n: number, locale: Locale) {
  let f = usd.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(HTML_LANG[locale], { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
    usd.set(locale, f);
  }
  return f.format(n);
}

export const PER_HOUR: L = { en: "/h", ru: "/ч", es: "/h", fr: "/h", zh: "/小时" };

export function formatPay(min: number | undefined, max: number | undefined, locale: Locale, unit: "hour" | "task" = "hour") {
  if (min == null && max == null) return null;
  const suffix = unit === "hour" ? PER_HOUR[locale] : { en: "/task", ru: "/задача", es: "/tarea", fr: "/tâche", zh: "/任务" }[locale];
  if (min != null && max != null && min !== max) return `${money(min, locale)}–${money(max, locale)}${suffix}`;
  return `${money((max ?? min)!, locale)}${suffix}`;
}
