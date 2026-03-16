"use client";

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
}

export function EditorPane({ value, onChange }: EditorPaneProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Markdownエディタ"
      spellCheck={false}
      className="h-full min-h-[60vh] w-full resize-none bg-[var(--background)] p-4 font-mono text-sm leading-relaxed text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20"
    />
  );
}
