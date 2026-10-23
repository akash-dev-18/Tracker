import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils/cn";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:font-normal prose-headings:text-bone prose-p:text-ash prose-a:text-copper prose-a:no-underline hover:prose-a:underline prose-strong:text-bone prose-code:rounded prose-code:bg-white/[0.06] prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.82em] prose-code:font-normal prose-code:text-bone prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-line prose-pre:bg-black/25 prose-blockquote:border-l-copper/40 prose-blockquote:text-ash prose-li:text-ash prose-hr:border-line",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: linkChildren }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {linkChildren}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
