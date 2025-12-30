'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';

interface CategoryLinkButtonProps {
  category: string;
}

export function CategoryLinkButton({ category }: CategoryLinkButtonProps) {
  const handleClick = () => {
    analytics.trackCategoryClick(category, 'homepage');
  };

  return (
    <Button variant="ghost" asChild>
      <Link href={`/prompts?category=${category}`} onClick={handleClick}>
        View all
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}

