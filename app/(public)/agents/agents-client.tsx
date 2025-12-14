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
  agents?: AgentWithRelations[];
}

export function AgentsClient({ agents: initialAgents }: AgentsClientProps) {
  const [agents, setAgents] = useState<AgentWithRelations[]>(() => {
    return Array.isArray(initialAgents) ? initialAgents : [];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(!initialAgents);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchAgents = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/agents?offset=${currentOffset}&limit=20`);
      
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
        setAgents(prev => Array.isArray(prev) ? [...prev, ...data.agents] : data.agents);
      }
      
      setHasMore(data.hasMore || false);
      setOffset(data.nextOffset || currentOffset + data.agents.length);
    } catch (error) {
      console.error('Error fetching agents:', error);
      if (reset) {
        setAgents([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset]);

  useEffect(() => {
    if (!initialAgents) {
      fetchAgents(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loading, loadingMore, fetchAgents]);

  // Get categories
  const categories = useMemo(() => {
    if (!agents || !Array.isArray(agents)) return [];
    return Array.from(
      new Set(agents.map((a) => a.category).filter(Boolean))
    ).sort() as string[];
  }, [agents]);

  // Count agents per category
  const categoryCounts = useMemo(() => {
    if (!agents || !Array.isArray(agents)) return {};
    return agents.reduce((acc, agent) => {
      const cat = agent.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [agents]);

  // Filter agents by category
  const filteredAgents = useMemo(() => {
    if (!agents || !Array.isArray(agents)) return [];
    if (selectedCategory === 'all') return agents;
    return agents.filter((agent) => agent.category === selectedCategory);
  }, [agents, selectedCategory]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-slate-50">AI Agents</h1>
        <p className="text-lg text-slate-400">
          Specialized assistants that extend GitHub Copilot for complex development tasks
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <span>{agents?.length || 0} agents available</span>
          {categories.length > 0 && (
            <>
              <span>•</span>
              <span>{categories.length} categories</span>
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
          {categories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'border-purple-500/40 bg-purple-500/20 text-purple-300'
                    : 'border-slate-700/40 bg-slate-800/60 text-slate-300 hover:border-purple-500/40 hover:bg-slate-700/60'
                }`}
              >
                All ({agents?.length || 0})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'border-purple-500/40 bg-purple-500/20 text-purple-300'
                      : 'border-slate-700/40 bg-slate-800/60 text-slate-300 hover:border-purple-500/40 hover:bg-slate-700/60'
                  }`}
                >
                  {category} ({categoryCounts[category]})
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

