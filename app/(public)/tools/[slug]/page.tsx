import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToCollectionButton } from '@/components/collections/add-to-collection-button';
import { VoteButton } from '@/components/votes/vote-button';
import { getToolBySlug } from '@/lib/prisma-helpers';
import { getBaseUrl, createMetadata, createStructuredData } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    return {};
  }

  const url = `${getBaseUrl()}/tools/${slug}`;
  const description = tool.description || `Development tool: ${tool.title}`;

  return createMetadata({
    title: tool.title,
    description,
    openGraph: {
      title: tool.title,
      description,
      url,
      type: 'article',
      publishedTime: tool.createdAt.toISOString(),
      modifiedTime: tool.updatedAt.toISOString(),
      authors: tool.author.name ? [tool.author.name] : undefined,
      tags: tool.tags,
      images: [
        {
          url: `${getBaseUrl()}/og-image.png`,
          width: 1200,
          height: 630,
          alt: tool.title,
        },
      ],
    },
    twitter: {
      title: tool.title,
      description,
    },
  });
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const voteCount = tool.votes.reduce((sum, vote) => sum + vote.value, 0);
  const structuredData = createStructuredData('SoftwareApplication', {
    name: tool.title,
    description: tool.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    author: {
      '@type': 'Person',
      name: tool.author.name || 'Anonymous',
    },
    datePublished: tool.createdAt.toISOString(),
    dateModified: tool.updatedAt.toISOString(),
    url: `${getBaseUrl()}/tools/${slug}`,
    keywords: tool.tags.join(', '),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-12">
        <article className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            {voteCount > 0 && (
              <Badge variant="outline">↑ {voteCount} votes</Badge>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold">{tool.title}</h1>
          <p className="text-xl text-muted-foreground">{tool.description}</p>
        </div>

        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <VoteButton
            targetId={tool.id}
            targetType="TOOL"
            initialVoteCount={voteCount}
          />
          {tool.url && (
            <Button asChild>
              <a href={tool.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Tool Website
              </a>
            </Button>
          )}
          <AddToCollectionButton
            targetId={tool.id}
            targetType="TOOL"
            targetTitle={tool.title}
          />
        </div>

        {/* Content */}
        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">About This Tool</h2>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/80">
              {tool.content}
            </pre>
          </div>
        </div>
      </article>
    </div>
    </>
  );
}

