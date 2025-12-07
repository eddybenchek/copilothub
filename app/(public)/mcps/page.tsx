'use client';

import { useState, useMemo, useEffect } from 'react';
import { McpCard } from '@/components/mcp/mcp-card';
import { Search } from 'lucide-react';
import type { McpWithAuthor } from '@/lib/types';
import { Difficulty } from '@prisma/client';
import clsx from 'clsx';

type SortOption = 'recent' | 'beginner' | 'intermediate' | 'advanced';

export default function McpsPage() {
  const [mcps, setMcps] = useState<McpWithAuthor[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | Difficulty>('All');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mcps')
      .then((res) => res.json())
      .then((data) => {
        setMcps(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

    // Difficulty filter
    if (difficultyFilter !== 'All') {
      result = result.filter((mcp) => mcp.difficulty === difficultyFilter);
    }

    // Sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'beginner':
          const orderBeg = { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2 };
          return orderBeg[a.difficulty] - orderBeg[b.difficulty];
        case 'intermediate':
          return a.difficulty === 'INTERMEDIATE' ? -1 : 1;
        case 'advanced':
          const orderAdv = { ADVANCED: 0, INTERMEDIATE: 1, BEGINNER: 2 };
          return orderAdv[a.difficulty] - orderAdv[b.difficulty];
        default:
          return 0;
      }
    });

    return result;
  }, [mcps, query, categoryFilter, difficultyFilter, sortBy]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-50">MCP Servers</h1>
        <p className="text-slate-400">
          Discover Model Context Protocol servers to extend your AI coding environment
        </p>
      </header>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search MCP servers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/40 px-10 py-3 text-slate-100 placeholder:text-slate-500 focus:border-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
                  ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                  : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600'
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

        {/* Difficulty and Sort */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as 'All' | Difficulty)}
              className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-100 focus:border-sky-500/40 focus:outline-none"
            >
              <option value="All">All</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-100 focus:border-sky-500/40 focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="beginner">Beginner First</option>
              <option value="intermediate">Intermediate First</option>
              <option value="advanced">Advanced First</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-slate-400">
            {filteredAndSortedMcps.length} {filteredAndSortedMcps.length === 1 ? 'server' : 'servers'}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40"
            />
          ))}
        </div>
      ) : filteredAndSortedMcps.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-400">No MCP servers found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedMcps.map((mcp) => (
            <McpCard key={mcp.id} mcp={mcp} />
          ))}
        </div>
      )}
    </main>
  );
}

