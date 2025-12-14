import { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import { getBaseUrl } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'AI Prompts - CopilotHub',
  description: 'Browse curated AI prompts for GitHub Copilot. Find prompts for code review, debugging, documentation, refactoring, and more.',
  openGraph: {
    title: 'AI Prompts - CopilotHub',
    description: 'Browse curated AI prompts for GitHub Copilot. Find prompts for code review, debugging, documentation, refactoring, and more.',
    url: `${getBaseUrl()}/prompts`,
  },
});

export default function PromptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

