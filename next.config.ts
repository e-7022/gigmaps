import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Статический экспорт: папка out/ загружается на Cloudflare Pages как есть.
  output: "export",
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
