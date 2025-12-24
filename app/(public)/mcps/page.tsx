import { McpsClient } from '@/components/mcp/mcps-client';
import { getMcpsPaginated, getMcpsStats } from '@/lib/prisma-helpers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MCP Servers - CopilotHub',
  description: 'Discover Model Context Protocol servers to extend your AI coding environment.',
};

interface McpsPageProps {
  searchParams: Promise<{
    category?: string;
    query?: string;
  }>;
}

export default async function McpsPage({ searchParams }: McpsPageProps) {
  const params = await searchParams;
  const category = params.category || 'all';
  const query = params.query || '';

  // Fetch initial data on server
  const [mcpsData, statsData] = await Promise.all([
    getMcpsPaginated({
      offset: 0,
      limit: 20,
      category: category !== 'all' ? category : undefined,
      query: query || undefined,
    }),
    getMcpsStats(),
  ]);

  return (
    <McpsClient
      initialMcps={mcpsData.mcps}
      initialStats={statsData}
      initialHasMore={mcpsData.hasMore}
      initialOffset={mcpsData.nextOffset || 0}
    />
  );
}
