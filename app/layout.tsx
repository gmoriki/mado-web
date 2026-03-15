import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import "@fontsource/line-seed-jp/400.css";
import "@fontsource/line-seed-jp/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "mado web",
  description: "AIの回答をペーストするだけ。美しい文書として表示・共有できるブラウザツール",
  icons: {
    icon: [
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=BIZ+UDPGothic:wght@400;700&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch {}
              try {
                var fonts = {
                  "line-seed-jp": '"LINE Seed JP", system-ui, sans-serif',
                  "noto-sans-jp": '"Noto Sans JP", system-ui, sans-serif',
                  "bizudpgothic": '"BIZ UDPGothic", system-ui, sans-serif'
                };
                var f = localStorage.getItem('mado-font');
                if (f && fonts[f]) {
                  document.documentElement.style.setProperty('--font-body', fonts[f]);
                }
              } catch {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased flex flex-col">
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6 py-3">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight whitespace-nowrap text-[var(--foreground)] transition-opacity hover:opacity-70"
            >
              <img src="/logo.png" alt="mado web" width={32} height={32} />
              mado web
            </Link>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/history"
                className="rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              >
                履歴
              </Link>
              <Link
                href="/about"
                className="rounded-md px-1.5 py-1 sm:px-2 sm:py-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              >
                使い方
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="w-full mx-auto max-w-4xl px-4 sm:px-6 py-8 flex-1 min-w-0">{children}</main>
        <footer className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-5 flex flex-col items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <Link href="/terms" className="transition-colors hover:text-[var(--foreground)]">利用規約</Link>
              <span className="text-[var(--border)]" aria-hidden="true">|</span>
              <Link href="/privacy" className="transition-colors hover:text-[var(--foreground)]">プライバシーポリシー</Link>
              <span className="text-[var(--border)]" aria-hidden="true">|</span>
              <a href="https://github.com/gmoriki/mado-web" className="transition-colors hover:text-[var(--foreground)]">GitHub</a>
            </div>
            <span className="block text-center text-[10px] text-[var(--muted-foreground)]/60">&copy; 2026 gmoriki</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
