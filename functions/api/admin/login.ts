interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;\n  ADMIN_EMAIL: string;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { password?: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!env.ADMIN_PASSWORD || !env.ADMIN_EMAIL || typeof body.email !== "string" || typeof body.password !== "string" || body.password.length > 512) {
    return Response.json({ error: "Login is not configured" }, { status: 503 });
  }
  if (body.email.trim().toLowerCase() !== env.ADMIN_EMAIL.trim().toLowerCase() || body.password !== env.ADMIN_PASSWORD) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = randomToken();
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 60 * 60 * 12;
  try {
    await env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").bind(now).run();
    await env.DB.prepare("INSERT INTO admin_sessions (token_hash, expires_at, created_at) VALUES (?, ?, ?)")
      .bind(tokenHash, expires, now).run();
  } catch {
    return Response.json({ error: "Session service is not configured" }, { status: 503 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": `modo_admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 12}`,
    },
  });
};
