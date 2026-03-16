"use client";

import { useState } from "react";
import { compressToFragment } from "@/lib/compress";
import { markAsShared } from "@/lib/share-history";
import { generateKey, exportKey, encrypt } from "@/lib/crypto";
import { createPaste, PasteError } from "@/lib/paste-client";
import { deflateSync, strToU8 } from "fflate";

// フラグメントURLの最大長（これ以下なら直接URLに埋め込む）
const MAX_FRAGMENT_URL = 150;

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
      const origin = window.location.origin;

      if (fragment.length <= MAX_FRAGMENT_URL) {
        await navigator.clipboard.writeText(`${origin}/view#${fragment}`);
        if (historyId) markAsShared(historyId);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return;
      }

      // 暗号化ペーストで短いURLを生成
      // ClipboardItem に Promise を渡すことで、ユーザージェスチャー内で
      // クリップボード書き込みを登録し、内容は非同期で解決する
      let resultUrl = "";
      let pasteSucceeded = false;

      let pasteErrorKind: string | null = null;

      const urlPromise = (async (): Promise<string> => {
        try {
          const compressed = deflateSync(strToU8(markdown), { level: 9 });
          const key = await generateKey();
          const blob = await encrypt(compressed, key);
          const id = await createPaste(blob);
          const keyStr = await exportKey(key);
          resultUrl = `${origin}/view?id=${id}#${keyStr}`;
          pasteSucceeded = true;
          return resultUrl;
        } catch (err) {
          if (err instanceof PasteError) pasteErrorKind = err.kind;
          resultUrl = `${origin}/view#${fragment}`;
          return resultUrl;
        }
      })();

      const blobPromise = urlPromise.then(
        (url) => new Blob([url], { type: "text/plain" }),
      );
      const item = new ClipboardItem({
        "text/plain": blobPromise as Promise<Blob>,
      });
      await navigator.clipboard.write([item]);

      if (pasteSucceeded) {
        if (historyId) markAsShared(historyId, resultUrl);
        setEncrypted(true);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setEncrypted(false);
        }, 3000);
      } else {
        if (historyId) markAsShared(historyId);
        const warningMessages: Record<string, string> = {
          timeout: "サーバーへの接続がタイムアウトしました。長いURLで共有します。",
          network: "ネットワークに接続できません。長いURLで共有します。",
        };
        setWarning(
          (pasteErrorKind && warningMessages[pasteErrorKind]) ||
          "サーバーに接続できませんでした。長いURLで共有します。"
        );
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setWarning(null);
        }, 4000);
      }
    } catch {
      setWarning("共有URLの生成に失敗しました");
      setTimeout(() => setWarning(null), 4000);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={sharing}
        aria-label={sharing ? "共有リンクを生成中" : copied ? "共有リンクをコピーしました" : "共有リンクを生成"}
        className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 sm:px-4 py-2 text-sm font-medium text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
      >
        {sharing ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : copied ? (
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
          </svg>
        )}
        {sharing ? "生成中..." : copied ? "コピー!" : "共有"}
      </button>
      {copied && encrypted && (
        <p className="absolute top-full right-0 mt-1 whitespace-nowrap rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 shadow-sm">
          暗号化済み・90日間有効
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
