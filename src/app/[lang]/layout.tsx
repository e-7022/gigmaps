import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/onest";
import "../globals.css";
import { HTML_LANG, LOCALES, isLocale } from "@/i18n/config";
import { t } from "@/i18n/dict";
import { site } from "@/lib/site";
import { Header, Footer } from "@/components/Chrome";
import { JsonLd } from "@/components/JsonLd";

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = t(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: d.meta.title, template: `%s · ${site.name}` },
    description: d.meta.description,
    applicationName: site.name,
    icons: { icon: "/icon.svg" },
    robots: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
      other: process.env.NEXT_PUBLIC_BING_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0e" },
  ],
};

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = t(lang);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, inLanguage: LOCALES.map((l) => HTML_LANG[l]) },
      { "@type": "Organization", "@id": `${site.url}/#org`, name: site.name, url: site.url, logo: `${site.url}/icon.svg` },
    ],
  };
  return (
    <html lang={HTML_LANG[lang]}>
      <body>
        <a href="#main" className="skip">
          {d.skip}
        </a>
        <JsonLd data={ld} />
        <Header locale={lang} />
        <main id="main">{children}</main>
        <Footer locale={lang} />
      </body>
    </html>
  );
}
