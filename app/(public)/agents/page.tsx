import { AgentsClient } from './agents-client';
import { getAgentsPaginated, getAgentsStats } from '@/lib/prisma-helpers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Agents - GitHub Copilot Agents Directory',
  description: 'Browse specialized AI agents for GitHub Copilot to enhance your development workflow',
};

interface AgentsPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const params = await searchParams;
  const category = params.category || 'all';

  // Fetch initial data on server
  const [agentsData, statsData] = await Promise.all([
    getAgentsPaginated({
      offset: 0,
      limit: 20,
      category: category !== 'all' ? category : undefined,
    }),
    getAgentsStats(),
  ]);

  return (
    <AgentsClient
      initialAgents={agentsData.agents}
      initialStats={statsData}
      initialHasMore={agentsData.hasMore}
      initialOffset={agentsData.nextOffset || 0}
    />
  );
}
