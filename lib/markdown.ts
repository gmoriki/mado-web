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
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

const MERMAID_RE =
  /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;

const CODE_BLOCK_RE =
  /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        import("shiki/themes/github-dark.mjs"),
        import("shiki/themes/github-light.mjs"),
      ],
      langs: [
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/python.mjs"),
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/json.mjs"),
        import("shiki/langs/html.mjs"),
        import("shiki/langs/css.mjs"),
        import("shiki/langs/yaml.mjs"),
        import("shiki/langs/markdown.mjs"),
        import("shiki/langs/sql.mjs"),
        import("shiki/langs/go.mjs"),
        import("shiki/langs/rust.mjs"),
        import("shiki/langs/java.mjs"),
        import("shiki/langs/c.mjs"),
        import("shiki/langs/cpp.mjs"),
        import("shiki/langs/ruby.mjs"),
        import("shiki/langs/php.mjs"),
        import("shiki/langs/swift.mjs"),
        import("shiki/langs/kotlin.mjs"),
        import("shiki/langs/shell.mjs"),
        import("shiki/langs/diff.mjs"),
        import("shiki/langs/toml.mjs"),
        import("shiki/langs/xml.mjs"),
        import("shiki/langs/tsx.mjs"),
        import("shiki/langs/jsx.mjs"),
      ],
      engine: createJavaScriptRegexEngine(),
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

  let highlighter: HighlighterCore;
  try {
    highlighter = await getHighlighter();
  } catch {
    return html;
  }

  const loadedLangs = highlighter.getLoadedLanguages();
  let result = html;

  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const lang = match[1];
    const code = decodeHtmlEntities(match[2]).trim();

    if (!loadedLangs.includes(lang)) continue;

    try {
      const highlighted = highlighter.codeToHtml(code, {
        lang,
        themes: { light: "github-light", dark: "github-dark" },
      });

      result =
        result.slice(0, match.index!) +
        highlighted +
        result.slice(match.index! + match[0].length);
    } catch {
      // Keep original code block on error
    }
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
