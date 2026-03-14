"use client";

import { useEffect, useState } from "react";

export type ViewMode = "view" | "edit" | "split";

interface ModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const modes: { value: ViewMode; label: string }[] = isMobile
    ? [
        { value: "view", label: "読む" },
        { value: "edit", label: "書く" },
      ]
    : [
        { value: "view", label: "読む" },
        { value: "edit", label: "書く" },
        { value: "split", label: "比べる" },
      ];

  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--muted)] p-0.5">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === m.value
              ? "bg-[var(--card)] text-[var(--card-foreground)] shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
