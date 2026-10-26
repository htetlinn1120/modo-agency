interface Env { DB: D1Database; }

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)modo_admin_session=([^;]+)/);
  if (match) {
    try {
      await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
        .bind(await sha256(decodeURIComponent(match[1]))).run();
    } catch { /* expire the browser cookie even if D1 is unavailable */ }
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": "modo_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
    },
  });
};
