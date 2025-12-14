import { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import { getBaseUrl } from '@/lib/metadata';

export const metadata: Metadata = createMetadata({
  title: 'Copilot Instructions - CopilotHub',
  description: 'Comprehensive coding standards and best practices that apply to specific file patterns. Persistent instructions for GitHub Copilot.',
  openGraph: {
    title: 'Copilot Instructions - CopilotHub',
    description: 'Comprehensive coding standards and best practices for GitHub Copilot.',
    url: `${getBaseUrl()}/instructions`,
  },
});

export default function InstructionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

