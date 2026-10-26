interface Env { MEDIA: R2Bucket; }

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const key = Array.isArray(params.path) ? params.path.join("/") : String(params.path || "");
  if (!key.startsWith("uploads/") || key.includes("..")) return new Response("Not found", { status: 404 });
  const object = await env.MEDIA.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
};
