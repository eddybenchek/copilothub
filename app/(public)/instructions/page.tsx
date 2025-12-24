import { InstructionsClient } from '@/components/instructions/instructions-client';
import { getInstructionsPaginated, getInstructionsStats } from '@/lib/prisma-helpers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Copilot Instructions - CopilotHub',
  description: 'Comprehensive coding standards and best practices that apply to specific file patterns for GitHub Copilot.',
};

export default async function InstructionsPage() {
  // Fetch initial data on server
  const [instructionsData, statsData] = await Promise.all([
    getInstructionsPaginated({
      offset: 0,
      limit: 20,
    }),
    getInstructionsStats(),
  ]);

  return (
    <InstructionsClient
      initialInstructions={instructionsData.instructions}
      initialStats={statsData}
      initialHasMore={instructionsData.hasMore}
      initialOffset={instructionsData.nextOffset || 0}
    />
  );
}
