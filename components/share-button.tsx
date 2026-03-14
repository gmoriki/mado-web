"use client";

import { useState } from "react";
import { compressToFragment } from "@/lib/compress";
import { addShareHistory } from "@/lib/share-history";

interface ShareButtonProps {
  markdown: string;
}

export function ShareButton({ markdown }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      setWarning(null);

      // Try short URL via API first
      let url: string;
      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown }),
        });
        if (!res.ok) throw new Error("api error");
        const { id } = await res.json();
        url = `${window.location.origin}/s/${id}`;
      } catch {
        // Fallback to hash-based URL
        const fragment = compressToFragment(markdown);
        url = `${window.location.origin}/view#${fragment}`;
        if (url.length > 8000) {
          setWarning(
            `URL長が ${url.length.toLocaleString()} 文字です。一部のブラウザで共有できない場合があります。`
          );
        }
      }

      await navigator.clipboard.writeText(url);
      addShareHistory(url, markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setWarning("クリップボードへのコピーに失敗しました");
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)]"
      >
        {copied ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-500"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
          </svg>
        )}
        {copied ? "コピーしました!" : "共有URLをコピー"}
      </button>
      {warning && (
        <p className="text-xs text-amber-600 dark:text-amber-400">{warning}</p>
      )}
    </div>
  );
}
