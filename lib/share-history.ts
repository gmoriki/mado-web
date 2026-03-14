import { compressToFragment } from "@/lib/compress";

export interface ShareHistoryItem {
  id: string;
  url: string;
  preview: string;
  createdAt: string;
  shared: boolean;
}

const STORAGE_KEY = "mado-share-history";
const MAX_ITEMS = 100;

function extractPreview(markdown: string): string {
  return markdown
    .replace(/^#+\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 100);
}

/** 表示時に呼ぶ。履歴に追加し、IDを返す */
export function addViewHistory(markdown: string): string {
  const items = getShareHistory();
  const fragment = compressToFragment(markdown);
  const url = `${window.location.origin}/view#${fragment}`;
  const id = crypto.randomUUID();

  const item: ShareHistoryItem = {
    id,
    url,
    preview: extractPreview(markdown),
    createdAt: new Date().toISOString(),
    shared: false,
  };
  items.unshift(item);
  if (items.length > MAX_ITEMS) {
    items.length = MAX_ITEMS;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return id;
}

/** 共有ボタン押下時に呼ぶ。既存エントリを共有済みにする */
export function markAsShared(id: string): void {
  const items = getShareHistory();
  const item = items.find((i) => i.id === id);
  if (item) {
    item.shared = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

export function getShareHistory(): ShareHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function removeShareHistory(id: string): void {
  const items = getShareHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function clearShareHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
