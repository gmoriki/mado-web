import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR =
  process.env.NODE_ENV === "production"
    ? "/tmp/mado-shares"
    : join(process.cwd(), ".data");
const STORE_FILE = join(DATA_DIR, "shares.json");

function readStore(): Record<string, string> {
  try {
    if (existsSync(STORE_FILE)) {
      return JSON.parse(readFileSync(STORE_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function writeStore(store: Record<string, string>) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_FILE, JSON.stringify(store));
}

export function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function storeShare(id: string, markdown: string) {
  const store = readStore();
  store[id] = markdown;
  writeStore(store);
}

export function getShare(id: string): string | null {
  const store = readStore();
  return store[id] || null;
}
