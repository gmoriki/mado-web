"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { markdownToHtml } from "@/lib/markdown";
import { decompressFromFragment } from "@/lib/compress";
import { importKey, decrypt } from "@/lib/crypto";
import { getPaste } from "@/lib/paste-client";
import { addViewHistory, markAsShared } from "@/lib/share-history";
import { inflateSync, strFromU8 } from "fflate";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TableOfContents } from "@/components/toc";
import { ShareButton } from "@/components/share-button";
import { ModeToggle, type ViewMode } from "@/components/mode-toggle";
import { EditorPane } from "@/components/editor-pane";
import { SplitView } from "@/components/split-view";
import { FONTS, type FontId, getStoredFont, setStoredFont } from "@/lib/font";
import Link from "next/link";

const STORAGE_KEY = "mado-markdown";

export default function ViewPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [mode, setMode] = useState<ViewMode>("view");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const [activeFont, setActiveFont] = useState<FontId>("line-seed-jp");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveFont(getStoredFont());
    setHeaderSlot(document.getElementById("header-slot"));
  }, []);

  const handleFontChange = (fontId: FontId) => {
    setActiveFont(fontId);
    setStoredFont(fontId);
    document.documentElement.style.setProperty(
      "--font-body",
      FONTS[fontId].family
    );
  };

  // Initial load
  useEffect(() => {
    async function load() {
      try {
        let md: string | null = null;

        const searchParams = new URLSearchParams(window.location.search);
        const pasteId = searchParams.get("id");
        const hash = window.location.hash.slice(1);
        let isExternalShare = false;

        if (pasteId) {
          // 暗号化ペーストモード
          if (!hash) {
            setError("共有URLに復号鍵が含まれていません。URLが不完全です。");
            setLoading(false);
            return;
          }
          let encryptedData: Uint8Array;
          try {
            encryptedData = await getPaste(pasteId);
          } catch {
            setError("共有ドキュメントが見つかりません。期限切れ（90日）の可能性があります。");
            setLoading(false);
            return;
          }
          try {
            const key = await importKey(hash);
            const compressed = await decrypt(encryptedData, key);
            md = strFromU8(inflateSync(compressed));
          } catch {
            setError("ドキュメントの復号に失敗しました。URLが不完全な可能性があります。");
            setLoading(false);
            return;
          }
          setIsEncrypted(true);
          isExternalShare = true;
        } else if (hash) {
          // レガシーフラグメントモード
          try {
            md = decompressFromFragment(hash);
          } catch {
            setError("共有URLの展開に失敗しました。URLが不完全な可能性があります。");
            setLoading(false);
            return;
          }
          isExternalShare = true;
        }

        if (isExternalShare) {
          const fromHistory = sessionStorage.getItem('mado-nav-source') === 'history';
          sessionStorage.removeItem('mado-nav-source');
          if (!fromHistory) {
            setIsShared(true);
          }
        }

        if (!md) {
          md = sessionStorage.getItem(STORAGE_KEY);
        }

        if (!md) {
          router.replace("/");
          return;
        }

        setMarkdown(md);
        const rendered = await markdownToHtml(md);
        setHtml(rendered);
        setContentKey((k) => k + 1);

        if (!isExternalShare) {
          const id = addViewHistory(md);
          setHistoryId(id);
        }
      } catch {
        setError("Markdownの変換中にエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  // Debounced re-render on markdown edit
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown);
    sessionStorage.setItem(STORAGE_KEY, newMarkdown);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const rendered = await markdownToHtml(newMarkdown);
        setHtml(rendered);
        setContentKey((k) => k + 1);
      } catch {
        // Keep previous HTML on error
      }
    }, 300);
  }, []);

  const handleOpenInEditor = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, markdown);
    window.location.href = `${window.location.origin}/view`;
  }, [markdown]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-[var(--muted-foreground)]">{error}</p>
        <Link
          href="/"
          className="text-sm text-[var(--primary)] underline underline-offset-4"
        >
          ホームに戻る
        </Link>
      </div>
    );
  }

  if (!html && mode === "view") return null;

  return (
    <div>
      {headerSlot && createPortal(
        <>
          <style>{`@media(max-width:639px){#header-nav{display:none!important}}`}</style>
          {isShared ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleOpenInEditor}
                className="rounded-md px-1.5 py-1 text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              >
                編集する
              </button>
              {isEncrypted && (
                <div className="group relative">
                  <div className="rounded-full p-1 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-default">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div className="invisible group-hover:visible absolute right-0 top-full mt-1 z-50 w-72 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg">
                    <p className="text-xs font-medium text-[var(--foreground)] mb-1">End-to-End 暗号化</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      内容はブラウザで暗号化されてからサーバーに保存されました。「鍵」はこのURLだけに含まれており、サーバーには渡りません。このURLを知っている人だけが読めます。
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <label className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 py-1 text-[11px] sm:text-xs transition-colors hover:bg-[var(--muted)] cursor-pointer">
                <span className="text-[var(--muted-foreground)]">Aa</span>
                <select
                  value={activeFont}
                  onChange={(e) => handleFontChange(e.target.value as FontId)}
                  className="bg-transparent text-[var(--card-foreground)] outline-none cursor-pointer"
                >
                  {(Object.keys(FONTS) as FontId[]).map((id) => (
                    <option key={id} value={id}>
                      {FONTS[id].label}
                    </option>
                  ))}
                </select>
              </label>
              <ModeToggle mode={mode} onChange={setMode} />
              {markdown && <ShareButton markdown={markdown} historyId={historyId} />}
            </div>
          )}
          <div className="hidden sm:block w-px h-4 bg-[var(--border)]" />
        </>,
        headerSlot,
      )}

      {mode === "view" && html && (
        <>
          <MarkdownRenderer html={html} />
          <TableOfContents contentKey={String(contentKey)} />
        </>
      )}

      {mode === "edit" && !isShared && (
        <div className="rounded-xl border border-[var(--border)]">
          <EditorPane value={markdown} onChange={handleMarkdownChange} />
        </div>
      )}

      {mode === "split" && !isShared && (
        <SplitView
          editor={<EditorPane value={markdown} onChange={handleMarkdownChange} />}
          preview={
            html ? (
              <>
                <MarkdownRenderer html={html} />
                <TableOfContents contentKey={String(contentKey)} />
              </>
            ) : (
              <div className="p-4 text-[var(--muted-foreground)]">プレビュー生成中...</div>
            )
          }
        />
      )}
    </div>
  );
}
