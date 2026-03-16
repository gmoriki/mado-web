import { describe, it, expect } from "vitest";
import { compressToFragment, decompressFromFragment } from "../compress";

describe("compress", () => {
  it("圧縮 → 展開で元のテキストに戻る", () => {
    const original = "# Hello\n\nThis is a test.";
    const fragment = compressToFragment(original);
    const result = decompressFromFragment(fragment);
    expect(result).toBe(original);
  });

  it("日本語テキストの往復", () => {
    const original = "# こんにちは\n\nこれはテストです。日本語のMarkdownテキスト。";
    const fragment = compressToFragment(original);
    const result = decompressFromFragment(fragment);
    expect(result).toBe(original);
  });

  it("大量テキストの往復", () => {
    const original = "# Test\n\n" + "Lorem ipsum dolor sit amet. ".repeat(100);
    const fragment = compressToFragment(original);
    const result = decompressFromFragment(fragment);
    expect(result).toBe(original);
  });

  it("フラグメントがURL-safe文字のみ", () => {
    const fragment = compressToFragment("# Test content");
    // Base64URL: アルファベット、数字、ハイフン、アンダースコアのみ
    expect(fragment).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
