import { performSearch } from '@/lib/search';
import { SearchClient } from '@/components/search/search-client';
import type { SearchType, SearchResults } from '@/lib/search-types';

interface SearchPageContentProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}

export async function SearchPageContent({ searchParams }: SearchPageContentProps) {
  const params = await searchParams;
  const query = params.q || '';
  const type = (params.type || 'all') as SearchType;

  // If there's a query, fetch results on server
  let initialResults: SearchResults = {
    prompts: [],
    tools: [],
    mcps: [],
    instructions: [],
    agents: [],
  };

  if (query) {
    try {
      const results = await performSearch({
        query,
        type,
        limitPerSection: 20,
      });
      initialResults = results;
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  return (
    <SearchClient
      initialQuery={query}
      initialType={type}
      initialResults={initialResults}
    />
  );
}

