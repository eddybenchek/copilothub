import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Search – CopilotHub',
    description: 'Search through curated AI prompts, workflows, and tools for GitHub Copilot',
    openGraph: {
      title: 'Search – CopilotHub',
      description: 'Search through curated AI prompts, workflows, and tools for GitHub Copilot',
      type: 'website',
    },
  };
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

