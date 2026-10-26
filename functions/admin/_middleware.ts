interface Env { DB: D1Database; }

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const url = new URL(request.url);
  if (url.pathname === "/admin/login" || url.pathname === "/admin/login/") return next();

  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)modo_admin_session=([^;]+)/);
  if (!match) return Response.redirect(new URL("/admin/login/", url), 302);

  try {
    const tokenHash = await sha256(decodeURIComponent(match[1]));
    const session = await env.DB.prepare(
      "SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ?"
    ).bind(tokenHash, Math.floor(Date.now() / 1000)).first();
    if (session) return next();
  } catch {
    return new Response("Admin authentication service unavailable", { status: 503 });
  }
  return Response.redirect(new URL("/admin/login/", url), 302);
};
