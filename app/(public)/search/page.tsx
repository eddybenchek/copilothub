import { Suspense } from 'react';
import { SearchPageContent } from './search-content';
import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/metadata';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  const baseUrl = getBaseUrl();
  const baseSearchUrl = `${baseUrl}/search`;

  // If there's a search query, add canonical and noindex
  if (query) {
    return {
      title: {
        absolute: `Search: ${query} - CopilotHub`, // Use absolute to prevent template suffix
      },
      description: `Search results for "${query}" - Find prompts, instructions, agents, tools, and MCPs for your AI development needs.`,
      alternates: {
        canonical: baseSearchUrl,
      },
      robots: {
        index: false, // Don't index search results
        follow: true,
      },
    };
  }

  // Base search page - can be indexed
  return {
    title: {
      absolute: 'Search - CopilotHub', // Use absolute to prevent template suffix
    },
    description: 'Search for prompts, instructions, agents, tools, and MCPs for your AI development needs.',
    alternates: {
      canonical: baseSearchUrl,
    },
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-20">
        <section>
          <h1 className="mb-6 text-3xl font-semibold text-slate-50">Search</h1>
          <div className="animate-pulse">
            <div className="h-12 w-full rounded-lg bg-slate-800"></div>
          </div>
        </section>
      </main>
    }>
      <SearchPageContent searchParams={searchParams} />
    </Suspense>
  );
}
