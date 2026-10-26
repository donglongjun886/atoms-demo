import ReactMarkdown, { type Components } from 'react-markdown'

const components: Components = {
  h1: ({ children }) => <h1 className="mb-3 mt-5 text-xl font-bold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-4 text-base font-semibold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-3 text-sm font-semibold">{children}</h3>,
  p: ({ children }) => <p className="mb-2 text-sm leading-6">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 text-sm">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 text-sm">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 pl-3 text-sm text-muted-foreground">{children}</blockquote>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className="block overflow-x-auto rounded-md bg-muted p-3 text-xs">{children}</code>
    ) : (
      <code className="rounded bg-muted px-1 py-0.5 text-xs">{children}</code>
    ),
  pre: ({ children }) => <pre className="mb-2">{children}</pre>,
  a: ({ children, href }) => (
    <a href={href} className="text-primary underline" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
}

export function MarkdownView({ content }: { content: string }) {
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>
}
