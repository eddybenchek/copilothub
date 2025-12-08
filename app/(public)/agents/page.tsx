import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';
import { AgentsClient } from './agents-client';

export const metadata = {
  title: 'AI Agents - GitHub Copilot Agents Directory',
  description: 'Browse specialized AI agents for GitHub Copilot to enhance your development workflow',
};

export default async function AgentsPage() {
  const agents = await db.agent.findMany({
    where: { status: ContentStatus.APPROVED },
    include: {
      author: true,
      votes: true,
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return <AgentsClient agents={agents} />;
}
