export function MarkdownRenderer({ html }: { html: string }) {
  return (
    <article
      className="prose prose-neutral dark:prose-invert mx-auto px-2 sm:px-4 prose-headings:scroll-mt-20 prose-a:text-[var(--primary)] prose-a:underline-offset-4 prose-table:text-sm prose-pre:bg-[var(--muted)] prose-pre:text-[var(--foreground)]"
      style={{ maxWidth: 'min(42rem, 100%)' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
