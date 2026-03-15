"use client";

import { useEffect, useState, useCallback } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ contentKey, bottomBarVisible = false }: { contentKey?: string; bottomBarVisible?: boolean }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  // Extract headings from rendered DOM
  useEffect(() => {
    const timer = setTimeout(() => {
      const article = document.querySelector("article.prose");
      if (!article) return;

      const headings = article.querySelectorAll("h2[id], h3[id]");
      const found: TocItem[] = [];
      headings.forEach((el) => {
        const text = el.textContent?.trim();
        if (text && el.id) {
          found.push({
            id: el.id,
            text,
            level: el.tagName === "H2" ? 2 : 3,
          });
        }
      });
      setItems(found);
    }, 300);

    return () => clearTimeout(timer);
  }, [contentKey]);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  }, []);

  if (items.length < 2) return null;

  return (
    <>
      {/* Floating button */}
      <div className={`fixed right-4 sm:right-6 z-50 transition-all duration-300 ${bottomBarVisible ? "bottom-[60px]" : "bottom-4 sm:bottom-6"}`}>
        <button
          onClick={() => setOpen(!open)}
          className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg active:scale-95 transition-all ${
            open
              ? "bg-[var(--foreground)] text-[var(--background)]"
              : "bg-[var(--primary)] text-white"
          }`}
          aria-label="目次"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16" />
            <path d="M4 12h10" />
            <path d="M4 18h6" />
          </svg>
        </button>
      </div>

      {/* Bottom sheet / side panel */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Mobile: bottom sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[65vh] overflow-y-auto rounded-t-2xl border-t border-[var(--border)] bg-[var(--card)] p-4 pb-8 shadow-xl sm:bottom-auto sm:top-20 sm:left-auto sm:right-6 sm:w-72 sm:rounded-xl sm:border sm:max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--muted)] sm:hidden" />
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              目次
            </h3>
            <nav className="space-y-0.5">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`block w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    item.level === 3 ? "pl-6 text-xs" : "font-medium"
                  } ${
                    activeId === item.id
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--card-foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
