"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { markdownToHtml } from "@/lib/markdown";
import { buildTree, type VirtualFile, type TreeNode } from "@/lib/virtual-fs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TableOfContents } from "@/components/toc";
import { FileTree } from "@/components/file-tree";
import { ModeToggle, type ViewMode } from "@/components/mode-toggle";
import { EditorPane } from "@/components/editor-pane";
import { SplitView } from "@/components/split-view";
import Link from "next/link";

const WORKSPACE_KEY = "mado-workspace";

export default function WorkspacePage() {
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [editMarkdown, setEditMarkdown] = useState("");
  const [mode, setMode] = useState<ViewMode>("view");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contentKey, setContentKey] = useState(0);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load files from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(WORKSPACE_KEY);
      if (!stored) {
        router.replace("/");
        return;
      }
      const parsed: VirtualFile[] = JSON.parse(stored);
      setFiles(parsed);
      setTree(buildTree(parsed));

      // Auto-select first markdown file
      const firstMd = parsed.find((f) => f.type === "markdown");
      if (firstMd) {
        setActiveFile(firstMd.path);
      }
    } catch {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Render active file
  useEffect(() => {
    if (!activeFile) {
      setHtml(null);
      return;
    }
    const file = files.find((f) => f.path === activeFile);
    if (!file) return;

    setEditMarkdown(file.content);

    if (file.type === "markdown") {
      markdownToHtml(file.content).then((rendered) => {
        setHtml(rendered);
        setContentKey((k) => k + 1);
      });
    } else {
      setHtml(null);
    }
  }, [activeFile, files]);

  const handleFileSelect = useCallback((path: string) => {
    setActiveFile(path);
    setMode("view");
    // Close sidebar on mobile
    if (window.innerWidth < 640) setSidebarOpen(false);
  }, []);

  const handleMarkdownChange = useCallback(
    (newMarkdown: string) => {
      setEditMarkdown(newMarkdown);

      // Update file in memory
      setFiles((prev) =>
        prev.map((f) =>
          f.path === activeFile ? { ...f, content: newMarkdown } : f
        )
      );

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const file = files.find((f) => f.path === activeFile);
        if (file?.type === "markdown") {
          try {
            const rendered = await markdownToHtml(newMarkdown);
            setHtml(rendered);
            setContentKey((k) => k + 1);
          } catch {
            // Keep previous HTML
          }
        }
      }, 300);
    },
    [activeFile, files]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  const currentFile = files.find((f) => f.path === activeFile);
  const isMarkdown = currentFile?.type === "markdown";

  const renderContent = () => {
    if (!activeFile || !currentFile) {
      return (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
          ファイルを選択してください
        </div>
      );
    }

    if (currentFile.type === "binary") {
      return (
        <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
          バイナリファイルは表示できません
        </div>
      );
    }

    if (mode === "edit") {
      return (
        <div className="rounded-xl border border-[var(--border)]">
          <EditorPane value={editMarkdown} onChange={handleMarkdownChange} />
        </div>
      );
    }

    if (mode === "split" && isMarkdown) {
      return (
        <SplitView
          editor={<EditorPane value={editMarkdown} onChange={handleMarkdownChange} />}
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
      );
    }

    // View mode
    if (isMarkdown && html) {
      return (
        <>
          <MarkdownRenderer html={html} />
          <TableOfContents contentKey={String(contentKey)} />
        </>
      );
    }

    // Plain text
    return (
      <pre className="overflow-x-auto rounded-xl bg-[var(--muted)] p-4 text-sm leading-relaxed text-[var(--foreground)]">
        {currentFile.content}
      </pre>
    );
  };

  return (
    <div className="-mx-4 sm:-mx-6 -my-8 flex h-[calc(100vh-57px)]">
      {/* Sidebar toggle (mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-20 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg sm:hidden"
        aria-label="ファイルツリー"
      >
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        </svg>
      </button>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-y-[57px] left-0 z-40 w-64 overflow-y-auto border-r border-[var(--border)] bg-[var(--card)] p-3 sm:static sm:z-auto">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Files ({files.filter((f) => f.type !== "binary").length})
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="サイドバーを閉じる"
              className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] sm:hidden"
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <FileTree
            nodes={tree}
            activeFile={activeFile}
            onSelect={handleFileSelect}
          />
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <Link
              href="/"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              &larr; ホームに戻る
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4">
          {activeFile && currentFile && currentFile.type !== "binary" && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-[var(--muted-foreground)]">
                {activeFile}
              </span>
              {isMarkdown && <ModeToggle mode={mode} onChange={setMode} />}
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
