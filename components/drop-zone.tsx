"use client";

import { useState, useCallback, useRef } from "react";

interface DropZoneProps {
  onFileRead: (content: string) => void;
}

const ACCEPTED_EXTENSIONS = [".md", ".markdown", ".txt"];

export function DropZone({ onFileRead }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setError("対応ファイル: .md, .markdown, .txt");
        return;
      }
      try {
        const text = await file.text();
        onFileRead(text);
      } catch {
        setError("ファイルの読み込みに失敗しました");
      }
    },
    [onFileRead]
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
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
          isDragging
            ? "border-[var(--primary)] bg-[var(--accent)] scale-[1.02]"
            : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
        }`}
      >
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
        <p className="text-sm text-[var(--muted-foreground)]">
          .md ファイルをドラッグ&ドロップ、またはクリックして選択
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
