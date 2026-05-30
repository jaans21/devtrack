import { cn } from "@/lib/utils/cn";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Simple inline markdown rendering — for full rendering, use react-markdown
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-semibold prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:text-sm",
        className
      )}
    >
      <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
    </div>
  );
}
