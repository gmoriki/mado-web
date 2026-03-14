"use client";

import { useState } from "react";
import { compressToFragment, URL_LENGTH_WARNING } from "@/lib/compress";
import { markAsShared } from "@/lib/share-history";

interface ShareButtonProps {
  markdown: string;
  historyId?: string | null;
}

export function ShareButton({ markdown, historyId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      const fragment = compressToFragment(markdown);
      const url = `${window.location.origin}/view#${fragment}`;

      if (url.length > URL_LENGTH_WARNING) {
        setWarning(
          `URL長が ${url.length.toLocaleString()} 文字です。一部のブラウザで共有できない場合があります。`
        );
      } else {
        setWarning(null);
      }

      await navigator.clipboard.writeText(url);
      if (historyId) {
        markAsShared(historyId);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setWarning("クリップボードへのコピーに失敗しました");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)]"
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
          </svg>
        )}
        {copied ? "コピーしました!" : "共有URLをコピー"}
      </button>
      {warning && (
        <p className="absolute top-full right-0 mt-1 w-max max-w-xs rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 shadow-sm">
          {warning}
        </p>
      )}
    </div>
  );
}
