'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AgentCard } from '@/components/agents/agent-card';
import { Loader2 } from 'lucide-react';
import { Agent, User, Vote } from '@prisma/client';

type AgentWithRelations = Agent & {
  author: User;
  votes: Vote[];
  voteCount?: number;
};

interface AgentsClientProps {
  initialAgents: AgentWithRelations[];
  initialStats: {
    total: number;
    categories: string[];
    counts: Record<string, number>;
  };
  initialHasMore: boolean;
  initialOffset: number;
}

export function AgentsClient({
  initialAgents,
  initialStats,
  initialHasMore: initialHasMoreProp,
  initialOffset: initialOffsetProp,
}: AgentsClientProps) {
  const [agents, setAgents] = useState<AgentWithRelations[]>(initialAgents);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMoreProp);
  const [offset, setOffset] = useState(initialOffsetProp);
  const [categories, setCategories] = useState<string[]>(initialStats.categories);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(initialStats.counts);
  const [totalCount, setTotalCount] = useState(initialStats.total);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchAgents = useCallback(
    async (reset = false) => {
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

        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }

        const response = await fetch(`/api/agents?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();

        // Ensure we have valid data
        if (!data || !Array.isArray(data.agents)) {
          console.error('Invalid API response:', data);
          if (reset) {
            setAgents([]);
          }
          return;
        }

        if (reset) {
          setAgents(data.agents);
        } else {
          setAgents((prev) => {
            if (!Array.isArray(prev)) return data.agents;
            const existingIds = new Set(prev.map((a: AgentWithRelations) => a.id));
            const newAgents = data.agents.filter((a: AgentWithRelations) => !existingIds.has(a.id));
            return [...prev, ...newAgents];
          });
        }

        setHasMore(data.hasMore || false);
        setOffset(
          data.nextOffset ||
            (reset
              ? (data.agents?.length || 0)
              : currentOffset + data.agents.length)
        );
      } catch (error) {
        console.error('Error fetching agents:', error);
        if (reset) {
          setAgents([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [offset, selectedCategory]
  );

  // Fetch stats (total agents and category counts) separately so they are accurate
  useEffect(() => {
    fetch('/api/agents/stats')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
        if (data.counts) {
          setCategoryCounts(data.counts);
        }
        if (typeof data.total === 'number') {
          setTotalCount(data.total);
        }
      })
      .catch((error) => {
        console.error('Error fetching agent stats:', error);
      });
  }, []);

  // Refetch when category changes
  useEffect(() => {
    // Skip on initial mount (we have initial data)
    if (agents.length === 0 && initialAgents.length > 0) return;
    
    setOffset(0);
    setLoading(true);

    const params = new URLSearchParams({
      offset: '0',
      limit: '20',
    });

    if (selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }

    fetch(`/api/agents?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.agents)) {
          setAgents(data.agents);
          setHasMore(data.hasMore || false);
          setOffset(data.nextOffset || (data.agents?.length || 0));
        }
      })
      .catch((error) => {
        console.error('Error fetching agents:', error);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchAgents(false);
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
  }, [hasMore, loading, loadingMore, fetchAgents]);

  // Local fallbacks derived from currently loaded agents
  const derivedCategories = useMemo(() => {
    if (!agents || !Array.isArray(agents)) return [];
    return Array.from(
      new Set(agents.map((a) => a.category).filter(Boolean))
    ).sort() as string[];
  }, [agents]);

  const derivedCategoryCounts = useMemo(() => {
    if (!agents || !Array.isArray(agents)) return {};
    return agents.reduce((acc, agent) => {
      const cat = agent.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [agents]);

  const effectiveTotal = totalCount || (agents?.length || 0);
  const displayCategories =
    categories.length > 0 ? categories : derivedCategories;

  const getCategoryCount = (category: string) =>
    categoryCounts[category] ?? derivedCategoryCounts[category] ?? 0;

  // Agents to display (category filtering is now handled server-side)
  const filteredAgents = useMemo(() => {
    if (!agents || !Array.isArray(agents)) return [];
    return agents;
  }, [agents]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-slate-50">AI Agents</h1>
        <p className="text-lg text-slate-400">
          Specialized assistants that extend GitHub Copilot for complex development tasks
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <span>{effectiveTotal} agents available</span>
          {displayCategories.length > 0 && (
            <>
              <span>•</span>
              <span>{displayCategories.length} categories</span>
            </>
          )}
        </div>
      </header>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400 mb-4" />
          <p className="text-slate-400">Loading agents...</p>
        </div>
      ) : !agents || agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 text-7xl">🤖</div>
          <h2 className="mb-3 text-2xl font-semibold text-slate-200">No Agents Yet</h2>
          <p className="mb-8 max-w-md text-slate-400">
            Check back soon for specialized AI agents to enhance your Copilot experience.
          </p>
        </div>
      ) : (
        <>
          {/* Category Navigation */}
          {displayCategories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'border-purple-500/40 bg-purple-500/20 text-purple-300'
                    : 'border-slate-700/40 bg-slate-800/60 text-slate-300 hover:border-purple-500/40 hover:bg-slate-700/60'
                }`}
              >
                All ({effectiveTotal})
              </button>
              {displayCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'border-purple-500/40 bg-purple-500/20 text-purple-300'
                      : 'border-slate-700/40 bg-slate-800/60 text-slate-300 hover:border-purple-500/40 hover:bg-slate-700/60'
                  }`}
                >
                  {category} ({getCategoryCount(category)})
                </button>
              ))}
            </div>
          )}

          {/* Agents Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
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

          {/* No results message */}
          {filteredAgents.length === 0 && selectedCategory !== 'all' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 text-7xl">🔍</div>
              <h2 className="mb-3 text-2xl font-semibold text-slate-200">No agents found</h2>
              <p className="mb-8 max-w-md text-slate-400">
                No agents in the &quot;{selectedCategory}&quot; category.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}

