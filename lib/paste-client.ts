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
      throw new Error(
        (body as { error?: string }).error || `HTTP ${res.status}`,
      );
    }
    const { id } = await res.json();
    if (typeof id !== "string" || !/^[A-Za-z0-9]+$/.test(id)) {
      throw new Error("Invalid paste id");
    }
    return id;
  } finally {
    clearTimeout(timer);
  }
}

export async function getPaste(id: string): Promise<Uint8Array> {
  if (!/^[A-Za-z0-9]+$/.test(id)) {
    throw new Error("Invalid paste id");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PASTE_TIMEOUT);
  try {
    const res = await fetch(`/api/paste?id=${encodeURIComponent(id)}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("Paste not found or expired");
    return new Uint8Array(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}
