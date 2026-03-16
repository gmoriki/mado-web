export type PasteErrorKind = "timeout" | "network" | "not_found" | "server" | "invalid";

export class PasteError extends Error {
  readonly kind: PasteErrorKind;
  constructor(kind: PasteErrorKind, message: string) {
    super(message);
    this.name = "PasteError";
    this.kind = kind;
  }
}

const PASTE_TIMEOUT = 10_000; // 10秒

export async function createPaste(data: Uint8Array): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PASTE_TIMEOUT);
  try {
    const res = await fetch("/api/paste", {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: new Uint8Array(data),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = (body as { error?: string }).error || `HTTP ${res.status}`;
      if (res.status >= 500) throw new PasteError("server", msg);
      throw new PasteError("invalid", msg);
    }
    const { id } = await res.json();
    if (typeof id !== "string" || !/^[A-Za-z0-9]+$/.test(id)) {
      throw new PasteError("invalid", "Invalid paste id");
    }
    return id;
  } catch (err) {
    if (err instanceof PasteError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new PasteError("timeout", "Request timed out");
    }
    if (err instanceof TypeError) {
      throw new PasteError("network", "Network error");
    }
    throw new PasteError("server", String(err));
  } finally {
    clearTimeout(timer);
  }
}

export async function getPaste(id: string): Promise<Uint8Array> {
  if (!/^[A-Za-z0-9]+$/.test(id)) {
    throw new PasteError("invalid", "Invalid paste id");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PASTE_TIMEOUT);
  try {
    const res = await fetch(`/api/paste?id=${encodeURIComponent(id)}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new PasteError("not_found", "Paste not found or expired");
      }
      throw new PasteError("server", `HTTP ${res.status}`);
    }
    return new Uint8Array(await res.arrayBuffer());
  } catch (err) {
    if (err instanceof PasteError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new PasteError("timeout", "Request timed out");
    }
    if (err instanceof TypeError) {
      throw new PasteError("network", "Network error");
    }
    throw new PasteError("server", String(err));
  } finally {
    clearTimeout(timer);
  }
}
