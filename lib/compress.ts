import { deflateSync, inflateSync, strToU8, strFromU8 } from "fflate";

export function compressToFragment(markdown: string): string {
  const bytes = strToU8(markdown);
  const compressed = deflateSync(bytes, { level: 9 });
  // chunked Base64URL encoding
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < compressed.length; i += chunkSize) {
    binary += String.fromCharCode(...compressed.subarray(i, i + chunkSize));
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decompressFromFragment(fragment: string): string {
  let base64 = fragment.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return strFromU8(inflateSync(bytes));
}

export function estimateFragmentLength(markdown: string): number {
  return compressToFragment(markdown).length;
}

export const URL_LENGTH_WARNING = 8000;
