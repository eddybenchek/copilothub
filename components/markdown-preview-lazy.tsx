'use client';

import dynamic from 'next/dynamic';

// Lazy load MarkdownPreview to reduce initial bundle size
// This component is heavy (react-markdown + remark-gfm) so we lazy load it
const MarkdownPreview = dynamic(
  () => import('@/components/markdown-preview').then(mod => ({ default: mod.MarkdownPreview })),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-4 w-5/6 bg-muted rounded" />
      </div>
    ),
    ssr: true, // Still render on server for SEO
  }
);

export { MarkdownPreview };

