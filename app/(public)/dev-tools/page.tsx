import type { Metadata } from 'next';
import Link from 'next/link';
import { DevToolsGrid } from '@/components/dev-tools/dev-tools-grid';

export const metadata: Metadata = {
  title: {
    absolute: 'Dev Tools for AI Developers | CopilotHub',
  },
  description:
    'Explore CopilotHub-native developer tools, including interactive playgrounds and utilities designed to make AI-assisted development workflows faster and more reliable.',
};

export default function DevToolsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Dev Tools for AI Developers
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            First-party CopilotHub utilities for experimenting with prompts, formulas, and data.
            Built to complement the external tools directory with focused, interactive experiences.
          </p>
        </section>
      </div>

      <section className="mx-auto max-w-5xl space-y-8">
        <DevToolsGrid />

        <div className="mt-8 max-w-3xl space-y-4 text-sm text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">Native tools, tuned for CopilotHub</h2>
          <p>
            The Dev Tools section is where we ship opinionated, CopilotHub-native utilities that go
            beyond simple links. Each tool is designed to help you reason about code, prompts, and
            data structures in the same environment where you discover AI content.
          </p>
          <p>
            External tools and integrations still live in the{' '}
            <Link href="/tools" className="text-primary hover:underline">
              Tools directory
            </Link>
            . Think of Dev Tools as your built-in workbench for experimenting with formulas,
            validating inputs, and testing ideas before you roll them into production workflows.
          </p>
        </div>
      </section>
    </div>
  );
}

