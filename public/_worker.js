// Cloudflare Pages Advanced Mode Worker
//
// KV セットアップ手順:
// 1. wrangler kv namespace create PASTE_KV
// 2. Cloudflare Dashboard → Pages → mado-web → Settings → Functions
//    → KV namespace bindings → 変数名: PASTE_KV, KVネームスペース: 上で作ったもの

const MAX_SIZE = 512 * 1024; // 512KB
const TTL = 90 * 24 * 60 * 60; // 90日
const ID_LENGTH = 8;
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateId() {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join("");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/paste") {
      if (!env.PASTE_KV) {
        return Response.json(
          { error: "Storage not configured" },
          { status: 503 },
        );
      }

      if (request.method === "POST") {
        const body = await request.arrayBuffer();
        if (body.byteLength === 0 || body.byteLength > MAX_SIZE) {
          return Response.json({ error: "Invalid size" }, { status: 400 });
        }
        const id = generateId();
        await env.PASTE_KV.put(id, body, { expirationTtl: TTL });
        return Response.json({ id });
      }

      if (request.method === "GET") {
        const id = url.searchParams.get("id");
        if (!id) {
          return Response.json({ error: "Missing id" }, { status: 400 });
        }
        const data = await env.PASTE_KV.get(id, "arrayBuffer");
        if (!data) {
          return Response.json(
            { error: "Not found or expired" },
            { status: 404 },
          );
        }
        return new Response(data, {
          headers: { "Content-Type": "application/octet-stream" },
        });
      }

      return new Response("Method not allowed", { status: 405 });
    }

    // その他のリクエスト → 静的アセット
    return env.ASSETS.fetch(request);
  },
};
