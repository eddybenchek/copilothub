import { PromptsClient } from '@/components/prompt/prompts-client';
import { getPromptsPaginated, getPromptsCategories } from '@/lib/prisma-helpers';
import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/metadata';

interface PromptsPageProps {
  searchParams: Promise<{
    category?: string;
    query?: string;
    tags?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PromptsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = params.category || params.query || params.tags;
  const baseUrl = getBaseUrl();
  const basePromptsUrl = `${baseUrl}/prompts`;

  // If there are filters, add canonical tag pointing to base URL
  if (hasFilters) {
    return {
      title: {
        absolute: 'AI Prompts - CopilotHub', // Use absolute to prevent template suffix
      },
      description: 'Browse curated AI prompts for GitHub Copilot. Find prompts for code review, debugging, documentation, refactoring, and more.',
      alternates: {
        canonical: basePromptsUrl,
      },
      robots: {
        index: false, // Don't index filtered views
        follow: true,
      },
    };
  }

  // Base page - can be indexed
  return {
    title: {
      absolute: 'AI Prompts - CopilotHub', // Use absolute to prevent template suffix
    },
    description: 'Browse curated AI prompts for GitHub Copilot. Find prompts for code review, debugging, documentation, refactoring, and more.',
    alternates: {
      canonical: basePromptsUrl,
    },
  };
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
      initialCategory={category !== 'all' ? category : undefined}
    />
  );
}
