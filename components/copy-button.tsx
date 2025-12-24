'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { analytics } from '@/lib/analytics';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "ghost" | "destructive";
  children?: React.ReactNode;
  contentType?: 'prompt' | 'instruction' | 'agent';
  contentId?: string;
}

export function CopyButton({ text, className, size = "sm", variant = "outline", children, contentType, contentId }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    // Track analytics if content type and ID are provided
    if (contentType && contentId) {
      analytics.trackCopy(contentType, contentId, text.length);
    }
  };

  const hasText = children || (!children && !copied);
  const ariaLabel = hasText ? undefined : (copied ? 'Copied to clipboard' : 'Copy to clipboard');

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
      aria-label={ariaLabel}
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

