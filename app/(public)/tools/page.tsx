import { ToolsClient } from '@/components/tool/tools-client';
import { getToolsPaginated, getToolsCategories } from '@/lib/prisma-helpers';
import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/metadata';

interface ToolsPageProps {
  searchParams: Promise<{
    category?: string;
    query?: string;
    tags?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ToolsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = params.category || params.query || params.tags;
  const baseUrl = getBaseUrl();
  const baseToolsUrl = `${baseUrl}/tools`;

  // If there are filters, add canonical tag pointing to base URL
  if (hasFilters) {
    return {
      title: 'Development Tools - CopilotHub',
      description: 'Discover essential tools to enhance your AI-powered development workflow.',
      alternates: {
        canonical: baseToolsUrl,
      },
      robots: {
        index: false, // Don't index filtered views
        follow: true,
      },
    };
  }

  // Base page - can be indexed
  return {
    title: 'Development Tools - CopilotHub',
    description: 'Discover essential tools to enhance your AI-powered development workflow.',
    alternates: {
      canonical: baseToolsUrl,
    },
  };
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams;
  const category = params.category || 'all';
  const query = params.query || '';

  // Fetch initial data on server
  const [toolsData, categoriesData] = await Promise.all([
    getToolsPaginated({
      offset: 0,
      limit: 20,
      category: category !== 'all' ? category : undefined,
      query: query || undefined,
    }),
    getToolsCategories(),
  ]);

  return (
    <ToolsClient
      initialTools={toolsData.tools}
      initialCategoryCounts={categoriesData.counts}
      initialTotalCount={categoriesData.total}
      initialHasMore={toolsData.hasMore}
      initialOffset={toolsData.nextOffset || 0}
    />
  );
}
