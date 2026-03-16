"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { PasteArea } from "@/components/paste-area";
import { PopButton } from "@/components/ui/pop-button";
import { UnifiedDropZone } from "@/components/unified-drop-zone";
import type { VirtualFile } from "@/lib/virtual-fs";

const STORAGE_KEY = "mado-markdown";
const WORKSPACE_KEY = "mado-workspace";

const TEMPLATES = [
  { id: "general", label: "総合サンプル", path: "/sample.md" },
  { id: "meeting", label: "議事録", path: "/templates/meeting.md" },
  { id: "mermaid", label: "図解ショーケース", path: "/templates/mermaid.md" },
  { id: "tech-doc", label: "技術ドキュメント", path: "/templates/tech-doc.md" },
  { id: "kpt", label: "振り返り（KPT）", path: "/templates/kpt.md" },
];

export default function HomePage() {
  const [markdown, setMarkdown] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!showTemplates) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTemplates]);

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

  const handleTemplate = (path: string) => {
    setShowTemplates(false);
    fetch(path)
      .then((r) => r.text())
      .then((text) => {
        sessionStorage.setItem(STORAGE_KEY, text);
        router.push("/view");
      });
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100dvh-12rem)] justify-center">
      {/* Hero */}
      <div>
        <BlurReveal
          as="h1"
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          delay={0.1}
        >
          AIの回答を、そのまま共有リンクに。
        </BlurReveal>
        <p className="mt-3 text-sm sm:text-base text-[var(--muted-foreground)]">
          Markdownを美しく表示。リンクひとつで安全に共有。
        </p>
        <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
          🔒 E2E暗号化・原文はサーバーに送信されません
        </p>
      </div>

      {/* Paste Area */}
      <PasteArea
        value={markdown}
        onChange={setMarkdown}
        onSubmit={handleView}
        fontClass="font-sans"
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
          文書にする
        </PopButton>
        <div ref={templateRef} className="relative">
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className="text-sm font-medium text-[var(--primary)] underline underline-offset-4 transition-colors hover:opacity-70"
          >
            サンプルを見る
          </button>
          {showTemplates && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-52 rounded-xl border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg z-50">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplate(t.path)}
                  className="block w-full px-4 py-2 text-left text-sm text-[var(--card-foreground)] transition-colors hover:bg-[var(--muted)]"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
