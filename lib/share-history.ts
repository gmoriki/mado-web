export interface ShareHistoryItem {
  id: string;
  url: string;
  preview: string;
  createdAt: string;
}

const STORAGE_KEY = "mado-share-history";
const MAX_ITEMS = 50;

function extractPreview(markdown: string): string {
  return markdown
    .replace(/^#+\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 100);
}

export function addShareHistory(url: string, markdown: string): void {
  const items = getShareHistory();
  const item: ShareHistoryItem = {
    id: crypto.randomUUID(),
    url,
    preview: extractPreview(markdown),
    createdAt: new Date().toISOString(),
  };
  items.unshift(item);
  if (items.length > MAX_ITEMS) {
    items.length = MAX_ITEMS;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
