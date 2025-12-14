import { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import { getBaseUrl } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'Development Tools - CopilotHub',
  description: 'Discover essential tools and extensions that enhance your AI-powered development workflow with GitHub Copilot.',
  openGraph: {
    title: 'Development Tools - CopilotHub',
    description: 'Discover essential tools and extensions that enhance your AI-powered development workflow.',
    url: `${getBaseUrl()}/tools`,
  },
});

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

