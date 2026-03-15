"use client";

import { useState } from "react";
import { compressToFragment } from "@/lib/compress";
import { markAsShared } from "@/lib/share-history";
import { generateKey, exportKey, encrypt } from "@/lib/crypto";
import { createPaste } from "@/lib/paste-client";
import { deflateSync, strToU8 } from "fflate";

const ENCRYPT_THRESHOLD = 2000;

interface ShareButtonProps {
  markdown: string;
  historyId?: string | null;
}

export function ShareButton({ markdown, historyId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [encrypted, setEncrypted] = useState(false);

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    setWarning(null);

    try {
      const fragment = compressToFragment(markdown);
      let url: string;
      let isEncrypted = false;

      if (fragment.length <= ENCRYPT_THRESHOLD) {
        url = `${window.location.origin}/view#${fragment}`;
      } else {
        try {
          const compressed = deflateSync(strToU8(markdown), { level: 9 });
          const key = await generateKey();
          const blob = await encrypt(compressed, key);
          const id = await createPaste(blob);
          const keyStr = await exportKey(key);
          url = `${window.location.origin}/view?id=${id}#${keyStr}`;
          isEncrypted = true;
        } catch {
          // 暗号化失敗時はフラグメントモードにフォールバック
          url = `${window.location.origin}/view#${fragment}`;
          setWarning(
            "暗号化共有に失敗しました。長いURLとして共有します。",
          );
        }
      }

      await navigator.clipboard.writeText(url);
      if (historyId) {
        markAsShared(historyId, isEncrypted ? url : undefined);
      }
      setEncrypted(isEncrypted);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setEncrypted(false);
      }, 3000);
    } catch {
      setWarning("共有URLの生成に失敗しました");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={sharing}
        className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 sm:px-4 py-2 text-sm font-medium text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
      >
        {sharing ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : copied ? (
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
        {sharing ? "生成中..." : copied ? "コピー!" : "共有"}
      </button>
      {copied && encrypted && (
        <p className="absolute top-full right-0 mt-1 whitespace-nowrap rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 shadow-sm">
          🔒 暗号化済み・90日間有効
        </p>
      )}
      {warning && (
        <p className="absolute top-full right-0 mt-1 w-max rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 shadow-sm">
          {warning}
        </p>
      )}
    </div>
  );
}
