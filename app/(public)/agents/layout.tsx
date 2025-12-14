import { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import { getBaseUrl } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'AI Agents - CopilotHub',
  description: 'Browse specialized AI agents for GitHub Copilot to enhance your development workflow. Find agents for testing, security, architecture, and more.',
  openGraph: {
    title: 'AI Agents - CopilotHub',
    description: 'Browse specialized AI agents for GitHub Copilot to enhance your development workflow.',
    url: `${getBaseUrl()}/agents`,
  },
});

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

