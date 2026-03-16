"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getShareHistory,
  removeShareHistory,
  clearShareHistory,
} from "@/lib/share-history";
import type { ShareHistoryItem } from "@/lib/share-history";
import { HistoryCard } from "@/components/history-card";

type SortKey = "newest" | "oldest";
type FilterKey = "all" | "shared" | "local";

export default function HistoryPage() {
  const [items, setItems] = useState<ShareHistoryItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    setItems(getShareHistory());
  }, []);

  const handleRemove = (id: string) => {
    removeShareHistory(id);
    setItems(getShareHistory());
  };

  const handleClearAll = () => {
    clearShareHistory();
    setItems([]);
    setShowConfirm(false);
  };

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) => i.preview?.toLowerCase().includes(q));
    }
    if (filter === "shared") result = result.filter((i) => i.shared);
    if (filter === "local") result = result.filter((i) => !i.shared);
    if (sort === "oldest") result = [...result].reverse();
    return result;
  }, [items, search, sort, filter]);

  const sharedCount = items.filter((i) => i.shared).length;
  const localCount = items.length - sharedCount;

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
          最近のドキュメント
        </h1>
        {items.length > 0 &&
          (showConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted-foreground)]">
                本当に全て削除しますか？
              </span>
              <button
                onClick={handleClearAll}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                削除する
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-red-500"
            >
              すべて削除
            </button>
          ))}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <p className="text-[var(--muted-foreground)]">
            まだドキュメントがありません
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            ホームでMarkdownをペーストして表示すると、ここに履歴が残ります
          </p>
          <Link
            href="/"
            className="text-sm text-[var(--primary)] underline underline-offset-4"
          >
            ホームに戻る
          </Link>
        </div>
      ) : (
        <>
          {/* 検索 + フィルター + 並び替え */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-0 max-w-xs">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="ドキュメントを検索"
                placeholder="検索..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-1.5 pl-8 pr-3 text-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20"
              />
            </div>
            <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--muted)] p-0.5 text-xs">
              {([
                ["all", `すべて ${items.length}`],
                ["shared", `共有済み ${sharedCount}`],
                ["local", `閲覧のみ ${localCount}`],
              ] as [FilterKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    filter === key
                      ? "bg-[var(--card)] text-[var(--card-foreground)] shadow-sm"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)] cursor-pointer"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
            </select>
          </div>

          {/* 結果 */}
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">
              該当するドキュメントがありません
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.slice(0, displayCount).map((item) => (
                  <HistoryCard key={item.id} item={item} onRemove={handleRemove} />
                ))}
              </div>
              {filtered.length > displayCount && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setDisplayCount((c) => c + 20)}
                    className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
                  >
                    もっと見る（残り {filtered.length - displayCount} 件）
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
