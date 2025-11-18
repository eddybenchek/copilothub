'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { PromptCard } from '@/components/prompt/prompt-card';
import { WorkflowCard } from '@/components/workflow/workflow-card';
import { ToolCard } from '@/components/tool/tool-card';
import type { PromptWithAuthor, WorkflowWithAuthor, ToolWithAuthor } from '@/lib/types';
import { Difficulty } from '@prisma/client';
import clsx from 'clsx';

type SearchResults = {
  prompts: PromptWithAuthor[];
  workflows: WorkflowWithAuthor[];
  tools: ToolWithAuthor[];
  query: string;
  totalResults: number;
};

type ContentType = 'all' | 'prompt' | 'workflow' | 'tool';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [results, setResults] = useState<SearchResults>({
    prompts: [],
    workflows: [],
    tools: [],
    query: '',
    totalResults: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Filters
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState<ContentType>((searchParams.get('type') as ContentType) || 'all');
  const [difficulty, setDifficulty] = useState<'All' | Difficulty>(
    (searchParams.get('difficulty') as Difficulty) || 'All'
  );
  const [showFilters, setShowFilters] = useState(false);

  // Perform search
  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (type !== 'all') params.set('type', type);
      if (difficulty !== 'All') params.set('difficulty', difficulty);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [query, type, difficulty]);

  // Search on mount and when params change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (type !== 'all') params.set('type', type);
    if (difficulty !== 'All') params.set('difficulty', difficulty);
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    router.replace(newUrl, { scroll: false });
  }, [query, type, difficulty, router]);

  // All results for keyboard navigation
  const allResults = useMemo(() => {
    return [
      ...results.prompts.map((p) => ({ type: 'prompt' as const, data: p })),
      ...results.workflows.map((w) => ({ type: 'workflow' as const, data: w })),
      ...results.tools.map((t) => ({ type: 'tool' as const, data: t })),
    ];
  }, [results]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const selected = allResults[selectedIndex];
        if (selected) {
          const slug = selected.data.slug;
          const basePath =
            selected.type === 'prompt'
              ? '/prompts'
              : selected.type === 'workflow'
              ? '/workflows'
              : '/tools';
          router.push(`${basePath}/${slug}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, allResults, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Search Header */}
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="mb-6 text-4xl font-bold text-slate-50">Search</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm transition-all duration-200 focus-within:border-sky-500/60 focus-within:shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <div className="flex items-center px-6 py-4">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search prompts, workflows, and tools..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="ml-4 flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="ml-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span className="text-xl">×</span>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Filter Toggle Button (Mobile) */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4 flex items-center gap-2 rounded-full bg-slate-800/60 border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700/60 lg:hidden"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        {/* Filters */}
        <div className={clsx('flex flex-wrap gap-4', !showFilters && 'hidden lg:flex')}>
          {/* Type Filter */}
          <div className="flex gap-2">
            {(['all', 'prompt', 'workflow', 'tool'] as ContentType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={clsx(
                  'rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
                  type === t
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {(['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={clsx(
                  'rounded-full px-4 py-1.5 text-sm font-medium border transition-colors',
                  difficulty === level
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                )}
              >
                {level === 'All' ? 'All' : level.charAt(0) + level.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-slate-400">
        {loading ? (
          'Searching...'
        ) : results.totalResults > 0 ? (
          <>
            Found <span className="font-semibold text-slate-200">{results.totalResults}</span>{' '}
            {results.totalResults === 1 ? 'result' : 'results'}
            {results.query && (
              <>
                {' '}
                for &ldquo;<span className="text-slate-200">{results.query}</span>&rdquo;
              </>
            )}
          </>
        ) : (
          query && 'No results found. Try different keywords or filters.'
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-sky-500" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Prompts */}
          {results.prompts.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-semibold text-slate-50">
                Prompts <span className="text-slate-500">({results.prompts.length})</span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.prompts.map((prompt, idx) => (
                  <div key={prompt.id} className={clsx(selectedIndex === idx && 'ring-2 ring-sky-500 rounded-2xl')}>
                    <PromptCard prompt={prompt} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Workflows */}
          {results.workflows.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-semibold text-slate-50">
                Workflows <span className="text-slate-500">({results.workflows.length})</span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.workflows.map((workflow, idx) => (
                  <div
                    key={workflow.id}
                    className={clsx(
                      selectedIndex === results.prompts.length + idx && 'ring-2 ring-sky-500 rounded-2xl'
                    )}
                  >
                    <WorkflowCard workflow={workflow} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tools */}
          {results.tools.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-semibold text-slate-50">
                Tools <span className="text-slate-500">({results.tools.length})</span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.tools.map((tool, idx) => (
                  <div
                    key={tool.id}
                    className={clsx(
                      selectedIndex === results.prompts.length + results.workflows.length + idx &&
                        'ring-2 ring-sky-500 rounded-2xl'
                    )}
                  >
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!loading && results.totalResults === 0 && query && (
            <div className="text-center py-20">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-xl font-semibold text-slate-300">No results found</h3>
              <p className="text-slate-500">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      {allResults.length > 0 && (
        <div className="mt-8 text-center text-xs text-slate-500">
          Use <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700">↑</kbd>{' '}
          <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700">↓</kbd> to navigate,{' '}
          <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Enter</kbd> to open
        </div>
      )}
    </div>
  );
}

