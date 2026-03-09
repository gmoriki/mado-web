# Edit/View Modes + Workspace Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add View/Edit/Split mode toggle to /view, and a /workspace page with sidebar file tree for folder/ZIP uploads.

**Architecture:** Extend /view with a mode state (view/edit/split) and debounced re-rendering. Add /workspace as a new route with a virtual filesystem (in-memory Map) populated from ZIP (JSZip) or folder (webkitdirectory). Sidebar file tree on the left, content pane on the right reusing the same mode toggle.

**Tech Stack:** Next.js 15 (static export), React 19, JSZip, fflate, Tailwind CSS v4, motion/react

---

### Task 1: Add jszip dependency

**Files:**
- Modify: `/Users/gmoriki/Documents/mado-web/package.json`

**Step 1: Install jszip**

Run: `cd /Users/gmoriki/Documents/mado-web && pnpm add jszip`

**Step 2: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add package.json pnpm-lock.yaml
git commit -m "feat: add jszip dependency for ZIP file support"
```

---

### Task 2: Create mode-toggle component

**Files:**
- Create: `/Users/gmoriki/Documents/mado-web/components/mode-toggle.tsx`

**Step 1: Create the component**

A segmented button group that toggles between "View", "Edit", and "Split" modes. Uses CSS variables for theming consistency.

```tsx
"use client";

export type ViewMode = "view" | "edit" | "split";

interface ModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: { value: ViewMode; label: string }[] = [
  { value: "view", label: "View" },
  { value: "edit", label: "Edit" },
  { value: "split", label: "Split" },
];

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--muted)] p-0.5">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === m.value
              ? "bg-[var(--card)] text-[var(--card-foreground)] shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/gmoriki/Documents/mado-web && pnpm build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add components/mode-toggle.tsx
git commit -m "feat: add ModeToggle component (View/Edit/Split)"
```

---

### Task 3: Create editor-pane component

**Files:**
- Create: `/Users/gmoriki/Documents/mado-web/components/editor-pane.tsx`

**Step 1: Create the component**

A full-height monospace textarea for editing markdown. Receives value/onChange props.

```tsx
"use client";

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
}

export function EditorPane({ value, onChange }: EditorPaneProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      className="h-full min-h-[60vh] w-full resize-none bg-[var(--background)] p-4 font-mono text-sm leading-relaxed text-[var(--foreground)] focus:outline-none"
    />
  );
}
```

**Step 2: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add components/editor-pane.tsx
git commit -m "feat: add EditorPane component"
```

---

### Task 4: Create split-view component

**Files:**
- Create: `/Users/gmoriki/Documents/mado-web/components/split-view.tsx`

**Step 1: Create the component**

A responsive left/right split container. On mobile (<768px), shows only editor with a note to switch to View mode.

```tsx
"use client";

interface SplitViewProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
}

export function SplitView({ editor, preview }: SplitViewProps) {
  return (
    <div className="flex gap-0 sm:gap-4">
      {/* Editor pane */}
      <div className="hidden sm:block sm:w-1/2 overflow-y-auto rounded-xl border border-[var(--border)]">
        {editor}
      </div>
      {/* Preview pane */}
      <div className="w-full sm:w-1/2 overflow-y-auto">
        {preview}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add components/split-view.tsx
git commit -m "feat: add SplitView component"
```

---

### Task 5: Extend /view page with Edit/Split modes

**Files:**
- Modify: `/Users/gmoriki/Documents/mado-web/app/view/page.tsx`

**Step 1: Rewrite view page**

Key changes:
- Add `mode` state (default: "view")
- Add `ModeToggle` in toolbar
- In edit mode: show `EditorPane` with markdown state
- In split mode: show `SplitView` with editor left, preview right
- In view mode: existing `MarkdownRenderer`
- Add debounced re-rendering (300ms) when markdown changes in edit/split mode
- Sync edits back to sessionStorage
- TOC only in view/split modes

```tsx
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

      {mode === "view" && html && (
        <>
          <MarkdownRenderer html={html} />
          <TableOfContents contentKey={String(contentKey)} />
        </>
      )}

      {mode === "edit" && (
        <div className="rounded-xl border border-[var(--border)]">
          <EditorPane value={markdown} onChange={handleMarkdownChange} />
        </div>
      )}

      {mode === "split" && (
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
```

**Step 2: Verify build**

Run: `cd /Users/gmoriki/Documents/mado-web && pnpm build 2>&1 | tail -5`
Expected: Build succeeds with all 3 routes

**Step 3: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add app/view/page.tsx
git commit -m "feat: add Edit/Split modes to /view page"
```

---

### Task 6: Create virtual filesystem module

**Files:**
- Create: `/Users/gmoriki/Documents/mado-web/lib/virtual-fs.ts`

**Step 1: Create the module**

Defines `VirtualFile` type, file type detection, and tree node construction for the sidebar.

```typescript
export type FileCategory = "markdown" | "text" | "binary";

export interface VirtualFile {
  path: string;
  content: string;
  type: FileCategory;
}

export interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: TreeNode[];
  file?: VirtualFile;
}

const MARKDOWN_EXTS = new Set([".md", ".markdown"]);
const TEXT_EXTS = new Set([
  ".txt", ".json", ".yaml", ".yml", ".toml", ".csv", ".xml",
  ".html", ".css", ".js", ".ts", ".jsx", ".tsx",
  ".py", ".sh", ".env", ".cfg", ".ini", ".log",
  ".rs", ".go", ".rb", ".php", ".swift", ".kt",
]);

export function categorizeFile(filename: string): FileCategory {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (MARKDOWN_EXTS.has(ext)) return "markdown";
  if (TEXT_EXTS.has(ext)) return "text";
  return "binary";
}

export function buildTree(files: VirtualFile[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", isDir: true, children: [] };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      if (isLast) {
        current.children.push({
          name: part,
          path: currentPath,
          isDir: false,
          children: [],
          file,
        });
      } else {
        let dir = current.children.find((c) => c.isDir && c.name === part);
        if (!dir) {
          dir = { name: part, path: currentPath, isDir: true, children: [] };
          current.children.push(dir);
        }
        current = dir;
      }
    }
  }

  // Sort: directories first, then alphabetical
  function sortTree(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.isDir) sortTree(node.children);
    }
  }

  sortTree(root.children);
  return root.children;
}
```

**Step 2: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add lib/virtual-fs.ts
git commit -m "feat: add virtual filesystem module"
```

---

### Task 7: Create ZIP extraction module

**Files:**
- Create: `/Users/gmoriki/Documents/mado-web/lib/zip.ts`

**Step 1: Create the module**

Wraps JSZip to extract files into VirtualFile array. Skips __MACOSX and .DS_Store.

```typescript
import JSZip from "jszip";
import { categorizeFile, type VirtualFile } from "./virtual-fs";

export async function extractZip(file: File): Promise<VirtualFile[]> {
  const zip = await JSZip.loadAsync(file);
  const files: VirtualFile[] = [];

  const entries: [string, JSZip.JSZipObject][] = [];
  zip.forEach((relativePath, zipEntry) => {
    entries.push([relativePath, zipEntry]);
  });

  for (const [relativePath, zipEntry] of entries) {
    // Skip directories, macOS artifacts, hidden files
    if (zipEntry.dir) continue;
    if (relativePath.startsWith("__MACOSX")) continue;
    if (relativePath.includes(".DS_Store")) continue;

    const type = categorizeFile(relativePath);

    if (type === "binary") {
      files.push({ path: relativePath, content: "", type: "binary" });
    } else {
      const content = await zipEntry.async("string");
      files.push({ path: relativePath, content, type });
    }
  }

  return files;
}
```

**Step 2: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add lib/zip.ts
git commit -m "feat: add ZIP extraction module"
```

---

### Task 8: Create folder extraction utility

**Files:**
- Create: `/Users/gmoriki/Documents/mado-web/lib/folder.ts`

**Step 1: Create the module**

Reads files from `<input webkitdirectory>` FileList into VirtualFile array.

```typescript
import { categorizeFile, type VirtualFile } from "./virtual-fs";

export async function extractFolder(fileList: FileList): Promise<VirtualFile[]> {
  const files: VirtualFile[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const relativePath = file.webkitRelativePath || file.name;

    // Skip hidden files and macOS artifacts
    if (relativePath.includes(".DS_Store")) continue;
    if (relativePath.split("/").some((part) => part.startsWith("."))) continue;

    const type = categorizeFile(relativePath);

    if (type === "binary") {
      files.push({ path: relativePath, content: "", type: "binary" });
    } else {
      const content = await file.text();
      files.push({ path: relativePath, content, type });
    }
  }

  return files;
}
```

**Step 2: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add lib/folder.ts
git commit -m "feat: add folder extraction utility"
```

---

### Task 9: Create file-tree component

**Files:**
- Create: `/Users/gmoriki/Documents/mado-web/components/file-tree.tsx`

**Step 1: Create the component**

Recursive tree view component for the workspace sidebar. Shows folder/file icons, highlights active file, greys out binary files.

```tsx
"use client";

import { useState } from "react";
import type { TreeNode } from "@/lib/virtual-fs";

interface FileTreeProps {
  nodes: TreeNode[];
  activeFile: string | null;
  onSelect: (path: string) => void;
}

export function FileTree({ nodes, activeFile, onSelect }: FileTreeProps) {
  return (
    <nav className="space-y-0.5 text-sm">
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          activeFile={activeFile}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </nav>
  );
}

function FileTreeNode({
  node,
  activeFile,
  onSelect,
  depth,
}: {
  node: TreeNode;
  activeFile: string | null;
  onSelect: (path: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="truncate font-medium">{node.name}</span>
        </button>
        {expanded && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                activeFile={activeFile}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isBinary = node.file?.type === "binary";
  const isActive = activeFile === node.path;

  return (
    <button
      onClick={() => !isBinary && onSelect(node.path)}
      disabled={isBinary}
      className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors ${
        isBinary
          ? "text-[var(--muted-foreground)] opacity-50 cursor-not-allowed"
          : isActive
            ? "bg-[var(--primary)] text-white"
            : "text-[var(--foreground)] hover:bg-[var(--muted)]"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span className="truncate">{node.name}</span>
    </button>
  );
}
```

**Step 2: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add components/file-tree.tsx
git commit -m "feat: add FileTree sidebar component"
```

---

### Task 10: Create folder-drop-zone component

**Files:**
- Create: `/Users/gmoriki/Documents/mado-web/components/folder-drop-zone.tsx`

**Step 1: Create the component**

Drop zone that accepts ZIP files or folders (via webkitdirectory). On successful read, calls `onFilesReady` with VirtualFile array.

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { extractZip } from "@/lib/zip";
import { extractFolder } from "@/lib/folder";
import type { VirtualFile } from "@/lib/virtual-fs";

interface FolderDropZoneProps {
  onFilesReady: (files: VirtualFile[]) => void;
}

export function FolderDropZone({ onFilesReady }: FolderDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const handleZipFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);
      try {
        const files = await extractZip(file);
        if (files.length === 0) {
          setError("ZIPファイルにファイルが見つかりませんでした");
          return;
        }
        onFilesReady(files);
      } catch {
        setError("ZIPファイルの展開に失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [onFilesReady]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.toLowerCase().endsWith(".zip")) {
        await handleZipFile(file);
      } else {
        setError("ZIPファイルをドロップしてください。フォルダは下のボタンから選択できます。");
      }
    },
    [handleZipFile]
  );

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const files = await extractFolder(fileList);
      if (files.length === 0) {
        setError("フォルダにファイルが見つかりませんでした");
        return;
      }
      onFilesReady(files);
    } catch {
      setError("フォルダの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleZipSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleZipFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
          isDragging
            ? "border-[var(--primary)] bg-[var(--accent)] scale-[1.02]"
            : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
        }`}
      >
        {loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-3 text-[var(--muted-foreground)]"
            >
              <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
            </svg>
            <p className="mb-3 text-sm text-[var(--muted-foreground)]">
              .zip ファイルをドロップ
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => zipInputRef.current?.click()}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--card-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                ZIPを選択
              </button>
              <button
                onClick={() => folderInputRef.current?.click()}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--card-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                フォルダを選択
              </button>
            </div>
          </>
        )}
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip"
          onChange={handleZipSelect}
          className="hidden"
        />
        {/* @ts-expect-error webkitdirectory is non-standard */}
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          onChange={handleFolderSelect}
          className="hidden"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

**Step 2: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add components/folder-drop-zone.tsx
git commit -m "feat: add FolderDropZone component (ZIP + folder)"
```

---

### Task 11: Create /workspace page

**Files:**
- Create: `/Users/gmoriki/Documents/mado-web/app/workspace/page.tsx`

**Step 1: Create the workspace page**

Main workspace page with sidebar file tree + content pane. Reads virtual files from sessionStorage (serialized JSON). Supports View/Edit/Split modes per file.

```tsx
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
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        </svg>
      </button>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-y-[57px] left-0 z-40 w-64 overflow-y-auto border-r border-[var(--border)] bg-[var(--card)] p-3 sm:static sm:z-auto">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Files
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] sm:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
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
```

**Step 2: Verify build**

Run: `cd /Users/gmoriki/Documents/mado-web && pnpm build 2>&1 | tail -10`
Expected: Build succeeds with `/`, `/view`, `/workspace` routes

**Step 3: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add app/workspace/page.tsx
git commit -m "feat: add /workspace page with sidebar file tree"
```

---

### Task 12: Update home page with folder/ZIP drop zone

**Files:**
- Modify: `/Users/gmoriki/Documents/mado-web/app/page.tsx`

**Step 1: Rewrite home page**

Add a FolderDropZone section below the single-file DropZone. When folder/ZIP files are read, store them in sessionStorage and navigate to /workspace.

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { PasteArea } from "@/components/paste-area";
import { DropZone } from "@/components/drop-zone";
import { FolderDropZone } from "@/components/folder-drop-zone";
import { PopButton } from "@/components/ui/pop-button";
import type { VirtualFile } from "@/lib/virtual-fs";
import Link from "next/link";

const STORAGE_KEY = "mado-markdown";
const WORKSPACE_KEY = "mado-workspace";

export default function HomePage() {
  const [markdown, setMarkdown] = useState("");
  const router = useRouter();

  const handleView = () => {
    if (!markdown.trim()) return;
    sessionStorage.setItem(STORAGE_KEY, markdown);
    router.push("/view");
  };

  const handleFileRead = (content: string) => {
    sessionStorage.setItem(STORAGE_KEY, content);
    router.push("/view");
  };

  const handleFolderReady = (files: VirtualFile[]) => {
    sessionStorage.setItem(WORKSPACE_KEY, JSON.stringify(files));
    router.push("/workspace");
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <BlurReveal
          as="h1"
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          delay={0.1}
        >
          mado web
        </BlurReveal>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Markdownをペースト、またはファイルをドロップして美しく閲覧
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            Markdownをペースト
          </label>
          <PasteArea value={markdown} onChange={setMarkdown} />
        </div>

        <div className="flex items-center justify-center gap-4">
          <PopButton
            color="indigo"
            size="lg"
            onClick={handleView}
            disabled={!markdown.trim()}
            className="disabled:opacity-40"
          >
            表示する
          </PopButton>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex-1 border-t border-[var(--border)]" />
          <span className="text-xs text-[var(--muted-foreground)]">または</span>
          <div className="flex-1 border-t border-[var(--border)]" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            単一ファイル
          </label>
          <DropZone onFileRead={handleFileRead} />
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex-1 border-t border-[var(--border)]" />
          <span className="text-xs text-[var(--muted-foreground)]">または</span>
          <div className="flex-1 border-t border-[var(--border)]" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            フォルダ / ZIP
          </label>
          <FolderDropZone onFilesReady={handleFolderReady} />
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/view"
          onClick={(e) => {
            e.preventDefault();
            fetch("/sample.md")
              .then((r) => r.text())
              .then((text) => {
                sessionStorage.setItem(STORAGE_KEY, text);
                router.push("/view");
              });
          }}
          className="text-sm text-[var(--primary)] underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          サンプルを見る
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd /Users/gmoriki/Documents/mado-web && pnpm build 2>&1 | tail -10`
Expected: Build succeeds

**Step 3: Commit**

```bash
cd /Users/gmoriki/Documents/mado-web
git add app/page.tsx
git commit -m "feat: add folder/ZIP upload to home page"
```

---

### Task 13: Final build verification

**Step 1: Full build**

Run: `cd /Users/gmoriki/Documents/mado-web && pnpm build 2>&1`
Expected: 4 routes generated: `/`, `/view`, `/workspace`, `/_not-found`

**Step 2: Dev server smoke test**

Run: `cd /Users/gmoriki/Documents/mado-web && pnpm dev &` then check http://localhost:3005

Verify:
- Home page loads with paste area, single-file drop, folder/ZIP drop
- Pasting markdown and clicking "表示する" shows rendered view with mode toggle
- Mode toggle switches between View/Edit/Split
- Edit mode shows textarea with current markdown
- Split mode shows editor + preview side by side

**Step 3: Final commit (if any fixes needed)**

```bash
cd /Users/gmoriki/Documents/mado-web
git add -A
git commit -m "fix: final adjustments for edit/workspace features"
```
