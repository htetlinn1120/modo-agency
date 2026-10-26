interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean; meta?: unknown }>;
  run(): Promise<{ success: boolean; meta?: unknown }>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface R2ObjectBody {
  body: ReadableStream<Uint8Array>;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
}
interface R2Bucket {
  put(key: string, value: ArrayBuffer | ArrayBufferView | ReadableStream, options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
}
interface PagesFunction<Env = unknown> {
  (context: {
    request: Request;
    env: Env;
    params: Record<string, string | string[]>;
    next: () => Promise<Response>;
    waitUntil?: (promise: Promise<unknown>) => void;
    data: Record<string, unknown>;
  }): Response | Promise<Response>;
}
