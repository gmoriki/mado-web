// Cloudflare Pages Advanced Mode Worker
//
// KV セットアップ手順:
// 1. wrangler kv namespace create KV_BINDING
// 2. Cloudflare Dashboard → Pages → mado-web → Settings → Functions
//    → KV namespace bindings → 変数名: KV_BINDING, KVネームスペース: 上で作ったもの

const MAX_SIZE = 512 * 1024; // 512KB
const TTL = 90 * 24 * 60 * 60; // 90日
const ID_LENGTH = 12;
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateId() {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join("");
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsOrigin(request) {
  const origin = request.headers.get("Origin") || "";
  const host = request.headers.get("Host") || "";
  // 同一オリジンのみ許可
  if (origin && new URL(origin).host === host) {
    return origin;
  }
  return "";
}

function withCors(response, request) {
  const origin = corsOrigin(request);
  if (!origin) return response;
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/paste") {
      // CORS preflight
      if (request.method === "OPTIONS") {
        return withCors(new Response(null, { status: 204 }), request);
      }

      if (!env.KV_BINDING) {
        return withCors(
          Response.json({ error: "Storage not configured" }, { status: 503 }),
          request,
        );
      }

      if (request.method === "POST") {
        const contentType = request.headers.get("Content-Type") || "";
        if (!contentType.includes("octet-stream")) {
          return withCors(
            Response.json({ error: "Invalid content type" }, { status: 400 }),
            request,
          );
        }
        const body = await request.arrayBuffer();
        if (body.byteLength === 0 || body.byteLength > MAX_SIZE) {
          return withCors(
            Response.json({ error: "Invalid size" }, { status: 400 }),
            request,
          );
        }
        const id = generateId();
        await env.KV_BINDING.put(id, body, { expirationTtl: TTL });
        return withCors(Response.json({ id }), request);
      }

      if (request.method === "GET") {
        const id = url.searchParams.get("id");
        if (!id || !/^[A-Za-z0-9]+$/.test(id)) {
          return withCors(
            Response.json({ error: "Invalid id" }, { status: 400 }),
            request,
          );
        }
        const data = await env.KV_BINDING.get(id, "arrayBuffer");
        if (!data) {
          return withCors(
            Response.json(
              { error: "Not found or expired" },
              { status: 404 },
            ),
            request,
          );
        }
        return withCors(
          new Response(data, {
            headers: {
              "Content-Type": "application/octet-stream",
              "Cache-Control": "private, immutable, max-age=86400",
            },
          }),
          request,
        );
      }

      return withCors(
        new Response("Method not allowed", { status: 405 }),
        request,
      );
    }

    // その他のリクエスト → 静的アセット
    return env.ASSETS.fetch(request);
  },
};
