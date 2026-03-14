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
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <div className="text-center">
        <BlurReveal
          as="h1"
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          delay={0.1}
        >
          mado web
        </BlurReveal>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Markdownを、誰でも美しく読める形に。
        </p>
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
            color="indigo"
            size="lg"
            onClick={handleView}
            disabled={!markdown.trim()}
            className="disabled:opacity-40"
          >
            表示する
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
