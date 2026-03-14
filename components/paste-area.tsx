"use client";

interface PasteAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

export function PasteArea({ value, onChange, onSubmit }: PasteAreaProps) {
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ChatGPTやClaudeの出力をここにペースト..."
        className="min-h-[200px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 pb-8 font-mono text-sm text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 transition-colors"
      />
      <div className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
        {chars > 0 && (
          <>
            <span>{chars.toLocaleString()} 文字</span>
            <span>{lines} 行</span>
          </>
        )}
        {onSubmit && (
          <span className="opacity-60">
            {/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl"}+Enter で表示
          </span>
        )}
      </div>
    </div>
  );
}
