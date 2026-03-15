import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { remarkCustomDirectives } from "./remark-custom-directives";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { renderMermaid } from "beautiful-mermaid";

const MERMAID_RE =
  /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;

function decodeHtmlEntities(text: string): string {
  const map: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
    "&#10;": "\n",
  };
  return text
    .replace(/&(?:amp|lt|gt|quot|#39|#x27|#x2F|#10);/g, (m) => map[m] || m)
    .replace(/<br\s*\/?>/g, "\n");
}

async function renderMermaidBlocks(html: string): Promise<string> {
  const matches = [...html.matchAll(MERMAID_RE)];
  if (matches.length === 0) return html;

  let result = html;
  // Process in reverse to maintain indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const code = decodeHtmlEntities(match[1]).trim();
    try {
      const svg = await renderMermaid(code, {
        bg: "var(--card)",
        fg: "var(--foreground)",
        font: "LINE Seed JP, system-ui, sans-serif",
        padding: 32,
        transparent: true,
      });
      const wrapped = `<div class="mermaid-diagram">${svg}</div>`;
      result =
        result.slice(0, match.index!) +
        wrapped +
        result.slice(match.index! + match[0].length);
    } catch {
      // Keep original code block on error
    }
  }

  return result;
}

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "section", "summary", "details",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] || []), "className", "class", "style"],
    div: [...(defaultSchema.attributes?.["div"] || []), "class"],
    span: [...(defaultSchema.attributes?.["span"] || []), "class"],
  },
};

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkCustomDirectives)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(markdown);

  const html = String(result);
  return renderMermaidBlocks(html);
}
