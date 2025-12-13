'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "ghost" | "destructive";
  children?: React.ReactNode;
}

export function CopyButton({ text, className, size = "sm", variant = "outline", children }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          {children ? 'Copied!' : 'Copied!'}
        </>
      ) : (
        children || (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </>
        )
      )}
    </Button>
  );
}

