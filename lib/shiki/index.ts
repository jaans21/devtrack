import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "typescript", "javascript", "tsx", "jsx", "json", "html", "css",
        "python", "rust", "go", "java", "bash", "sql", "markdown", "yaml",
        "dockerfile", "prisma",
      ],
    });
  }
  return highlighter;
}

export async function highlightCode(
  code: string,
  lang: string,
  theme: "github-dark" | "github-light" = "github-dark"
): Promise<string> {
  const h = await getHighlighter();
  try {
    return h.codeToHtml(code, { lang, theme });
  } catch {
    return h.codeToHtml(code, { lang: "text", theme });
  }
}
