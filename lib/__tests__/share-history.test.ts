import { describe, it, expect, beforeEach } from "vitest";
import {
  addViewHistory,
  getShareHistory,
  removeShareHistory,
  clearShareHistory,
  markAsShared,
} from "../share-history";

beforeEach(() => {
  localStorage.clear();
});

describe("share-history", () => {
  it("addViewHistory でアイテムが追加される", () => {
    const id = addViewHistory("# Test");
    const items = getShareHistory();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(id);
    expect(items[0].shared).toBe(false);
    expect(items[0].preview).toContain("Test");
  });

  it("getShareHistory は空の場合 [] を返す", () => {
    expect(getShareHistory()).toEqual([]);
  });

  it("removeShareHistory でアイテムが削除される", () => {
    const id = addViewHistory("# To remove");
    expect(getShareHistory()).toHaveLength(1);
    removeShareHistory(id);
    expect(getShareHistory()).toHaveLength(0);
  });

  it("clearShareHistory ですべて削除される", () => {
    addViewHistory("# One");
    addViewHistory("# Two");
    expect(getShareHistory()).toHaveLength(2);
    clearShareHistory();
    expect(getShareHistory()).toHaveLength(0);
  });

  it("markAsShared で共有フラグが立つ", () => {
    const id = addViewHistory("# Shared doc");
    markAsShared(id);
    const items = getShareHistory();
    expect(items[0].shared).toBe(true);
  });

  it("markAsShared でURLも更新できる", () => {
    const id = addViewHistory("# Shared doc");
    const newUrl = "https://example.com/view?id=abc#key";
    markAsShared(id, newUrl);
    const items = getShareHistory();
    expect(items[0].url).toBe(newUrl);
  });

  it("100件を超えると古いアイテムが削除される", () => {
    for (let i = 0; i < 105; i++) {
      addViewHistory(`# Doc ${i}`);
    }
    const items = getShareHistory();
    expect(items.length).toBeLessThanOrEqual(100);
  });
});
