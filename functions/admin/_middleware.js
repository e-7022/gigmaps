// Закрывает всю админку (/admin и всё внутри) паролем: браузер покажет окно входа (Basic auth).
// Логин — любой, пароль — переменная ADMIN_PASSWORD из Cloudflare Pages → Settings → Variables and secrets.
// Если пароль не задан, админка не открывается вообще.

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function passwordFromBasic(header) {
  const m = /^Basic\s+(.+)$/i.exec(header || "");
  if (!m) return "";
  try {
    const bytes = Uint8Array.from(atob(m[1]), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    return decoded.slice(decoded.indexOf(":") + 1);
  } catch {
    return "";
  }
}

export async function onRequest({ request, env, next }) {
  const expected = env.ADMIN_PASSWORD || "";
  if (!expected) {
    return new Response("Admin is disabled: set ADMIN_PASSWORD in Cloudflare Pages variables.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    });
  }
  if (!safeEqual(passwordFromBasic(request.headers.get("Authorization")), expected)) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Gigmap admin", charset="UTF-8"',
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    });
  }
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set("Cache-Control", "no-store");
  out.headers.set("X-Robots-Tag", "noindex, nofollow");
  return out;
}
