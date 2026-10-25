// Общие функции для Cloudflare Pages Functions админки.
// Переменные окружения проекта Cloudflare Pages:
//   ADMIN_PASSWORD  — пароль админки
//   GITHUB_TOKEN    — fine-grained token с правами Contents: Read and write, Actions: Read and write на репозиторий
//   GITHUB_REPO     — например "e-7022/gigmaps"
//   GITHUB_BRANCH   — по умолчанию "main"

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function checkAuth(request, env) {
  const expected = env.ADMIN_PASSWORD || "";
  const got = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!expected || got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

function cfg(env) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) throw new Error("GITHUB_TOKEN and GITHUB_REPO must be set in Cloudflare Pages → Settings → Variables");
  return { repo: env.GITHUB_REPO, branch: env.GITHUB_BRANCH || "main", token: env.GITHUB_TOKEN };
}

export async function gh(env, path, init = {}) {
  const { token } = cfg(env);
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "gigmap-admin",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok && res.status !== 404) throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res;
}

function b64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function sha(env, file) {
  const { repo, branch } = cfg(env);
  const res = await gh(env, `/repos/${repo}/contents/${file}?ref=${branch}`);
  if (res.status === 404) return null;
  return (await res.json()).sha;
}

export async function putFile(env, file, text, message) {
  const { repo, branch } = cfg(env);
  const current = await sha(env, file);
  await gh(env, `/repos/${repo}/contents/${file}`, {
    method: "PUT",
    body: JSON.stringify({ message, branch, content: b64(text), ...(current ? { sha: current } : {}) }),
  });
}

export async function deleteFile(env, file, message) {
  const { repo, branch } = cfg(env);
  const current = await sha(env, file);
  if (!current) return;
  await gh(env, `/repos/${repo}/contents/${file}`, { method: "DELETE", body: JSON.stringify({ message, branch, sha: current }) });
}

export async function runWorkflow(env, workflow = "update-jobs.yml") {
  const { repo, branch } = cfg(env);
  await gh(env, `/repos/${repo}/actions/workflows/${workflow}/dispatches`, { method: "POST", body: JSON.stringify({ ref: branch }) });
}

export async function lastRuns(env, workflow = "update-jobs.yml") {
  const { repo } = cfg(env);
  const res = await gh(env, `/repos/${repo}/actions/workflows/${workflow}/runs?per_page=5`);
  if (res.status === 404) return [];
  const data = await res.json();
  return (data.workflow_runs || []).map((r) => ({ status: r.status, conclusion: r.conclusion, created: r.created_at, url: r.html_url, event: r.event }));
}
