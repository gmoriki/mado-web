"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { UnifiedDropZone } from "@/components/unified-drop-zone";
import { PasteArea } from "@/components/paste-area";
import { PopButton } from "@/components/ui/pop-button";
import type { VirtualFile } from "@/lib/virtual-fs";

const STORAGE_KEY = "mado-markdown";
const WORKSPACE_KEY = "mado-workspace";

export default function HomePage() {
  const [markdown, setMarkdown] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const router = useRouter();

  // Recover previous content from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMarkdown(saved);
      setPasteOpen(true);
    }
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
          mado web
        </BlurReveal>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Markdownを、誰でも美しく読める形に。
        </p>
      </div>

      {/* Unified drop zone */}
      <UnifiedDropZone
        onSingleFile={handleSingleFile}
        onMultipleFiles={handleMultipleFiles}
      />

      {/* Paste (collapsible) */}
      <div>
        <button
          onClick={() => setPasteOpen(!pasteOpen)}
          className="flex w-full items-center gap-2 text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
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
            className={`shrink-0 transition-transform ${pasteOpen ? "rotate-90" : ""}`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          Markdownを直接ペースト
        </button>

        {pasteOpen && (
          <div className="mt-3 flex flex-col gap-3">
            <PasteArea
              value={markdown}
              onChange={setMarkdown}
              onSubmit={handleView}
            />
            <div className="flex justify-center">
              <PopButton
                color="indigo"
                onClick={handleView}
                disabled={!markdown.trim()}
                className="disabled:opacity-40"
              >
                表示する
              </PopButton>
            </div>
          </div>
        )}
      </div>

      {/* Sample button */}
      <div className="flex justify-center">
        <PopButton color="default" size="sm" onClick={handleSample}>
          サンプルを見る
        </PopButton>
      </div>
    </div>
  );
}
