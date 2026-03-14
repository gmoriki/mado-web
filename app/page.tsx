"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { PasteArea } from "@/components/paste-area";
import { PopButton } from "@/components/ui/pop-button";
import { UnifiedDropZone } from "@/components/unified-drop-zone";
import type { VirtualFile } from "@/lib/virtual-fs";

const STORAGE_KEY = "mado-markdown";
const WORKSPACE_KEY = "mado-workspace";

export default function HomePage() {
  const [markdown, setMarkdown] = useState("");
  const router = useRouter();

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) setMarkdown(saved);
  }, []);

  const handleView = () => {
    if (!markdown.trim()) return;
    sessionStorage.setItem(STORAGE_KEY, markdown);
    router.push("/view");
  };

  const handleSingleFile = (content: string) => {
    sessionStorage.setItem(STORAGE_KEY, content);
    router.push("/view");
  };

  const handleMultipleFiles = (files: VirtualFile[]) => {
    sessionStorage.setItem(WORKSPACE_KEY, JSON.stringify(files));
    router.push("/workspace");
  };

  const handleSample = () => {
    fetch("/sample.md")
      .then((r) => r.text())
      .then((text) => {
        sessionStorage.setItem(STORAGE_KEY, text);
        router.push("/view");
      });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="text-center">
        <BlurReveal
          as="h1"
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          delay={0.1}
        >
          AIの回答を、きれいに読む。
        </BlurReveal>
        <p className="mt-3 text-[var(--muted-foreground)]">
          ChatGPTやClaudeの出力をペーストするだけ。表もコードも図も、読みやすく整えます。
        </p>
      </div>

      {/* Use case hints */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--muted-foreground)]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          じっくり読む
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
          URLで共有する
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          サーバーに送信しない
        </span>
      </div>

      {/* Primary: Paste Area */}
      <div className="flex flex-col gap-3">
        <PasteArea
          value={markdown}
          onChange={setMarkdown}
          onSubmit={handleView}
        />
        <div className="flex flex-col items-center gap-2">
          <PopButton
            color="teal"
            size="lg"
            onClick={handleView}
            disabled={!markdown.trim()}
            className="disabled:opacity-40"
          >
            読みやすく表示する
          </PopButton>
          <button
            onClick={handleSample}
            className="text-sm text-[var(--muted-foreground)] underline underline-offset-4 transition-colors hover:text-[var(--foreground)]"
          >
            サンプルを見る
          </button>
        </div>
      </div>

      {/* Secondary: File/Folder Upload */}
      <UnifiedDropZone
        onSingleFile={handleSingleFile}
        onMultipleFiles={handleMultipleFiles}
        compact
      />
    </div>
  );
}
