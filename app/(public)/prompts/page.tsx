'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { PromptCard } from '@/components/prompt/prompt-card';
import { Search, Loader2, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PromptWithAuthor } from '@/lib/types';

const GITHUB_REPO_URL = 'https://github.com/eddybenchek/copilothub';

type SortOption = 'recent';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptWithAuthor[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  // Ref for intersection observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch prompts function
  const fetchPrompts = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/prompts?offset=${currentOffset}&limit=20`);
      const data = await response.json();
      
      if (reset) {
        setPrompts(data.prompts || []);
      } else {
        setPrompts(prev => [...prev, ...(data.prompts || [])]);
      }
      
      setHasMore(data.hasMore || false);
      setOffset(data.nextOffset || currentOffset + (data.prompts?.length || 0));
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset]);

  // Initial fetch
  useEffect(() => {
    fetchPrompts(true);
  }, []);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPrompts(false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loading, loadingMore, fetchPrompts]);

  // Build category counts from tags
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    for (const prompt of prompts) {
      for (const tag of prompt.tags) {
        const normalizedTag = tag.toLowerCase();
        // Extract category from tags like "category:code-generation"
        if (normalizedTag.startsWith('category:')) {
          const category = normalizedTag.replace('category:', '');
          counts[category] = (counts[category] ?? 0) + 1;
        }
      }
    }
    return counts;
  }, [prompts]);

  const filteredAndSortedPrompts = useMemo(() => {
    let result = prompts;

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((prompt) =>
        prompt.tags.some((tag) => tag.toLowerCase() === `category:${selectedCategory}`)
      );
    }

    // Search filter
    if (query) {
      result = result.filter((prompt) =>
        (prompt.title + ' ' + prompt.description + ' ' + prompt.tags.join(' '))
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    }

    // Sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [prompts, query, selectedCategory, sortBy]);

  const CATEGORY_LABELS: Record<string, string> = {
    'code-generation': 'Code Generation',
    'code-review': 'Code Review',
    'debugging': 'Debugging',
    'documentation': 'Documentation',
    'refactoring': 'Refactoring',
    'testing': 'Testing',
    'optimization': 'Optimization',
    'security': 'Security',
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* SIDEBAR - Desktop Only */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Categories
        </h2>

        <div className="space-y-1">
          <SidebarItem
            label="All"
            count={prompts.length}
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          />

          {Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([key, count]) => (
              <SidebarItem
                key={key}
                label={CATEGORY_LABELS[key] ?? key}
                count={count}
                active={selectedCategory === key}
                onClick={() => setSelectedCategory(key)}
              />
            ))}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* Mobile category pills */}
        <div className="mb-6 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <PillFilter
              label="All"
              active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            />
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([key, count]) => (
                <PillFilter
                  key={key}
                  label={`${CATEGORY_LABELS[key] ?? key} (${count})`}
                  active={selectedCategory === key}
                  onClick={() => setSelectedCategory(key)}
                />
              ))}
          </div>
        </div>

        {/* Header row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-50">All Prompts</h1>
            <p className="mt-1 text-sm text-slate-400">
              Browse curated AI prompts for GitHub Copilot.
            </p>
          </div>

          <Button asChild size="sm" variant="outline" className="gap-2">
            <a 
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              Contribute on GitHub
            </a>
          </Button>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search prompts..."
              className="w-full max-w-md rounded-full bg-slate-900 border border-slate-700/70 pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Sort */}
        <div className="mb-8 flex flex-wrap items-center justify-end gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-full bg-slate-900 border border-slate-700 px-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          >
            <option value="recent">Most Recent</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400 mb-4" />
            <p className="text-slate-400">Loading prompts...</p>
          </div>
        ) : filteredAndSortedPrompts.length === 0 ? (
          <p className="mt-8 text-sm text-slate-400">
            {query || selectedCategory !== 'all'
              ? 'No prompts found for this filter.'
              : 'No prompts found. Be the first to submit one!'}
          </p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAndSortedPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
            
            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="mt-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

type SidebarItemProps = {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
};

function SidebarItem({ label, count, active, onClick }: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-full px-3 py-1.5 text-sm transition ${
        active
          ? 'bg-slate-100 text-slate-900 font-medium'
          : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-50'
      }`}
    >
      <span>{label}</span>
      <span className="text-xs text-slate-500">{count}</span>
    </button>
  );
}

type PillFilterProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function PillFilter({ label, active, onClick }: PillFilterProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs transition ${
        active
          ? 'bg-sky-500/20 border-sky-500/70 text-sky-200'
          : 'bg-slate-900 border-slate-700 text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

