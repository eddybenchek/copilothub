"use client";

import { CopyButton } from "@/components/copy-button";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="relative rounded-lg border border-slate-800 bg-slate-950/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        {language && (
          <span className="text-xs font-medium text-slate-400">{language}</span>
        )}
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

