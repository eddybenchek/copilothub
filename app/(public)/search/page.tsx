import { Suspense } from 'react';
import { SearchPageContent } from './search-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search - CopilotHub',
  description: 'Search for prompts, instructions, agents, tools, and MCPs for your AI development needs.',
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-20">
        <section>
          <h1 className="mb-6 text-3xl font-semibold text-slate-50">Search</h1>
          <div className="animate-pulse">
            <div className="h-12 w-full rounded-lg bg-slate-800"></div>
          </div>
        </section>
      </main>
    }>
      <SearchPageContent searchParams={searchParams} />
    </Suspense>
  );
}
