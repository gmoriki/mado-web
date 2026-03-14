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
  const [hasRestored, setHasRestored] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMarkdown(saved);
      setHasRestored(true);
    }
  }, []);

  const handleMarkdownChange = (val: string) => {
    setMarkdown(val);
    if (hasRestored) setHasRestored(false);
  };

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
    <div className="flex flex-col gap-6 min-h-[calc(100dvh-12rem)] justify-center">
      {/* Hero */}
      <div className="text-center">
        <BlurReveal
          as="h1"
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          delay={0.1}
        >
          コピペだけ。AIの回答がきれいなページに。
        </BlurReveal>
        <p className="mt-3 text-sm sm:text-base text-[var(--muted-foreground)] px-2">
          表もコードも図も読みやすく。リンク1つで共有。
        </p>
        <p className="mt-1.5 text-xs text-[var(--muted-foreground)]/70 px-2">
          データは外部に送信しません
        </p>
      </div>

      {/* Paste Area */}
      <PasteArea
        value={markdown}
        onChange={handleMarkdownChange}
        onSubmit={handleView}
        fontClass="font-sans"
        showRestored={hasRestored}
      />

      {/* CTA */}
      <div className="flex flex-col items-center gap-2">
        <PopButton
          color="teal"
          size="lg"
          onClick={handleView}
          disabled={!markdown.trim()}
          className="w-full sm:w-auto disabled:opacity-50"
        >
          ページにする
        </PopButton>
        <button
          onClick={handleSample}
          className="text-sm text-[var(--muted-foreground)] underline underline-offset-4 transition-colors hover:text-[var(--foreground)]"
        >
          サンプルを見る
        </button>
      </div>

      {/* File/Folder Upload */}
      <UnifiedDropZone
        onSingleFile={handleSingleFile}
        onMultipleFiles={handleMultipleFiles}
        compact
      />
    </div>
  );
}
