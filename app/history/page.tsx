"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getShareHistory,
  removeShareHistory,
  clearShareHistory,
} from "@/lib/share-history";
import type { ShareHistoryItem } from "@/lib/share-history";
import { HistoryCard } from "@/components/history-card";

export default function HistoryPage() {
  const [items, setItems] = useState<ShareHistoryItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[var(--foreground)]">
          閲覧履歴
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

      <p className="mb-6 text-sm text-[var(--muted-foreground)]">
        履歴はこの端末のブラウザにのみ保存されています。他の端末やブラウザからは見えません。ブラウザのデータを消去すると履歴も失われます。
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <p className="text-[var(--muted-foreground)]">
            閲覧履歴はまだありません
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
          <div className="grid gap-3">
            {items.slice(0, displayCount).map((item) => (
              <HistoryCard key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </div>
          {items.length > displayCount && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setDisplayCount((c) => c + 20)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
              >
                もっと見る（残り {items.length - displayCount} 件）
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
