"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { PopButton } from "@/components/ui/pop-button";
import { BentoGrid } from "@/components/bento-grid";
import Link from "next/link";

const useCases = [
  {
    emoji: "🤖",
    title: "AIの出力を美しく読む",
    description:
      "ChatGPTやClaudeが生成したMarkdownをペーストするだけ。表・リスト・Mermaid図もきれいにレンダリング。非エンジニアでも美しいドキュメントに。",
    action: "コピペして閲覧",
  },
  {
    emoji: "📤",
    title: "URLひとつで共有する",
    description:
      "サーバー不要・アカウント不要。圧縮されたMarkdownがURLに埋め込まれるので、リンクを送るだけで誰でも同じ内容を閲覧できます。",
    action: "共有URLを生成",
  },
  {
    emoji: "📁",
    title: "ドキュメント集をまとめて読む",
    description:
      "ZIPやフォルダをドロップすれば、ファイルツリー付きのワークスペースで閲覧。プロジェクトのドキュメントやObsidian Vaultをブラウザで快適に読める。",
    action: "フォルダをドロップ",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <div className="text-center">
        <BlurReveal
          as="h1"
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          delay={0.1}
        >
          mado web の使い方
        </BlurReveal>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Markdownの「閲覧」を、誰にとっても快適に。
        </p>
      </div>

      {/* 3 Glass Tiles */}
      <div className="grid gap-6 sm:grid-cols-3">
        {useCases.map((uc) => (
          <div
            key={uc.title}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6 backdrop-blur-sm transition-all hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5"
          >
            {/* Glass shine effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent dark:from-white/5" />

            <div className="relative">
              <span className="text-3xl">{uc.emoji}</span>
              <h2 className="mt-4 text-lg font-bold leading-snug text-[var(--foreground)]">
                {uc.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {uc.description}
              </p>
              <div className="mt-4">
                <span className="inline-block rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
                  {uc.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Feature Grid */}
      <section>
        <h2 className="mb-4 text-center text-lg font-bold text-[var(--foreground)]">
          できること
        </h2>
        <BentoGrid />
      </section>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 pb-8">
        <p className="text-lg font-bold text-[var(--foreground)]">
          mado web がおすすめです。
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">
          インストール不要。ブラウザだけで、今すぐ。
        </p>
        <PopButton color="indigo" size="lg" asChild>
          <Link href="/">試してみる</Link>
        </PopButton>
      </div>
    </div>
  );
}
