'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { WorkflowCard } from '@/components/workflow/workflow-card';
import { Search, ArrowLeft } from 'lucide-react';
import type { WorkflowWithAuthor } from '@/lib/types';

type FilterTag = 'all' | 'react' | 'typescript' | 'node' | 'database' | 'dependencies' | 'monolith' | 'sql';

// Filter chips mapping (static configuration)
const FILTER_CHIPS: { value: FilterTag; label: string; tags: string[] }[] = [
  { value: 'all', label: 'All', tags: [] },
  { value: 'react', label: 'React / Next.js upgrades', tags: ['react', 'nextjs', 'hooks'] },
  { value: 'typescript', label: 'JavaScript → TypeScript', tags: ['typescript', 'javascript'] },
  { value: 'node', label: 'Node & runtime upgrades', tags: ['node', 'runtime'] },
  { value: 'database', label: 'Database / ORM', tags: ['orm', 'prisma', 'database', 'sql'] },
  { value: 'dependencies', label: 'Dependency modernization', tags: ['dependencies', 'npm', 'upgrade'] },
  { value: 'monolith', label: 'Legacy monolith refactors', tags: ['monolith', 'architecture', 'refactor'] },
  { value: 'sql', label: 'SQL & schema migrations', tags: ['sql', 'schema', 'migration'] },
];

export default function ModernizationWorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowWithAuthor[]>([]);
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterTag>('all');
  const [loading, setLoading] = useState(true);

  // Fetch all workflows and filter for modernization
  useEffect(() => {
    fetch('/api/workflows')
      .then((res) => res.json())
      .then((data) => {
        // Filter for modernization workflows only
        const modernizationWorkflows = data.filter((workflow: WorkflowWithAuthor) =>
          workflow.tags.some((tag: string) => tag.toLowerCase() === 'category:modernization')
        );
        setWorkflows(modernizationWorkflows);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredWorkflows = useMemo(() => {
    let result = workflows;

    // Apply tag filter
    if (selectedFilter !== 'all') {
      const filterConfig = FILTER_CHIPS.find((f) => f.value === selectedFilter);
      if (filterConfig) {
        result = result.filter((workflow) =>
          filterConfig.tags.some((filterTag) =>
            workflow.tags.some((workflowTag) => workflowTag.toLowerCase().includes(filterTag.toLowerCase()))
          )
        );
      }
    }

    // Apply search query
    if (query) {
      result = result.filter((workflow) =>
        (workflow.title + ' ' + workflow.description + ' ' + workflow.tags.join(' '))
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    }

    return result;
  }, [workflows, query, selectedFilter]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-20">
      {/* Back link */}
      <Link
        href="/#migration-workflows"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Modernization overview
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold text-slate-50">
          Migration Workflows
        </h1>
        <p className="text-lg text-slate-400">
          Step-by-step recipes for safe framework, language, and dependency changes.
          Complete playbooks for production-grade modernization projects.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search migration workflows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-slate-700 bg-slate-900/70 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => setSelectedFilter(chip.value)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              selectedFilter === chip.value
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-slate-400">
        {loading ? (
          <span>Loading...</span>
        ) : (
          <span>
            Showing <span className="font-semibold text-slate-200">{filteredWorkflows.length}</span>{' '}
            {filteredWorkflows.length === 1 ? 'workflow' : 'workflows'}
          </span>
        )}
      </div>

      {/* Workflows grid */}
      {!loading && filteredWorkflows.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-12 text-center">
          <p className="text-slate-400">No workflows found matching your filters.</p>
          <button
            onClick={() => {
              setSelectedFilter('all');
              setQuery('');
            }}
            className="mt-4 text-sm text-sky-400 hover:text-sky-300"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </main>
  );
}

