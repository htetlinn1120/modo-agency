interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
}

const allowedKeys = new Set(["services", "clients", "projects", "insights"]);

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hasAdminSession(request: Request, env: Env): Promise<boolean> {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\\s*)modo_admin_session=([^;]+)/);
  if (!match) return false;
  const token = decodeURIComponent(match[1]);
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(
    "SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ?"
  ).bind(tokenHash, Math.floor(Date.now() / 1000)).first();
  return Boolean(row);
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const result = await env.DB.prepare(
      "SELECT content_key, content_json, updated_at FROM content"
    ).all<{content_key: string; content_json: string; updated_at: string}>();
    const content: Record<string, unknown> = {};
    for (const row of result.results || []) {
      try { content[row.content_key] = JSON.parse(row.content_json); } catch { /* ignore invalid legacy row */ }
    }
    return Response.json({ content });
  } catch {
    return Response.json({ error: "Content service is not configured" }, { status: 503 });
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await hasAdminSession(request, env))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { key?: string; content?: unknown };
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.key || !allowedKeys.has(body.key) || body.content === undefined) {
    return Response.json({ error: "Invalid content payload" }, { status: 400 });
  }
  const serialized = JSON.stringify(body.content);
  if (serialized.length > 1_000_000) {
    return Response.json({ error: "Content too large" }, { status: 413 });
  }
  try {
    await env.DB.prepare(
      "INSERT INTO content (content_key, content_json, updated_at, updated_by) VALUES (?, ?, datetime('now'), 'admin') ON CONFLICT(content_key) DO UPDATE SET content_json = excluded.content_json, updated_at = datetime('now'), updated_by = 'admin'"
    ).bind(body.key, serialized).run();
    return Response.json({ ok: true, key: body.key });
  } catch {
    return Response.json({ error: "Could not save content" }, { status: 503 });
  }
};
