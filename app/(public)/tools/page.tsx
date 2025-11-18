'use client';

import { useState, useMemo, useEffect } from 'react';
import { ToolCard } from '@/components/tool/tool-card';
import { Search } from 'lucide-react';
import type { ToolWithAuthor } from '@/lib/types';
import { Difficulty } from '@prisma/client';
import clsx from 'clsx';

type SortOption = 'recent' | 'beginner' | 'intermediate' | 'advanced';

const CATEGORY_OPTIONS = [
  { key: "all", label: "All" },
  { key: "editor", label: "Editor" },
  { key: "cli", label: "CLI Tools" },
  { key: "productivity", label: "Productivity" },
  { key: "database", label: "Databases" },
  { key: "browser", label: "Browser Tools" },
  { key: "ai", label: "AI Tools" },
];

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolWithAuthor[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | Difficulty>('All');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tools')
      .then((res) => res.json())
      .then((data) => {
        setTools(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build category counts from tags
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    for (const tool of tools) {
      for (const tag of tool.tags) {
        const normalizedTag = tag.toLowerCase();
        // Check if this tag matches any of our category keys
        const matchedCategory = CATEGORY_OPTIONS.find(
          (cat) => cat.key !== 'all' && cat.key === normalizedTag
        );
        if (matchedCategory) {
          counts[matchedCategory.key] = (counts[matchedCategory.key] ?? 0) + 1;
        }
      }
    }
    return counts;
  }, [tools]);

  const filteredAndSortedTools = useMemo(() => {
    let result = tools;

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((tool) => {
        const tags = (tool.tags ?? []).map((t: string) => t.toLowerCase());
        return tags.includes(categoryFilter);
      });
    }

    // Search filter
    if (query) {
      result = result.filter((tool) =>
        (tool.title + ' ' + tool.description + ' ' + tool.tags.join(' '))
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'All') {
      result = result.filter((tool) => tool.difficulty === difficultyFilter);
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
  }, [tools, query, categoryFilter, difficultyFilter, sortBy]);

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* SIDEBAR - Desktop Only */}
      <aside className="hidden w-56 flex-shrink-0 lg:block">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Categories & Types
        </h2>

        <div className="space-y-1">
          <SidebarItem
            label="All tools"
            count={tools.length}
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
            <h1 className="text-3xl font-semibold text-slate-50">All Tools</h1>
            <p className="mt-1 text-sm text-slate-400">
              Discover essential tools to enhance your AI-powered development workflow.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search tools..."
              className="w-full max-w-md rounded-full bg-slate-900 border border-slate-700/70 pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Difficulty Filters & Sort */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                  difficultyFilter === level
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                {level === 'All' ? 'All' : level.charAt(0) + level.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-full bg-slate-900 border border-slate-700 px-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          >
            <option value="recent">Most Recent</option>
            <option value="beginner">Beginner First</option>
            <option value="intermediate">Intermediate First</option>
            <option value="advanced">Advanced First</option>
          </select>
        </div>

        {/* Grid / Loading / Empty States */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading tools...</p>
          </div>
        ) : filteredAndSortedTools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">
              {query || categoryFilter !== 'all' || difficultyFilter !== 'All'
                ? 'No tools match your filters.'
                : 'No tools found. Be the first to submit one!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredAndSortedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
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
          ? "bg-slate-100 text-slate-900 font-medium"
          : "text-slate-300 hover:bg-slate-800/80 hover:text-slate-50"
      )}
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
      className={clsx(
        "whitespace-nowrap rounded-full border px-3 py-1 text-xs transition",
        active
          ? "bg-sky-500/20 border-sky-500/70 text-sky-200"
          : "bg-slate-900 border-slate-700 text-slate-300"
      )}
    >
      {label}
    </button>
  );
}

