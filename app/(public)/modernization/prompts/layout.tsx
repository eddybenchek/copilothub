import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/metadata';

export const metadata: Metadata = {
  title: {
    absolute: 'Modernization Prompts - CopilotHub', // Use absolute to prevent template suffix
  },
  description: 'High-signal prompt patterns for GitHub Copilot to refactor, upgrade, and clean up code at scale. Safely modernize your legacy systems with AI-powered development.',
  alternates: {
    canonical: `${getBaseUrl()}/modernization/prompts`,
  },
};

export default function ModernizationPromptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
