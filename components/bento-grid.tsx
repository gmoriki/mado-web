"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function BentoCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[var(--border)]",
        "bg-[var(--card)]/60 p-5 backdrop-blur-sm",
        "transition-all hover:border-[var(--primary)]/40",
        "hover:shadow-lg hover:shadow-[var(--primary)]/5",
        className
      )}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent dark:from-white/5" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

function MarkdownCard() {
  return (
    <BentoCard className="sm:col-span-2">
      <CardLabel>Markdownを美しく表示</CardLabel>
      <div className="mt-3 rounded-xl bg-[var(--muted)] p-4 text-sm leading-relaxed">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[var(--foreground)]">#</span>
            <span className="text-base font-bold text-[var(--foreground)]">見出しもリストも、そのまま</span>
          </div>
          <div className="ml-1 space-y-1 text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2">
              <span className="text-[var(--primary)]">-</span>
              <span>ChatGPTやClaudeの出力をペースト</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--primary)]">-</span>
              <span>表・リスト・コードブロックをきれいに整形</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--primary)]">-</span>
              <span className="font-medium text-[var(--foreground)]">**太字**</span>
              <span>や</span>
              <span className="font-mono text-xs rounded bg-[var(--card)] px-1.5 py-0.5">`コード`</span>
              <span>もそのまま反映</span>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

function MermaidCard() {
  return (
    <BentoCard>
      <CardLabel>図の自動描画</CardLabel>
      <div className="mt-3 rounded-xl bg-[var(--muted)] p-4">
        <svg viewBox="0 0 320 70" className="w-full h-auto">
          {/* Node: 入力 */}
          <rect x="10" y="20" width="80" height="32" rx="8" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
          <text x="50" y="41" textAnchor="middle" fontSize="12" fill="var(--foreground)">入力</text>

          {/* Arrow 1 */}
          <line x1="90" y1="36" x2="120" y2="36" stroke="var(--muted-foreground)" strokeWidth="1.5" />
          <polygon points="120,32 128,36 120,40" fill="var(--muted-foreground)" />

          {/* Node: 変換 */}
          <rect x="128" y="20" width="80" height="32" rx="8" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
          <text x="168" y="41" textAnchor="middle" fontSize="12" fill="var(--foreground)">変換</text>

          {/* Arrow 2 */}
          <line x1="208" y1="36" x2="238" y2="36" stroke="var(--muted-foreground)" strokeWidth="1.5" />
          <polygon points="238,32 246,36 238,40" fill="var(--muted-foreground)" />

          {/* Node: 表示 */}
          <rect x="246" y="20" width="64" height="32" rx="8" fill="var(--accent)" stroke="var(--primary)" strokeWidth="1.5" opacity="0.8" />
          <text x="278" y="41" textAnchor="middle" fontSize="12" fill="var(--foreground)">表示</text>
        </svg>
      </div>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
        フローチャートやシーケンス図を自動で描画（Mermaid記法）
      </p>
    </BentoCard>
  );
}

function TableCard() {
  return (
    <BentoCard>
      <CardLabel>テーブル表示</CardLabel>
      <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[var(--muted)]">
              <th className="px-3 py-1.5 text-left font-medium">日程</th>
              <th className="px-3 py-1.5 text-left font-medium">内容</th>
              <th className="px-3 py-1.5 text-left font-medium">担当</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border)]">
              <td className="px-3 py-1.5">4/10</td>
              <td className="px-3 py-1.5">キックオフ</td>
              <td className="px-3 py-1.5">田中</td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="px-3 py-1.5">4/17</td>
              <td className="px-3 py-1.5">中間報告</td>
              <td className="px-3 py-1.5">佐藤</td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="px-3 py-1.5">4/24</td>
              <td className="px-3 py-1.5">最終発表</td>
              <td className="px-3 py-1.5">鈴木</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BentoCard>
  );
}

function CodeCard() {
  return (
    <BentoCard>
      <CardLabel>コードブロック</CardLabel>
      <div className="mt-3 rounded-lg bg-[var(--muted)] p-3 font-mono text-xs leading-relaxed">
        <div>
          <span className="text-purple-500 dark:text-purple-400">const</span>{" "}
          <span className="text-[var(--foreground)]">greeting</span>{" "}
          <span className="text-[var(--muted-foreground)]">=</span>{" "}
          <span className="text-green-600 dark:text-green-400">&quot;Hello&quot;</span>;
        </div>
        <div>
          <span className="text-blue-500 dark:text-blue-400">console</span>
          <span className="text-[var(--muted-foreground)]">.</span>
          <span className="text-yellow-600 dark:text-yellow-400">log</span>
          <span className="text-[var(--foreground)]">(greeting);</span>
        </div>
      </div>
    </BentoCard>
  );
}

function PrivacyCard() {
  return (
    <BentoCard className="sm:col-span-2">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)]">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">データはあなたの端末だけで処理</h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            あなたのデータはブラウザ内で完結。サーバーには一切送信されません。
          </p>
        </div>
      </div>
    </BentoCard>
  );
}

export { MarkdownCard, MermaidCard, PrivacyCard, BentoCard, CardLabel };

export function BentoGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <MarkdownCard />
      <MermaidCard />
      <TableCard />
      <CodeCard />
      <PrivacyCard />
    </div>
  );
}
