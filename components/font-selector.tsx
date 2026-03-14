"use client";

import { useEffect, useState } from "react";
import { FONTS, type FontId, getStoredFont, setStoredFont } from "@/lib/font";
import { cn } from "@/lib/utils";

export function FontSelector() {
  const [activeFont, setActiveFont] = useState<FontId>("line-seed-jp");

  useEffect(() => {
    setActiveFont(getStoredFont());
  }, []);

  const handleChange = (fontId: FontId) => {
    setActiveFont(fontId);
    setStoredFont(fontId);
    document.documentElement.style.setProperty(
      "--font-body",
      FONTS[fontId].family
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {(Object.keys(FONTS) as FontId[]).map((id) => {
        const font = FONTS[id];
        return (
          <button
            key={id}
            onClick={() => handleChange(id)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left text-sm transition-all",
              activeFont === id
                ? "border-[var(--primary)] bg-[var(--accent)]"
                : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
            )}
            style={{ fontFamily: font.family }}
          >
            <span className="font-medium">{font.label}</span>
            <span className="ml-2 text-xs text-[var(--muted-foreground)]">
              あいうえお ABC
            </span>
          </button>
        );
      })}
    </div>
  );
}
