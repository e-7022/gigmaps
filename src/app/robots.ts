import type { MetadataRoute } from "next";
export const dynamic = "force-static";
import { site } from "@/lib/site";

// Явно разрешаем поисковым и AI-краулерам: так сайт может попадать в ответы
// ChatGPT, Claude, Perplexity, Gemini и Copilot.
const aiBots = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
  "YandexBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }, ...aiBots.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/admin", "/api"] }))],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
