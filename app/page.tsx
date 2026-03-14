"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { PasteArea } from "@/components/paste-area";
import { PopButton } from "@/components/ui/pop-button";
import { UnifiedDropZone } from "@/components/unified-drop-zone";
import { MarkdownCard, MermaidCard, PrivacyCard } from "@/components/bento-grid";
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
    <div className="flex flex-col gap-8">
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
          ChatGPTやClaudeの回答を貼り付けるだけで、表もコードも図も読みやすく。リンク1つで誰にでも共有できます。
        </p>
      </div>

      {/* Use case hints */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--muted-foreground)]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 sm:px-3 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          長文もスラスラ
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 sm:px-3 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
          リンク1つで共有
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 sm:px-3 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          データは外部に送信しません
        </span>
      </div>

      {/* Before / After */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Before</span>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--muted-foreground)]">{`# 見出し
- **太字**のリスト
- \`コード\`を含む項目

| 列A | 列B |
|-----|-----|
| データ1 | データ2 |`}</pre>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">After</span>
          <div className="mt-2 text-sm leading-relaxed">
            <h3 className="text-base font-bold text-[var(--foreground)]">見出し</h3>
            <ul className="mt-1.5 ml-4 list-disc space-y-0.5 text-[var(--foreground)]">
              <li><strong>太字</strong>のリスト</li>
              <li><code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs font-mono">コード</code>を含む項目</li>
            </ul>
            <div className="mt-2 overflow-hidden rounded-lg border border-[var(--border)]">
              <table className="w-full text-xs">
                <thead><tr className="bg-[var(--muted)]"><th className="px-3 py-1 text-left font-medium">列A</th><th className="px-3 py-1 text-left font-medium">列B</th></tr></thead>
                <tbody><tr className="border-t border-[var(--border)]"><td className="px-3 py-1">データ1</td><td className="px-3 py-1">データ2</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Primary: Paste Area */}
      <div className="flex flex-col gap-3">
        <PasteArea
          value={markdown}
          onChange={handleMarkdownChange}
          onSubmit={handleView}
          fontClass="font-sans"
          showRestored={hasRestored}
        />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <PopButton
            color="teal"
            size="lg"
            onClick={handleView}
            disabled={!markdown.trim()}
            className="w-full sm:w-auto disabled:opacity-40"
          >
            見やすくする
          </PopButton>
          <PopButton
            color="default"
            size="lg"
            onClick={handleSample}
            className="w-full sm:w-auto"
          >
            サンプルで体験
          </PopButton>
        </div>
      </div>

      {/* Secondary: File/Folder Upload */}
      <UnifiedDropZone
        onSingleFile={handleSingleFile}
        onMultipleFiles={handleMultipleFiles}
        compact
      />

      {/* Feature highlights */}
      <section>
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          できること
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MarkdownCard />
          <MermaidCard />
          <PrivacyCard />
        </div>
      </section>
    </div>
  );
}
