import { ToolsClient } from '@/components/tool/tools-client';
import { getToolsPaginated, getToolsCategories } from '@/lib/prisma-helpers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Development Tools - CopilotHub',
  description: 'Discover essential tools to enhance your AI-powered development workflow.',
};

interface ToolsPageProps {
  searchParams: Promise<{
    category?: string;
    query?: string;
  }>;
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
