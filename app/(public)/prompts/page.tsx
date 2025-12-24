import { PromptsClient } from '@/components/prompt/prompts-client';
import { getPromptsPaginated, getPromptsCategories } from '@/lib/prisma-helpers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Prompts - CopilotHub | CopilotHub',
  description: 'Browse curated AI prompts for GitHub Copilot. Find prompts for code review, debugging, documentation, refactoring, and more.',
};

interface PromptsPageProps {
  searchParams: Promise<{
    category?: string;
    query?: string;
  }>;
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  const params = await searchParams;
  const category = params.category || 'all';
  const query = params.query || '';

  // Fetch initial data on server
  const [promptsData, categoriesData] = await Promise.all([
    getPromptsPaginated({
      offset: 0,
      limit: 20,
      category: category !== 'all' ? category : undefined,
      query: query || undefined,
    }),
    getPromptsCategories(),
  ]);

  return (
    <PromptsClient
      initialPrompts={promptsData.prompts}
      initialCategoryCounts={categoriesData.counts}
      initialTotalCount={categoriesData.total}
      initialHasMore={promptsData.hasMore}
      initialOffset={promptsData.nextOffset || 0}
    />
  );
}
