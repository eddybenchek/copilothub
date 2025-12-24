'use client';

import dynamic from 'next/dynamic';

// Lazy load analytics to reduce initial bundle size
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(mod => ({ default: mod.Analytics })),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then(mod => ({ default: mod.SpeedInsights })),
  { ssr: false }
);

export function LazyAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

