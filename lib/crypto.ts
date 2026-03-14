const ALGO = "AES-GCM";
const KEY_BITS = 256;
const IV_BYTES = 12;

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGO, length: KEY_BITS },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  let bin = "";
  for (let i = 0; i < raw.length; i++) bin += String.fromCharCode(raw[i]);
  return btoa(bin)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function importKey(encoded: string): Promise<CryptoKey> {
  let b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const raw = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i);
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: ALGO, length: KEY_BITS },
    false,
    ["decrypt"],
  );
}

export async function encrypt(
  data: Uint8Array,
  key: CryptoKey,
): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: ALGO, iv }, key, new Uint8Array(data)),
  );
  const out = new Uint8Array(IV_BYTES + ct.length);
  out.set(iv);
  out.set(ct, IV_BYTES);
  return out;
}

export async function decrypt(
  data: Uint8Array,
  key: CryptoKey,
): Promise<Uint8Array> {
  const iv = data.slice(0, IV_BYTES);
  const ct = data.slice(IV_BYTES);
  return new Uint8Array(
    await crypto.subtle.decrypt({ name: ALGO, iv }, key, ct),
  );
}
