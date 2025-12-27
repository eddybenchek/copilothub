import { McpsClient } from '@/components/mcp/mcps-client';
import { getMcpsPaginated, getMcpsStats } from '@/lib/prisma-helpers';
import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/metadata';

interface McpsPageProps {
  searchParams: Promise<{
    category?: string;
    query?: string;
    tags?: string;
  }>;
}

export async function generateMetadata({ searchParams }: McpsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = params.category || params.query || params.tags;
  const baseUrl = getBaseUrl();
  const baseMcpsUrl = `${baseUrl}/mcps`;

  // If there are filters, add canonical tag pointing to base URL
  if (hasFilters) {
    return {
      title: 'MCP Servers - CopilotHub',
      description: 'Discover Model Context Protocol servers to extend your AI coding environment.',
      alternates: {
        canonical: baseMcpsUrl,
      },
      robots: {
        index: false, // Don't index filtered views
        follow: true,
      },
    };
  }

  // Base page - can be indexed
  return {
    title: 'MCP Servers - CopilotHub',
    description: 'Discover Model Context Protocol servers to extend your AI coding environment.',
    alternates: {
      canonical: baseMcpsUrl,
    },
  };
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
