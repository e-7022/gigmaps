#!/usr/bin/env node
// Удаляет RSC-файлы (*.txt) статического экспорта: сайту они не нужны (ссылки работают обычной загрузкой страниц),
// а их тысячи — без них проект укладывается в лимит Cloudflare Pages (20 000 файлов).
import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("out");
const KEEP = new Set(["llms.txt", "robots.txt"]);
let removed = 0;
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (p.includes(`${path.sep}_next`) || p.includes(`${path.sep}admin`) || p.includes(`${path.sep}data`)) continue;
      await walk(p);
    } else if (e.name.endsWith(".txt") && !KEEP.has(e.name)) {
      await rm(p);
      removed++;
    }
  }
}
await walk(OUT);
console.log(`postbuild: removed ${removed} RSC payload files`);
