"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { markdownToHtml } from "@/lib/markdown";
import { decompressFromFragment } from "@/lib/compress";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TableOfContents } from "@/components/toc";
import { ShareButton } from "@/components/share-button";
import { ModeToggle, type ViewMode } from "@/components/mode-toggle";
import { EditorPane } from "@/components/editor-pane";
import { SplitView } from "@/components/split-view";
import Link from "next/link";

const STORAGE_KEY = "mado-markdown";

export default function ViewPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [mode, setMode] = useState<ViewMode>("view");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load
  useEffect(() => {
    async function load() {
      try {
        let md: string | null = null;

        const hash = window.location.hash.slice(1);
        if (hash) {
          try {
            md = decompressFromFragment(hash);
          } catch {
            setError("共有URLの展開に失敗しました。URLが不完全な可能性があります。");
            setLoading(false);
            return;
          }
          setIsShared(true);
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
      {isShared ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted-foreground)]">共有されたドキュメント</p>
          <button
            onClick={handleOpenInEditor}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)]"
          >
            mado webで編集する
          </button>
        </div>
      ) : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            &larr; 新しいMarkdownを開く
          </Link>
          <div className="flex items-center gap-3">
            <ModeToggle mode={mode} onChange={setMode} />
            {markdown && <ShareButton markdown={markdown} />}
          </div>
        </div>
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
