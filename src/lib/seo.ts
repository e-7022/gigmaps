import type { Metadata } from "next";
import { HTML_LANG, LOCALES, OG_LOCALE, type Locale } from "@/i18n/config";
import { site } from "./site";

export function alternates(locale: Locale, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[HTML_LANG[l]] = `/${l}${path}`;
  languages["x-default"] = `/en${path}`;
  return { canonical: `/${locale}${path}`, languages };
}

export function pageMeta(locale: Locale, path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: alternates(locale, path),
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: OG_LOCALE[locale],
      url: `/${locale}${path}`,
      title,
      description,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}
