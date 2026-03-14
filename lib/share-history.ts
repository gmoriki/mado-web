export interface ShareHistoryItem {
  id: string;
  url?: string;
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

/** 表示時に呼ぶ。プレビューだけ保存、URLは生成しない */
export function addViewHistory(markdown: string): string {
  const items = getShareHistory();
  const id = crypto.randomUUID();

  const item: ShareHistoryItem = {
    id,
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

/** 共有ボタン押下時に呼ぶ。URLを保存し共有済みにする */
export function markAsShared(id: string, url: string): void {
  const items = getShareHistory();
  const item = items.find((i) => i.id === id);
  if (item) {
    item.shared = true;
    item.url = url;
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
