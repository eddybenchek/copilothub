import Link from 'next/link';
import { InstructionsClient } from '@/components/instructions/instructions-client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <>
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-6">
        <h2 className="mb-2 text-2xl font-bold text-slate-50">Developer utilities</h2>
        <p className="mb-6 text-slate-400">
          Test formulas, generate types, and experiment with code.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dev-tools/power-fx-playground" className="group">
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-slate-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  Power Fx Playground
                </CardTitle>
                <CardDescription>
                  Test Power Apps formulas instantly with our interactive playground.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/dev-tools/json-to-typescript" className="group">
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-slate-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  JSON → TypeScript generator
                </CardTitle>
                <CardDescription>
                  Convert JSON into TypeScript interfaces instantly with our free generator.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/dev-tools" className="group">
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-slate-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  JS → TypeScript converter
                </CardTitle>
                <CardDescription>
                  Convert JavaScript to TypeScript. (Coming soon)
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>
      <InstructionsClient
        initialInstructions={instructionsData.instructions}
        initialStats={statsData}
        initialHasMore={instructionsData.hasMore}
        initialOffset={instructionsData.nextOffset || 0}
      />
    </>
  );
}
