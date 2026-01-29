'use client';

import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getBaseUrl } from '@/lib/metadata';

interface SectionHeaderProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ id, title, icon, className }: SectionHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const url = `${getBaseUrl()}/spring-boot#${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`mb-4 sm:mb-6 flex items-center justify-between gap-2 ${className || ''}`}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{title}</h2>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={copyLink}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="mr-1 h-3 w-3" />
            Copied
          </>
        ) : (
          <>
            <Copy className="mr-1 h-3 w-3" />
            Copy link
          </>
        )}
      </Button>
    </div>
  );
}
