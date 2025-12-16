'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { McpCard } from '@/components/mcp/mcp-card';
import { Search, Loader2 } from 'lucide-react';
import type { McpWithAuthor } from '@/lib/types';
import clsx from 'clsx';

type SortOption = 'recent';

export default function McpsPage() {
  const [mcps, setMcps] = useState<McpWithAuthor[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchMcps = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/mcps?offset=${currentOffset}&limit=20`);
      const data = await response.json();
      
      if (reset) {
        setMcps(data.mcps || []);
      } else {
        setMcps(prev => [...prev, ...(data.mcps || [])]);
      }
      
      setHasMore(data.hasMore || false);
      setOffset(data.nextOffset || currentOffset + (data.mcps?.length || 0));
    } catch (error) {
      console.error('Error fetching MCPs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchMcps(true);
  }, []);

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

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loading, loadingMore, fetchMcps]);

  // Build dynamic categories from MCP data
  const { categories, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    const catSet = new Set<string>();
    
    for (const mcp of mcps) {
      const category = (mcp.category || 'other').toLowerCase();
      catSet.add(category);
      counts[category] = (counts[category] ?? 0) + 1;
    }
    
    const sortedCategories = Array.from(catSet).sort();
    const categoryOptions = [
      { key: 'all', label: 'All' },
      ...sortedCategories.map(cat => ({
        key: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')
      }))
    ];
    
    return { categories: categoryOptions, categoryCounts: counts };
  }, [mcps]);

  const filteredAndSortedMcps = useMemo(() => {
    let result = mcps;

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((mcp) => {
        const tags = (mcp.tags ?? []).map((t: string) => t.toLowerCase());
        return tags.includes(categoryFilter) || mcp.category?.toLowerCase() === categoryFilter;
      });
    }

    // Search filter
    if (query) {
      result = result.filter((mcp) =>
        (mcp.title + ' ' + mcp.description + ' ' + mcp.tags.join(' '))
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
  }, [mcps, query, categoryFilter, sortBy]);

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
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search MCP servers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-10 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              {category.key === 'all' ? (
                <span className="ml-2 text-xs opacity-70">({mcps.length})</span>
              ) : (
                categoryCounts[category.key] && (
                  <span className="ml-2 text-xs opacity-70">
                    ({categoryCounts[category.key]})
                  </span>
                )
              )}
            </button>
          ))}
        </div>

        {/* Sort and Count */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedMcps.length} {filteredAndSortedMcps.length === 1 ? 'server' : 'servers'}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
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
  );
}

