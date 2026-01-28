'use client';

import { useEffect } from 'react';
import type { SpringBootContent } from '@/lib/hub-helpers';

interface HubSearchFilterProps {
  content: SpringBootContent;
  onFilteredChange: (filtered: SpringBootContent) => void;
}

export function HubSearchFilter({ content, onFilteredChange }: HubSearchFilterProps) {
  // Pass through content unchanged (no filtering)
  useEffect(() => {
    onFilteredChange(content);
  }, [content, onFilteredChange]);

  // Return empty section but keep id="content" for anchor navigation
  return <section id="content" />;
}
