export async function createPaste(data: Uint8Array): Promise<string> {
  const res = await fetch("/api/paste", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: new Uint8Array(data),
  });
  if (!res.ok) throw new Error("Failed to create paste");
  const { id } = await res.json();
  return id as string;
}

export async function getPaste(id: string): Promise<Uint8Array> {
  const res = await fetch(`/api/paste?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Paste not found or expired");
  return new Uint8Array(await res.arrayBuffer());
}
