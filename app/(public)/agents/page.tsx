import { AgentsClient } from './agents-client';
import { getAgentsPaginated, getAgentsStats } from '@/lib/prisma-helpers';
import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/metadata';

interface AgentsPageProps {
  searchParams: Promise<{
    category?: string;
    query?: string;
    tags?: string;
  }>;
}

export async function generateMetadata({ searchParams }: AgentsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = params.category || params.query || params.tags;
  const baseUrl = getBaseUrl();
  const baseAgentsUrl = `${baseUrl}/agents`;

  // If there are filters, add canonical tag pointing to base URL
  if (hasFilters) {
    return {
      title: 'AI Agents - GitHub Copilot Agents Directory',
      description: 'Browse specialized AI agents for GitHub Copilot to enhance your development workflow',
      alternates: {
        canonical: baseAgentsUrl,
      },
      robots: {
        index: false, // Don't index filtered views
        follow: true,
      },
    };
  }

  // Base page - can be indexed
  return {
    title: 'AI Agents - GitHub Copilot Agents Directory',
    description: 'Browse specialized AI agents for GitHub Copilot to enhance your development workflow',
    alternates: {
      canonical: baseAgentsUrl,
    },
  };
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
