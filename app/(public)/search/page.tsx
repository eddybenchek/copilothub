'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { GlobalSearchDropdown } from '@/components/search/global-search-dropdown';
import { highlightMatch } from '@/lib/search-types';
import type { SearchResults, SearchType, Difficulty } from '@/lib/search-types';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') as SearchType) || 'all';
  const initialDifficulty = (searchParams.get('difficulty') as Difficulty | 'ALL') || 'ALL';

  const [results, setResults] = useState<SearchResults>({
    prompts: [],
    workflows: [],
    tools: [],
  });
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<SearchType>(initialType);
  const [difficulty, setDifficulty] = useState<Difficulty | 'ALL'>(initialDifficulty);
  const [showFilters, setShowFilters] = useState(false);

  const query = initialQuery;

  // Sync state with URL parameters when they change
  useEffect(() => {
    const urlType = (searchParams.get('type') as SearchType) || 'all';
    const urlDifficulty = (searchParams.get('difficulty') as Difficulty | 'ALL') || 'ALL';
    
    setType(urlType);
    setDifficulty(urlDifficulty);
  }, [searchParams]);

  // Perform search
  const performSearch = useCallback(async () => {
    if (!query) {
      setResults({ prompts: [], workflows: [], tools: [] });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('q', query);
      if (type !== 'all') params.set('type', type);
      if (difficulty !== 'ALL') params.set('difficulty', difficulty);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [query, type, difficulty]);

  // Search when query or filters change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Update URL when filters change
  const updateFilters = (newType: SearchType, newDifficulty: Difficulty | 'ALL') => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (newType !== 'all') params.set('type', newType);
    if (newDifficulty !== 'ALL') params.set('difficulty', newDifficulty);
    
    router.push(`/search?${params.toString()}`);
  };

  const totalCount = results.prompts.length + results.workflows.length + results.tools.length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-20">
      <section>
        <h1 className="mb-6 text-3xl font-semibold text-slate-50">Search</h1>
        <GlobalSearchDropdown initialQuery={query} />

        {query && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {loading ? (
              <span>Searching...</span>
            ) : (
              <>
                <span>Found</span>
                <span className="font-semibold text-slate-100">{totalCount} results</span>
                <span>for</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-100">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            )}
          </div>
        )}

        {query && (
          <>
            {/* Filter Toggle Button (Mobile) */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="mt-4 flex items-center gap-2 rounded-full bg-slate-800/60 border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700/60 lg:hidden"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* Filters */}
            <div className={cn('mt-6 flex flex-wrap gap-2 text-xs', !showFilters && 'hidden lg:flex')}>
              {/* Type filters */}
              <FilterPill
                href={`/search?q=${encodeURIComponent(query)}`}
                active={type === 'all'}
                onClick={() => {
                  setType('all');
                  updateFilters('all', difficulty);
                }}
              >
                All
              </FilterPill>
              <FilterPill
                href={`/search?q=${encodeURIComponent(query)}&type=prompt`}
                active={type === 'prompt'}
                onClick={() => {
                  setType('prompt');
                  updateFilters('prompt', difficulty);
                }}
              >
                Prompts
              </FilterPill>
              <FilterPill
                href={`/search?q=${encodeURIComponent(query)}&type=workflow`}
                active={type === 'workflow'}
                onClick={() => {
                  setType('workflow');
                  updateFilters('workflow', difficulty);
                }}
              >
                Workflows
              </FilterPill>
              <FilterPill
                href={`/search?q=${encodeURIComponent(query)}&type=tool`}
                active={type === 'tool'}
                onClick={() => {
                  setType('tool');
                  updateFilters('tool', difficulty);
                }}
              >
                Tools
              </FilterPill>

              <span className="mx-2 h-5 w-px bg-slate-700" />

              {/* Difficulty filters */}
              <FilterPill
                href={`/search?q=${encodeURIComponent(query)}&type=${type}`}
                active={difficulty === 'ALL'}
                onClick={() => {
                  setDifficulty('ALL');
                  updateFilters(type, 'ALL');
                }}
              >
                All
              </FilterPill>
              <FilterPill
                href={`/search?q=${encodeURIComponent(query)}&type=${type}&difficulty=BEGINNER`}
                active={difficulty === 'BEGINNER'}
                onClick={() => {
                  setDifficulty('BEGINNER');
                  updateFilters(type, 'BEGINNER');
                }}
              >
                Beginner
              </FilterPill>
              <FilterPill
                href={`/search?q=${encodeURIComponent(query)}&type=${type}&difficulty=INTERMEDIATE`}
                active={difficulty === 'INTERMEDIATE'}
                onClick={() => {
                  setDifficulty('INTERMEDIATE');
                  updateFilters(type, 'INTERMEDIATE');
                }}
              >
                Intermediate
              </FilterPill>
              <FilterPill
                href={`/search?q=${encodeURIComponent(query)}&type=${type}&difficulty=ADVANCED`}
                active={difficulty === 'ADVANCED'}
                onClick={() => {
                  setDifficulty('ADVANCED');
                  updateFilters(type, 'ADVANCED');
                }}
              >
                Advanced
              </FilterPill>
            </div>
          </>
        )}
      </section>

      {/* Empty State - No Query */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 text-7xl">🔍</div>
          <h2 className="mb-3 text-2xl font-semibold text-slate-200">
            Start Searching
          </h2>
          <p className="mb-8 max-w-md text-slate-400">
            Type in the search box above to find prompts, workflows, and tools for your AI development needs.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-slate-500">Try:</span>
            <Link
              href="/search?q=typescript"
              className="rounded-full bg-slate-800/60 border border-slate-700 px-3 py-1 text-slate-300 transition-colors hover:bg-slate-700/60 hover:border-sky-500/40"
            >
              typescript
            </Link>
            <Link
              href="/search?q=react"
              className="rounded-full bg-slate-800/60 border border-slate-700 px-3 py-1 text-slate-300 transition-colors hover:bg-slate-700/60 hover:border-sky-500/40"
            >
              react
            </Link>
            <Link
              href="/search?q=api"
              className="rounded-full bg-slate-800/60 border border-slate-700 px-3 py-1 text-slate-300 transition-colors hover:bg-slate-700/60 hover:border-sky-500/40"
            >
              api
            </Link>
            <Link
              href="/search?q=debugging"
              className="rounded-full bg-slate-800/60 border border-slate-700 px-3 py-1 text-slate-300 transition-colors hover:bg-slate-700/60 hover:border-sky-500/40"
            >
              debugging
            </Link>
          </div>
        </div>
      )}

      {query && (
        <>
          <section className="space-y-10">
            {/* Show prompts section if type is 'all' or 'prompt' */}
            {(type === 'all' || type === 'prompt') && (
              <SearchSection
                icon="✨"
                label={`Prompts (${results.prompts.length})`}
                emptyLabel="No prompts found."
                items={results.prompts}
                basePath="/prompts"
                query={query}
              />
            )}
            
            {/* Show workflows section if type is 'all' or 'workflow' */}
            {(type === 'all' || type === 'workflow') && (
              <SearchSection
                icon="⚙️"
                label={`Workflows (${results.workflows.length})`}
                emptyLabel="No workflows found."
                items={results.workflows}
                basePath="/workflows"
                query={query}
              />
            )}
            
            {/* Show tools section if type is 'all' or 'tool' */}
            {(type === 'all' || type === 'tool') && (
              <SearchSection
                icon="🔧"
                label={`Tools (${results.tools.length})`}
                emptyLabel="No tools found."
                items={results.tools}
                basePath="/tools"
                query={query}
              />
            )}
          </section>

          {!loading && totalCount === 0 && (
            <div className="text-center py-20">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-xl font-semibold text-slate-300">No results found</h3>
              <p className="text-slate-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function FilterPill({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={cn(
        'rounded-full border px-3 py-1 transition-colors',
        active
          ? 'border-sky-500 bg-sky-500/10 text-sky-300'
          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
      )}
    >
      {children}
    </button>
  );
}

type SectionProps = {
  icon: string;
  label: string;
  emptyLabel: string;
  items: {
    id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: any;
  }[];
  basePath: string;
  query: string;
};

function SearchSection({
  icon,
  label,
  emptyLabel,
  items,
  basePath,
  query,
}: SectionProps) {
  if (!items.length) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h2 className="text-lg font-semibold text-slate-100">{label}</h2>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const { parts } = highlightMatch(item.title, query);

          return (
            <Link
              key={item.id}
              href={`${basePath}/${item.slug}`}
              className="group rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm transition hover:border-sky-500/70 hover:bg-slate-900"
            >
              <div className="mb-1 text-[13px] font-medium text-slate-100">
                {parts.map((p, i) => (
                  <span
                    key={i}
                    className={p.match ? 'text-sky-400' : undefined}
                  >
                    {p.text}
                  </span>
                ))}
              </div>
              <p className="line-clamp-2 text-xs text-slate-400">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
