"use client";

interface SplitViewProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
}

export function SplitView({ editor, preview }: SplitViewProps) {
  return (
    <div className="flex gap-0 sm:gap-4">
      {/* Editor pane */}
      <div className="hidden sm:block sm:w-1/2 overflow-y-auto rounded-xl border border-[var(--border)]">
        {editor}
      </div>
      {/* Preview pane */}
      <div className="w-full sm:w-1/2 overflow-y-auto">
        {preview}
      </div>
    </div>
  );
}
