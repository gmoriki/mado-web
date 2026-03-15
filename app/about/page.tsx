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
      "ChatGPTやClaudeの回答をペーストするだけ。表・リスト・図も崩れずきれいに表示されます。講義資料や報告書の下書きにも。",
    action: "コピペして閲覧",
  },
  {
    emoji: "📤",
    title: "URLひとつで共有する",
    description:
      "アカウント登録は不要。リンクを送るだけで相手もすぐ閲覧できます。内容は暗号化され、サーバーが読み取ることはできません。委員会資料や研究概要の共有に。",
    action: "共有URLを生成",
  },
  {
    emoji: "📁",
    title: "ドキュメント集をまとめて読む",
    description:
      "ZIPやフォルダをドロップすれば、一覧付きのワークスペースで閲覧できます。プロジェクト資料やマニュアル集をまとめて確認するのに便利です。",
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
          Markdownの閲覧・共有を、誰にとってもかんたんに。
        </p>
      </div>

      {/* 3 Glass Tiles */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
        {useCases.map((uc) => (
          <div
            key={uc.title}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4 sm:p-6 backdrop-blur-sm transition-all hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5"
          >
            {/* Glass shine effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent dark:from-white/5" />

            <div className="relative">
              <span className="text-2xl sm:text-3xl">{uc.emoji}</span>
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
        <BentoGrid />
      </section>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 pb-8">
        <p className="text-lg font-bold text-[var(--foreground)]">
          まずは試してみてください。
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">
          アカウント登録もインストールも不要。ブラウザだけで今すぐ使えます。
        </p>
        <PopButton color="teal" size="lg" asChild>
          <Link href="/">試してみる</Link>
        </PopButton>
      </div>
    </div>
  );
}
