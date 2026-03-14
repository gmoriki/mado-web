export function MarkdownRenderer({ html }: { html: string }) {
  return (
    <article
      className="prose prose-neutral dark:prose-invert mx-auto max-w-2xl px-2 sm:px-4 prose-headings:scroll-mt-20 prose-a:text-[var(--primary)] prose-a:underline-offset-4 prose-table:text-sm prose-pre:bg-[var(--muted)] prose-pre:text-[var(--foreground)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
