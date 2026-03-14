"use client";

import { useState, useCallback, useRef } from "react";
import { extractZip } from "@/lib/zip";
import { extractFolder } from "@/lib/folder";
import { categorizeFile, type VirtualFile } from "@/lib/virtual-fs";

interface UnifiedDropZoneProps {
  onSingleFile: (content: string) => void;
  onMultipleFiles: (files: VirtualFile[]) => void;
  compact?: boolean;
}

const SINGLE_FILE_EXTS = [".md", ".markdown", ".txt"];

export function UnifiedDropZone({
  onSingleFile,
  onMultipleFiles,
  compact = false,
}: UnifiedDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (fileList: FileList) => {
      setError(null);
      setLoading(true);
      try {
        // Single ZIP file
        if (
          fileList.length === 1 &&
          fileList[0].name.toLowerCase().endsWith(".zip")
        ) {
          const files = await extractZip(fileList[0]);
          if (files.length === 0) {
            setError("ZIPファイルにファイルが見つかりませんでした");
            return;
          }
          onMultipleFiles(files);
          return;
        }

        // Single markdown/text file
        if (fileList.length === 1) {
          const file = fileList[0];
          const ext = file.name
            .slice(file.name.lastIndexOf("."))
            .toLowerCase();
          if (SINGLE_FILE_EXTS.includes(ext)) {
            const text = await file.text();
            onSingleFile(text);
            return;
          }
        }

        // Multiple files or folder (webkitRelativePath present)
        const hasRelativePaths = Array.from(fileList).some(
          (f) => f.webkitRelativePath
        );
        if (hasRelativePaths) {
          const files = await extractFolder(fileList);
          if (files.length === 0) {
            setError("フォルダにファイルが見つかりませんでした");
            return;
          }
          onMultipleFiles(files);
          return;
        }

        // Multiple files dragged (no relative paths)
        const vFiles: VirtualFile[] = [];
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          const type = categorizeFile(file.name);
          if (type === "binary") {
            vFiles.push({ path: file.name, content: "", type: "binary" });
          } else {
            const content = await file.text();
            vFiles.push({ path: file.name, content, type });
          }
        }
        if (vFiles.length === 0) {
          setError("対応するファイルが見つかりませんでした");
          return;
        }
        // Single readable file → single view
        if (
          vFiles.length === 1 &&
          vFiles[0].type === "markdown"
        ) {
          onSingleFile(vFiles[0].content);
          return;
        }
        onMultipleFiles(vFiles);
      } catch {
        setError("ファイルの読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [onSingleFile, onMultipleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex cursor-pointer ${compact ? "flex-row items-center gap-3 rounded-xl border-2 border-dashed p-4" : "flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10"} transition-all ${
          isDragging
            ? "border-[var(--primary)] bg-[var(--accent)] scale-[1.01]"
            : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
        }`}
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <div className={`${compact ? "h-5 w-5" : "h-8 w-8"} animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent`} />
            <p className="text-sm text-[var(--muted-foreground)]">
              読み込み中...
            </p>
          </div>
        ) : compact ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-[var(--muted-foreground)]"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span className="text-xs sm:text-sm text-[var(--muted-foreground)]">
              <span className="sm:hidden">ファイルをドロップ</span>
              <span className="hidden sm:inline">ファイル・フォルダ・ZIPをドロップ</span>
            </span>
            <div className="ml-auto flex gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--card-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                ファイル
              </button>
              <button
                onClick={() => folderInputRef.current?.click()}
                className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--card-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                フォルダ
              </button>
            </div>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 text-[var(--muted-foreground)]"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
              ファイルをドロップ
            </p>
            <p className="mb-4 text-xs text-[var(--muted-foreground)]">
              .md / .txt / .zip / フォルダ
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--card-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                ファイルを選択
              </button>
              <button
                onClick={() => folderInputRef.current?.click()}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--card-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                フォルダを選択
              </button>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt,.zip"
          multiple
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ webkitdirectory: "" } as any)}
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          className="hidden"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
