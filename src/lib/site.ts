// Единая точка настройки бренда и домена.
export const site = {
  name: "Gigmap",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gigmap.pages.dev").replace(/\/$/, ""),
  lastVerified: "2026-10-25",
  author: "Mikhail Koksharov",
} as const;

export function abs(path: string) {
  return `${site.url}${path}`;
}
