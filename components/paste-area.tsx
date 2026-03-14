"use client";

interface PasteAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  fontClass?: string;
  showRestored?: boolean;
}

export function PasteArea({ value, onChange, onSubmit, fontClass = "font-mono", showRestored = false }: PasteAreaProps) {
  const lines = value ? value.split("\n").length : 0;
  const chars = value.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      {showRestored && (
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs text-[var(--foreground)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--muted-foreground)]">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          前回の続きが残っています
          <button
            onClick={() => onChange("")}
            className="ml-auto text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            クリア
          </button>
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="AIの回答をここにペースト..."
        className={`${value ? "min-h-[150px] sm:min-h-[200px]" : "min-h-[100px]"} w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 ${showRestored ? "pt-12" : ""} pb-8 ${fontClass} text-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] placeholder:font-sans focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-all`}
      />
      <div className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
        {chars > 0 && (
          <>
            <span>{chars.toLocaleString()} 文字</span>
            <span>{lines} 行</span>
          </>
        )}
        {onSubmit && (
          <span className="hidden sm:inline opacity-60">
            {/Mac|iPhone|iPad/.test(navigator.userAgent) ? "\u2318" : "Ctrl"}+Enter で表示
          </span>
        )}
      </div>
    </div>
  );
}
