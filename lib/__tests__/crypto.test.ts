import { describe, it, expect } from "vitest";
import { generateKey, exportKey, importKey, encrypt, decrypt } from "../crypto";

describe("crypto", () => {
  it("encrypt → decrypt で元のデータに戻る", async () => {
    const key = await generateKey();
    const original = new TextEncoder().encode("Hello, World!");
    const encrypted = await encrypt(original, key);
    const decrypted = await decrypt(encrypted, key);
    expect(new TextDecoder().decode(decrypted)).toBe("Hello, World!");
  });

  it("鍵長が128ビット（16バイト）", async () => {
    const key = await generateKey();
    const exported = await exportKey(key);
    // Base64URLデコードして16バイトであることを確認
    let b64 = exported.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const raw = atob(b64);
    expect(raw.length).toBe(16);
  });

  it("exportKey → importKey で往復できる", async () => {
    const key = await generateKey();
    const exported = await exportKey(key);
    const imported = await importKey(exported);

    const data = new TextEncoder().encode("往復テスト");
    const encrypted = await encrypt(data, key);
    const decrypted = await decrypt(encrypted, imported);
    expect(new TextDecoder().decode(decrypted)).toBe("往復テスト");
  });

  it("異なる鍵では復号に失敗する", async () => {
    const key1 = await generateKey();
    const key2 = await generateKey();
    const data = new TextEncoder().encode("secret");
    const encrypted = await encrypt(data, key1);

    await expect(decrypt(encrypted, key2)).rejects.toThrow();
  });
});
