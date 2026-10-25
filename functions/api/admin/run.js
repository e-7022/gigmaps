import { checkAuth, json, lastRuns, runWorkflow } from "../../_lib/github.js";

// POST — запустить скрапер сейчас; GET — последние запуски
export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return json({ error: "Wrong password" }, 401);
  try {
    await runWorkflow(env);
    return json({ ok: true, message: "Scraper started. New jobs appear on the site in ~5 minutes." });
  } catch (e) {
    return json({ error: e.message }, 400);
  }
}

export async function onRequestGet({ request, env }) {
  if (!checkAuth(request, env)) return json({ error: "Wrong password" }, 401);
  try {
    return json({ runs: await lastRuns(env) });
  } catch (e) {
    return json({ error: e.message }, 400);
  }
}
