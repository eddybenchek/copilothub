import { Metadata } from 'next';
import { Suspense } from 'react';
import { getSpringBootContent, getSpringBootStats, getFeaturedPlaybooks } from '@/lib/hub-helpers';
import { generateSpringBootHubStructuredData } from '@/lib/structured-data/spring-boot-hub';
import { getBaseUrl, createMetadata } from '@/lib/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { SpringBootHubClient } from './spring-boot-hub-client';

export const metadata: Metadata = createMetadata({
  title: {
    absolute: 'Spring Boot Migration Playbooks, Prompts & Copilot Workflows | CopilotHub',
  },
  description: 'Production-safe Spring Boot migrations (2→3, 3→4), upgrade checklists, Copilot prompts, and step-by-step workflows for teams.',
  alternates: {
    canonical: `${getBaseUrl()}/spring-boot`,
  },
  openGraph: {
    title: 'Spring Boot Migration Hub',
    description: 'Production-safe Spring Boot migrations (2→3, 3→4), upgrade checklists, Copilot prompts, and step-by-step workflows for teams.',
    url: `${getBaseUrl()}/spring-boot`,
    type: 'website',
  },
  twitter: {
    title: 'Spring Boot Migration Hub',
    description: 'Production-safe Spring Boot migrations (2→3, 3→4), upgrade checklists, Copilot prompts, and step-by-step workflows for teams.',
  },
});

export default async function SpringBootHubPage() {
  const [content, stats, featuredPlaybooks] = await Promise.all([
    getSpringBootContent(),
    getSpringBootStats(),
    getFeaturedPlaybooks(),
  ]);

  // Generate structured data
  const structuredData = generateSpringBootHubStructuredData(content);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Spring Boot Hub', href: '/spring-boot' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.collectionPage),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.breadcrumbs),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.featuredPlaybooksList),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.migrationsList),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.errorsList),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData.promptPacksList),
        }}
      />
      
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <SpringBootHubClient 
          content={content}
          stats={stats}
          featuredPlaybooks={featuredPlaybooks}
        />
      </Suspense>
    </>
  );
}
