'use client';

import { useState, useMemo, useEffect } from 'react';
import { WorkflowCard } from '@/components/workflow/workflow-card';
import { Search } from 'lucide-react';
import type { WorkflowWithAuthor } from '@/lib/types';
import { Difficulty } from '@prisma/client';

type SortOption = 'recent' | 'beginner' | 'intermediate' | 'advanced';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowWithAuthor[]>([]);
  const [query, setQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | Difficulty>('All');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/workflows')
      .then((res) => res.json())
      .then((data) => {
        setWorkflows(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredAndSortedWorkflows = useMemo(() => {
    let result = workflows;

    if (query) {
      result = result.filter((workflow) =>
        (workflow.title + ' ' + workflow.description + ' ' + workflow.tags.join(' '))
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    }

    if (difficultyFilter !== 'All') {
      result = result.filter((workflow) => workflow.difficulty === difficultyFilter);
    }

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
  }, [workflows, query, difficultyFilter, sortBy]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">All Workflows</h1>
        <p className="text-lg text-muted-foreground">
          Step-by-step workflows for common development tasks.
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search workflows..."
            className="w-full rounded-full bg-slate-900 border border-slate-700/70 pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

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

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      ) : filteredAndSortedWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {query || difficultyFilter !== 'All'
              ? 'No workflows match your filters.'
              : 'No workflows found. Be the first to submit one!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedWorkflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </div>
  );
}

