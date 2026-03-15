"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const [toolbarMode, setToolbarMode] = useState<"top" | "bottom">("top");
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);
  const modeRef = useRef<"top" | "bottom">("top");
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveFont(getStoredFont());
  }, []);

  // スクロール方向検出: 上→下へ移行、アイドルで再表示
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const down = y > lastScrollY.current;
      const delta = Math.abs(y - lastScrollY.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);

      // 微小スクロールは無視（モバイルのバウンス等）
      if (delta < 5) {
        lastScrollY.current = y;
        return;
      }

      if (y < 50) {
        modeRef.current = "top";
        setToolbarMode("top");
        setToolbarVisible(true);
      } else if (modeRef.current === "top") {
        modeRef.current = "bottom";
        setToolbarMode("bottom");
        setToolbarVisible(false);
      }

      // ページ最下部ではツールバーを隠す（フッターを邪魔しない）
      const nearBottom = (window.innerHeight + y) >= (document.body.scrollHeight - 80);

      if (modeRef.current === "bottom") {
        if (nearBottom) {
          setToolbarVisible(false);
        } else if (!down) {
          // 上スクロールで表示
          setToolbarVisible(true);
        } else {
          // 下スクロールで隠す
          setToolbarVisible(false);
        }
      }

      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
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

  const renderControls = () =>
    isShared ? (
      <>
        <button
          onClick={handleOpenInEditor}
          className="rounded-md px-2 py-1 text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          編集する
        </button>
        {isEncrypted && (
          <div className="group relative ml-auto">
            <div className="rounded-full p-1 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="invisible group-hover:visible absolute right-0 top-full mt-1 z-50 w-64 sm:w-72 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg">
              <p className="text-xs font-medium text-[var(--foreground)] mb-1">End-to-End 暗号化</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                内容はブラウザで暗号化されてからサーバーに保存されました。「鍵」はこのURLだけに含まれており、サーバーには渡りません。このURLを知っている人だけが読めます。
              </p>
            </div>
          </div>
        )}
      </>
    ) : (
      <>
        <label className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-1 py-1 text-[11px] sm:text-xs transition-colors hover:bg-[var(--muted)] cursor-pointer">
          <span className="text-[var(--muted-foreground)] hidden sm:inline">Aa</span>
          <select
            value={activeFont}
            onChange={(e) => handleFontChange(e.target.value as FontId)}
            className="bg-transparent text-[var(--card-foreground)] outline-none cursor-pointer max-w-[5.5rem] sm:max-w-none"
          >
            {(Object.keys(FONTS) as FontId[]).map((id) => (
              <option key={id} value={id}>
                {FONTS[id].label}
              </option>
            ))}
          </select>
        </label>
        <ModeToggle mode={mode} onChange={setMode} />
        <div className="ml-auto">
          {markdown && <ShareButton markdown={markdown} historyId={historyId} />}
        </div>
      </>
    );

  return (
    <div className="min-w-0 overflow-x-hidden">
      {/* 上部ツールバー — 初期位置 */}
      <div
        className={`sticky top-[53px] z-40 mb-6 flex flex-wrap items-center gap-1.5 sm:gap-2 pb-3 border-b border-[var(--border)] bg-[var(--background)] transition-all duration-300 ${
          toolbarMode === "bottom" || !toolbarVisible
            ? "opacity-0 pointer-events-none"
            : ""
        }`}
      >
        {renderControls()}
      </div>

      {/* 下部ツールバー — スクロール後に表示 */}
      {toolbarMode === "bottom" && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md transition-all duration-300 ${
            !toolbarVisible ? "translate-y-full" : ""
          }`}
        >
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5">
            {renderControls()}
          </div>
        </div>
      )}

      {mode === "view" && html && (
        <>
          <MarkdownRenderer html={html} />
          <TableOfContents contentKey={String(contentKey)} bottomBarVisible={toolbarMode === "bottom" && toolbarVisible} />
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
                <TableOfContents contentKey={String(contentKey)} bottomBarVisible={toolbarMode === "bottom" && toolbarVisible} />
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
