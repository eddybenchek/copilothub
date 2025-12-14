import { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import { getBaseUrl } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'MCP Servers - CopilotHub',
  description: 'Browse Model Context Protocol (MCP) servers for GitHub Copilot. Connect to databases, APIs, and services to extend Copilot capabilities.',
  openGraph: {
    title: 'MCP Servers - CopilotHub',
    description: 'Browse Model Context Protocol (MCP) servers for GitHub Copilot.',
    url: `${getBaseUrl()}/mcps`,
  },
});

export default function McpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

