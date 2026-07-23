import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { prettifyMath } from "@/lib/math-notation";

// Prettify maths inside text nodes only. Running after the Markdown parse means
// code spans, code blocks and GFM footnote references are separate node types,
// so they are never rewritten.
function remarkPrettyMath() {
  return (tree: Root) => {
    visit(tree, "text", (node) => {
      node.value = prettifyMath(node.value);
    });
  };
}

const remarkPlugins = [remarkGfm, remarkPrettyMath];

// Premium, readable defaults: comfortable paragraph rhythm, clean lists, and
// clear hierarchy for headings, formulas and quotes.
const components: Components = {
  p: ({ children }) => (
    <p className="text-[15px] leading-relaxed text-foreground [&:not(:first-child)]:mt-3">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald underline underline-offset-2">
      {children}
    </a>
  ),
  h1: ({ children }) => <h3 className="mt-4 text-[17px] font-bold tracking-tight text-foreground first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-4 text-[16px] font-bold tracking-tight text-foreground first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-3 text-[15px] font-semibold text-foreground first:mt-0">{children}</h4>,
  ul: ({ children }) => <ul className="mt-2 space-y-1.5 pl-1">{children}</ul>,
  ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-muted-foreground">{children}</ol>,
  li: ({ children }) => (
    <li className="relative pl-5 text-[15px] leading-relaxed text-foreground [ol>&]:pl-1 before:absolute before:left-0 before:top-[0.62em] before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-emerald/60 [ol>&]:before:hidden">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-3 border-l-2 border-emerald/40 bg-emerald-soft/30 py-1 pl-4 text-[15px] leading-relaxed text-foreground">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    // Inline code has no language class; a fenced block gets language-*.
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return <code className="font-mono text-[13px] leading-relaxed text-foreground">{children}</code>;
    }
    return (
      <code className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[13.5px] text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mt-3 max-w-full overflow-x-auto rounded-2xl border border-border bg-surface-muted p-3">{children}</pre>
  ),
  img: ({ src, alt }) => (
    <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} className="mt-3 h-auto max-w-full rounded-xl" />
  ),
  hr: () => <hr className="my-4 border-border" />,
  table: ({ children }) => (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-border">{children}</thead>,
  th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-foreground">{children}</th>,
  td: ({ children }) => <td className="border-b border-border px-3 py-2 text-foreground">{children}</td>,
};

/**
 * Renders an AI answer as Markdown with prettified maths notation.
 * Users never see raw Markdown or raw notation.
 */
export function RichAnswer({ text, className }: { text: string; className?: string }) {
  return (
    // min-w-0 lets this shrink inside flex/grid parents; break-words keeps long
    // unbroken strings (URLs, tokens) from forcing horizontal overflow.
    <div className={["min-w-0 break-words", className].filter(Boolean).join(" ")}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
