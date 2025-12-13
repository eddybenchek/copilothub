'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '@/components/ui/code-block';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  // Remove YAML frontmatter if present
  const cleanedContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="mb-6 mt-8 text-3xl font-bold text-slate-100 border-b border-slate-800 pb-3 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-4 mt-8 text-2xl font-semibold text-slate-100 border-b border-slate-800 pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 mt-6 text-xl font-semibold text-slate-200">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-2 mt-4 text-lg font-semibold text-slate-200">
              {children}
            </h4>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 text-slate-300 leading-relaxed">
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-2 text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-2 text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          // Code blocks - handle both inline and block code
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const isInline = !className || !match;

            if (isInline) {
              return (
                <code
                  className="rounded bg-slate-800/60 px-1.5 py-0.5 text-sm font-mono text-sky-300 before:content-[''] after:content-['']"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // For block code, we need to pass the language to pre
            // Store it in a data attribute
            return (
              <code className={className} data-language={language} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }: any) => {
            // Extract code and language from the code element inside pre
            const codeElement = Array.isArray(children) ? children[0] : children;
            
            if (codeElement?.props) {
              const className = codeElement.props.className || '';
              const match = /language-(\w+)/.exec(className);
              const language = match ? match[1] : codeElement.props['data-language'] || 'text';
              const code = String(codeElement.props.children || '').replace(/\n$/, '');
              
              return (
                <div className="my-4">
                  <CodeBlock code={code} language={language} />
                </div>
              );
            }
            
            // Fallback
            return (
              <pre className="my-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <code className="text-sm text-slate-100">{children}</code>
              </pre>
            );
          },
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-sky-500/40 bg-sky-500/5 pl-4 py-2 italic text-slate-300">
              {children}
            </blockquote>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 underline transition-colors"
            >
              {children}
            </a>
          ),
          // Tables
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="min-w-full border-collapse border border-slate-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-800/60">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-800">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-800/40">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-slate-700 px-4 py-2 text-left font-semibold text-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-700 px-4 py-2 text-slate-300">
              {children}
            </td>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-8 border-slate-800" />
          ),
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-200">
              {children}
            </strong>
          ),
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-slate-300">
              {children}
            </em>
          ),
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}

