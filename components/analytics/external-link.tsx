'use client';

import { analytics } from '@/lib/analytics';

interface ExternalLinkProps {
  href: string;
  type?: 'github' | 'website' | 'other';
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export function ExternalLink({ href, type = 'other', children, className, target = '_blank', rel = 'noopener noreferrer' }: ExternalLinkProps) {
  const handleClick = () => {
    analytics.trackExternalLink(href, type);
  };

  return (
    <a href={href} onClick={handleClick} className={className} target={target} rel={rel}>
      {children}
    </a>
  );
}

