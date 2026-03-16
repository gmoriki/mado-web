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
import { createHighlighter, type Highlighter } from "shiki";

const MERMAID_RE =
  /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;

const CODE_BLOCK_RE =
  /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "javascript", "typescript", "python", "bash", "json", "html", "css",
        "yaml", "markdown", "sql", "go", "rust", "java", "c", "cpp", "ruby",
        "php", "swift", "kotlin", "shell", "diff", "toml", "xml", "tsx", "jsx",
      ],
    });
  }
  return highlighterPromise;
}

const mermaidCache = new Map<string, string>();

function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return String(hash);
}

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
    const cacheKey = hashCode(code);
    try {
      let svg = mermaidCache.get(cacheKey);
      if (!svg) {
        svg = await renderMermaid(code, {
          bg: "var(--card)",
          fg: "var(--foreground)",
          font: "LINE Seed JP, system-ui, sans-serif",
          padding: 32,
          transparent: true,
        });
        mermaidCache.set(cacheKey, svg);
      }
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

async function highlightCodeBlocks(html: string): Promise<string> {
  const matches = [...html.matchAll(CODE_BLOCK_RE)];
  if (matches.length === 0) return html;

  const highlighter = await getHighlighter();
  const loadedLangs = highlighter.getLoadedLanguages();
  let result = html;

  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const lang = match[1];
    const code = decodeHtmlEntities(match[2]).trim();

    if (!loadedLangs.includes(lang)) continue;

    const highlighted = highlighter.codeToHtml(code, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
    });

    result =
      result.slice(0, match.index!) +
      highlighted +
      result.slice(match.index! + match[0].length);
  }

  return result;
}

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

  let html = String(result);
  html = await renderMermaidBlocks(html);
  html = await highlightCodeBlocks(html);
  return html;
}
