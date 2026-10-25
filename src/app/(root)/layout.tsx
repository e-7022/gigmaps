import type { Metadata } from "next";
import "../globals.css";
import { site } from "@/lib/site";
import { HTML_LANG, LOCALES } from "@/i18n/config";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — AI training jobs by country`,
  description: "AI training jobs with eligibility and payout status by country. Available in English, Русский, Español, Français, 中文.",
  alternates: {
    canonical: "/en",
    languages: Object.fromEntries([...LOCALES.map((l) => [HTML_LANG[l], `/${l}`]), ["x-default", "/en"]]),
  },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
