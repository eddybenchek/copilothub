'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { McpCard } from '@/components/mcp/mcp-card';
import { Search, Loader2 } from 'lucide-react';
import type { McpWithAuthor } from '@/lib/types';
import clsx from 'clsx';

type SortOption = 'recent';

interface McpsClientProps {
  initialMcps: McpWithAuthor[];
  initialStats: {
    total: number;
    categories: string[];
    counts: Record<string, number>;
  };
  initialHasMore: boolean;
  initialOffset: number;
}

export function McpsClient({
  initialMcps,
  initialStats,
  initialHasMore: initialHasMoreProp,
  initialOffset: initialOffsetProp,
}: McpsClientProps) {
  const [mcps, setMcps] = useState<McpWithAuthor[]>(initialMcps);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMoreProp);
  const [offset, setOffset] = useState(initialOffsetProp);
  const [initialized, setInitialized] = useState(false);
  const [apiCategoryKeys, setApiCategoryKeys] = useState<string[]>(initialStats.categories);
  const [apiCategoryCounts, setApiCategoryCounts] = useState<Record<string, number>>(initialStats.counts);
  const [totalCount, setTotalCount] = useState(initialStats.total);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchMcps = useCallback(async (reset = false) => {
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

      const response = await fetch(`/api/mcps?${params.toString()}`);
      const data = await response.json();
      
      if (reset) {
        setMcps(data.mcps || []);
      } else {
        setMcps(prev => {
          const existingIds = new Set(prev.map((m: McpWithAuthor) => m.id));
          const newMcps = (data.mcps || []).filter((m: McpWithAuthor) => !existingIds.has(m.id));
          return [...prev, ...newMcps];
        });
      }
      
      setHasMore(data.hasMore || false);
      setOffset(data.nextOffset || (reset ? (data.mcps?.length || 0) : currentOffset + (data.mcps?.length || 0)));
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching MCPs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset, categoryFilter, debouncedQuery]);

  // Fetch MCP stats (total + category counts) separately
  useEffect(() => {
    fetch('/api/mcps/stats')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.categories)) {
          setApiCategoryKeys(data.categories);
        }
        if (data.counts) {
          setApiCategoryCounts(data.counts);
        }
        if (typeof data.total === 'number') {
          setTotalCount(data.total);
        }
      })
      .catch((error) => {
        console.error('Error fetching MCP stats:', error);
      });
  }, []);

  // Refetch when category or search query changes
  useEffect(() => {
    // Skip on initial mount (we have initial data)
    if (!initialized && initialMcps.length > 0) {
      setInitialized(true);
      return;
    }
    // Don't refetch if not initialized yet
    if (!initialized) return;

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

    fetch(`/api/mcps?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setMcps(data.mcps || []);
        setHasMore(data.hasMore || false);
        setOffset(data.nextOffset || (data.mcps?.length || 0));
      })
      .catch((error) => {
        console.error('Error fetching MCPs:', error);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, debouncedQuery, initialized]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMcps(false);
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
  }, [hasMore, loading, loadingMore, fetchMcps]);

  // Build dynamic categories from MCP data (fallback when stats haven't loaded)
  const { derivedCategoryKeys, derivedCategoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    const catSet = new Set<string>();

    for (const mcp of mcps) {
      const category = (mcp.category || 'other').toLowerCase();
      if (!category) continue;
      catSet.add(category);
      counts[category] = (counts[category] ?? 0) + 1;
    }

    const sortedCategories = Array.from(catSet).sort();
    return { derivedCategoryKeys: sortedCategories, derivedCategoryCounts: counts };
  }, [mcps]);

  const displayCategoryKeys =
    apiCategoryKeys.length > 0 ? apiCategoryKeys : derivedCategoryKeys;

  const categories = useMemo(
    () => [
      { key: 'all', label: 'All' },
      ...displayCategoryKeys.map((cat) => ({
        key: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
      })),
    ],
    [displayCategoryKeys]
  );

  const getCategoryCount = (key: string) =>
    key === 'all'
      ? totalCount || mcps.length
      : apiCategoryCounts[key] ?? derivedCategoryCounts[key] ?? 0;

  const filteredAndSortedMcps = useMemo(() => {
    let result = mcps;

    // Category & search filtering are now handled server-side via the API.
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
  }, [mcps, sortBy]);

  // Total or filtered count for the "X servers" label
  const serversCountLabel = useMemo(() => {
    // When no filters are applied, show total from stats (or fallback)
    if (categoryFilter === 'all' && !debouncedQuery.trim()) {
      return totalCount || mcps.length;
    }
    // Otherwise show count of filtered results
    return filteredAndSortedMcps.length;
  }, [categoryFilter, debouncedQuery, filteredAndSortedMcps.length, mcps.length, totalCount]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">MCP Servers</h1>
        <p className="text-muted-foreground">
          Discover Model Context Protocol servers to extend your AI coding environment
        </p>
      </header>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <label htmlFor="mcps-search" className="sr-only">
            Search MCP servers
          </label>
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="mcps-search"
            type="text"
            placeholder="Search MCP servers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-10 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Search MCP servers"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setCategoryFilter(category.key)}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                categoryFilter === category.key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground/80 hover:border-primary/50 hover:bg-accent'
              )}
            >
              {category.label}
              <span className="ml-2 text-xs opacity-70">
                ({getCategoryCount(category.key)})
              </span>
            </button>
          ))}
        </div>

        {/* Sort and Count */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {serversCountLabel} {serversCountLabel === 1 ? 'server' : 'servers'}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="mcps-sort-select" className="text-sm text-muted-foreground">
              Sort by:
            </label>
            <select
              id="mcps-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
              aria-label="Sort MCP servers"
            >
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading MCP servers...</p>
        </div>
      ) : filteredAndSortedMcps.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No MCP servers found matching your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedMcps.map((mcp) => (
              <McpCard key={mcp.id} mcp={mcp} />
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
  );
}

