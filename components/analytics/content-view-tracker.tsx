'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

interface ContentViewTrackerProps {
  type: 'prompt' | 'instruction' | 'agent' | 'mcp' | 'tool';
  id: string;
  title: string;
  properties?: Record<string, any>;
}

export function ContentViewTracker({ type, id, title, properties }: ContentViewTrackerProps) {
  useEffect(() => {
    // Track content view on mount
    analytics.trackContentView(type, id, title, properties);
  }, [type, id, title, properties]);

  return null;
}

