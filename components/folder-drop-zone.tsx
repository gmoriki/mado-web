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
        <input
          ref={folderInputRef}
          type="file"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ webkitdirectory: "" } as any)}
          onChange={handleFolderSelect}
          className="hidden"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
