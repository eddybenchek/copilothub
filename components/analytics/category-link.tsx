'use client';

import Link from 'next/link';
import { analytics } from '@/lib/analytics';

interface CategoryLinkProps {
  href: string;
  category: string;
  source: 'homepage' | 'sidebar' | 'filter';
  children: React.ReactNode;
  className?: string;
}

export function CategoryLink({ href, category, source, children, className }: CategoryLinkProps) {
  const handleClick = () => {
    analytics.trackCategoryClick(category, source);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

