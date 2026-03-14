"use client";

import { useState } from "react";
import type { ShareHistoryItem } from "@/lib/share-history";

interface HistoryCardProps {
  item: ShareHistoryItem;
  onRemove: (id: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 30) return `${days}日前`;
  return new Date(dateStr).toLocaleDateString("ja-JP");
}

function extractTitle(preview: string): { title: string; body: string } {
  const text = preview || "（プレビューなし）";
  const firstBreak = text.indexOf(" ", 20);
  if (firstBreak === -1 || firstBreak > 40) {
    return { title: text.slice(0, 30), body: text.slice(30) };
  }
  return { title: text.slice(0, firstBreak), body: text.slice(firstBreak + 1) };
}

export function HistoryCard({ item, onRemove }: HistoryCardProps) {
  const [copied, setCopied] = useState(false);
  const { title, body } = extractTitle(item.preview);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.url) return;
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(item.id);
  };

  return (
    <a
      href={item.url}
      onClick={() => {
        sessionStorage.setItem("mado-nav-source", "history");
      }}
      className="group relative flex min-h-[130px] flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--muted-foreground)]/30 hover:shadow-md"
    >
      {/* 削除ボタン — ホバー時のみ */}
      <button
        onClick={handleRemove}
        className="absolute right-2 top-2 rounded-md p-1 text-[var(--muted-foreground)] opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
        title="削除"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" x2="6" y1="6" y2="18" />
          <line x1="6" x2="18" y1="6" y2="18" />
        </svg>
      </button>

      {/* コンテンツ */}
      <div className="min-w-0 pr-6">
        <p className="text-sm font-medium text-[var(--foreground)] line-clamp-1">
          {title}
        </p>
        {body && (
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
            {body}
          </p>
        )}
      </div>

      {/* フッター */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-[var(--muted-foreground)]">
          {formatRelativeTime(item.createdAt)}
        </span>
        <div className="flex items-center gap-1.5">
          {item.shared && (
            <button
              onClick={handleCopy}
              className="rounded-md p-1 text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              title="共有URLをコピー"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </a>
  );
}
