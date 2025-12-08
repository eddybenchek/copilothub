'use client';

import { useState, useMemo } from 'react';
import { AgentCard } from '@/components/agents/agent-card';
import { Agent, User, Vote } from '@prisma/client';

type AgentWithRelations = Agent & {
  author: User;
  votes: Vote[];
};

interface AgentsClientProps {
  agents: AgentWithRelations[];
}

export function AgentsClient({ agents }: AgentsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get categories
  const categories = useMemo(() => {
    return Array.from(
      new Set(agents.map((a) => a.category).filter(Boolean))
    ).sort() as string[];
  }, [agents]);

  // Count agents per category
  const categoryCounts = useMemo(() => {
    return agents.reduce((acc, agent) => {
      const cat = agent.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [agents]);

  // Filter agents by category
  const filteredAgents = useMemo(() => {
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
          <span>{agents.length} agents available</span>
          {categories.length > 0 && (
            <>
              <span>•</span>
              <span>{categories.length} categories</span>
            </>
          )}
        </div>
      </header>

      {agents.length === 0 ? (
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
                All ({agents.length})
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

          {/* No results message */}
          {filteredAgents.length === 0 && (
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

