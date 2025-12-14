import { Metadata } from 'next';

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export function getBaseUrl(): string {
  return baseUrl;
}

export function createMetadata(overrides: Partial<Metadata>): Metadata {
  return {
    ...overrides,
    openGraph: {
      ...overrides.openGraph,
      siteName: 'CopilotHub',
      locale: 'en_US',
      type: 'website',
      url: overrides.openGraph?.url || baseUrl,
    },
    twitter: {
      card: 'summary_large_image',
      ...overrides.twitter,
    },
  };
}

export function createStructuredData(type: string, data: Record<string, any>) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
}

