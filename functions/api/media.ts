interface Env { DB: D1Database; MEDIA: R2Bucket; }

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function hasAdminSession(request: Request, env: Env): Promise<boolean> {
  const match = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)modo_admin_session=([^;]+)/);
  if (!match) return false;
  const tokenHash = await sha256(decodeURIComponent(match[1]));
  const row = await env.DB.prepare(
    "SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ?"
  ).bind(tokenHash, Math.floor(Date.now() / 1000)).first();
  return Boolean(row);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await hasAdminSession(request, env))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Image file required" }, { status: 400 });
  const types = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (!types.has(file.type)) return Response.json({ error: "Only JPG, PNG, WebP and AVIF images are supported" }, { status: 415 });
  if (file.size < 1 || file.size > 10 * 1024 * 1024) return Response.json({ error: "Image must be smaller than 10 MB" }, { status: 413 });

  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as Record<string, string>)[file.type];
  const id = crypto.randomUUID();
  const key = `uploads/${id}.${extension}`;
  await env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
  });
  return Response.json({ ok: true, key, url: `/api/media/${key}` });
};
