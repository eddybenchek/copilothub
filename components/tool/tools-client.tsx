'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ToolCard } from '@/components/tool/tool-card';
import { Search, Loader2 } from 'lucide-react';
import type { ToolWithAuthor } from '@/lib/types';
import clsx from 'clsx';

type SortOption = 'recent';

const CATEGORY_OPTIONS = [
  { key: "all", label: "All" },
  { key: "editor", label: "Editor" },
  { key: "cli", label: "CLI Tools" },
  { key: "productivity", label: "Productivity" },
  { key: "database", label: "Databases" },
  { key: "browser", label: "Browser Tools" },
  { key: "ai", label: "AI Tools" },
];

interface ToolsClientProps {
  initialTools: ToolWithAuthor[];
  initialCategoryCounts: Record<string, number>;
  initialTotalCount: number;
  initialHasMore: boolean;
  initialOffset: number;
}

export function ToolsClient({
  initialTools,
  initialCategoryCounts,
  initialTotalCount,
  initialHasMore: initialHasMoreProp,
  initialOffset: initialOffsetProp,
}: ToolsClientProps) {
  const [tools, setTools] = useState<ToolWithAuthor[]>(initialTools);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMoreProp);
  const [offset, setOffset] = useState(initialOffsetProp);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(initialCategoryCounts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  // Ref to track if this is the initial mount
  const isInitialMount = useRef(true);

  // Debounce search query for better UX and to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchTools = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        offset: currentOffset.toString(),
        limit: '20',
      });

      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }

      if (debouncedQuery.trim()) {
        params.append('query', debouncedQuery.trim());
      }

      const response = await fetch(`/api/tools?${params.toString()}`);
      const data = await response.json();
      
      if (reset) {
        setTools(data.tools || []);
      } else {
        setTools(prev => {
          const existingIds = new Set(prev.map((t: ToolWithAuthor) => t.id));
          const newTools = (data.tools || []).filter((t: ToolWithAuthor) => !existingIds.has(t.id));
          return [...prev, ...newTools];
        });
      }
      
      setHasMore(data.hasMore || false);
      setOffset(data.nextOffset || (reset ? (data.tools?.length || 0) : currentOffset + (data.tools?.length || 0)));
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset, categoryFilter, debouncedQuery]);

  // Fetch category counts and total count separately so they are accurate
  useEffect(() => {
    fetch('/api/tools/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.counts) {
          setCategoryCounts(data.counts);
        }
        if (data.total !== undefined) {
          setTotalCount(data.total);
        }
      })
      .catch((error) => {
        console.error('Error fetching tool category counts:', error);
      });
  }, []);

  // Refetch when category or search query changes
  useEffect(() => {
    // Skip on initial mount (we have initial data)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setOffset(0);
    setLoading(true);

    const params = new URLSearchParams({
      offset: '0',
      limit: '20',
    });

    if (categoryFilter !== 'all') {
      params.append('category', categoryFilter);
    }

    if (debouncedQuery.trim()) {
      params.append('query', debouncedQuery.trim());
    }

    fetch(`/api/tools?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTools(data.tools || []);
        setHasMore(data.hasMore || false);
        setOffset(data.nextOffset || (data.tools?.length || 0));
      })
      .catch((error) => {
        console.error('Error fetching tools:', error);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, debouncedQuery]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchTools(false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    // Capture the current ref value for cleanup
    const currentRef = loadMoreRef.current;

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadingMore, fetchTools]);

  const filteredAndSortedTools = useMemo(() => {
    let result = tools;

    // Category and search filtering are now done server-side via the API.
    // Only apply sorting client-side.
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [tools, sortBy]);

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* SIDEBAR - Desktop Only */}
      <aside className="hidden w-56 flex-shrink-0 lg:block">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Categories & Types
        </h2>

        <div className="space-y-1">
          <SidebarItem
            label="All tools"
            count={totalCount || tools.length}
            active={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
          />

          {CATEGORY_OPTIONS.filter((cat) => cat.key !== 'all').map((cat) => (
            <SidebarItem
              key={cat.key}
              label={cat.label}
              count={categoryCounts[cat.key] ?? 0}
              active={categoryFilter === cat.key}
              onClick={() => setCategoryFilter(cat.key)}
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
              active={categoryFilter === 'all'}
              onClick={() => setCategoryFilter('all')}
            />
            {CATEGORY_OPTIONS.filter((cat) => cat.key !== 'all').map((cat) => (
              <PillFilter
                key={cat.key}
                label={`${cat.label} (${categoryCounts[cat.key] ?? 0})`}
                active={categoryFilter === cat.key}
                onClick={() => setCategoryFilter(cat.key)}
              />
            ))}
          </div>
        </div>

        {/* Header row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">All Tools</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Discover essential tools to enhance your AI-powered development workflow.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <label htmlFor="tools-search" className="sr-only">
            Search tools
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="tools-search"
              type="text"
              placeholder="Search tools..."
              className="w-full max-w-md rounded-full bg-card border border-border pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tools"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="mb-8 flex flex-wrap items-center justify-end gap-4">
          <label htmlFor="tools-sort-select" className="sr-only">
            Sort tools by
          </label>
          <select
            id="tools-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-full bg-card border border-border px-4 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
            aria-label="Sort tools"
          >
            <option value="recent">Most Recent</option>
          </select>
        </div>

        {/* Grid / Loading / Empty States */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading tools...</p>
          </div>
        ) : filteredAndSortedTools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {query || categoryFilter !== 'all'
                ? 'No tools match your filters.'
                : 'No tools found. Be the first to submit one!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {filteredAndSortedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
            
            {hasMore && (
              <div ref={loadMoreRef} className="mt-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
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
      className={clsx(
        "flex w-full items-center justify-between rounded-full px-3 py-1.5 text-sm transition",
        active
          ? "bg-primary text-primary-foreground font-medium"
          : "text-foreground/80 hover:bg-accent hover:text-foreground"
      )}
    >
      <span>{label}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
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
      className={clsx(
        "whitespace-nowrap rounded-full border px-3 py-1 text-xs transition",
        active
          ? "bg-primary/20 border-primary/70 text-primary"
          : "bg-card border-border text-foreground/80"
      )}
    >
      {label}
    </button>
  );
}

