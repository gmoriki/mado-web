import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import "@fontsource/line-seed-jp/400.css";
import "@fontsource/line-seed-jp/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "mado web",
  description: "ブラウザ完結でMarkdownを美しく閲覧・共有",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6 py-3">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-[var(--foreground)] transition-opacity hover:opacity-70"
            >
              mado web
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/history"
                className="rounded-md px-2 py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              >
                履歴
              </Link>
              <Link
                href="/about"
                className="rounded-md px-2 py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              >
                使い方
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
