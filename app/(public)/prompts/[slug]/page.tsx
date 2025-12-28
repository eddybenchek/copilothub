import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/copy-button';
import { AddToCollectionButton } from '@/components/collections/add-to-collection-button';
import { VoteButton } from '@/components/votes/vote-button';
import { ContentViewTracker } from '@/components/analytics/content-view-tracker';
import { getPromptBySlug } from '@/lib/prisma-helpers';
import { getBaseUrl, createMetadata, createStructuredData } from '@/lib/metadata';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);

  if (!prompt) {
    return {};
  }

  const url = `${getBaseUrl()}/prompts/${slug}`;
  let description = prompt.description || `${prompt.title} - AI prompt for GitHub Copilot`;

  // Check for duplicate descriptions and make unique
  const duplicatePromptsDesc = await db.prompt.findMany({
    where: {
      description: prompt.description || `${prompt.title} - AI prompt for GitHub Copilot`,
      status: ContentStatus.APPROVED,
      id: { not: prompt.id },
    },
    select: { slug: true },
    take: 1,
  });

  // If duplicates exist, append title to make description unique (but keep it concise)
  if (duplicatePromptsDesc.length > 0) {
    if (prompt.description && prompt.description.length < 100) {
      description = `${prompt.description} (${prompt.title})`;
    } else {
      description = `${prompt.title} - AI prompt for GitHub Copilot`;
    }
  }

  // Check if there are other prompts with the same title to make title unique
  const duplicatePrompts = await db.prompt.findMany({
    where: {
      title: prompt.title,
      status: ContentStatus.APPROVED,
      id: { not: prompt.id },
    },
    select: { slug: true },
    take: 1,
  });

  // If duplicates exist, add a unique identifier to the title
  let uniqueTitle = prompt.title;
  if (duplicatePrompts.length > 0) {
    // Add slug-based identifier to make it unique
    const slugIdentifier = slug.includes('workflow-') ? 'Workflow' : 
                           slug.includes('upgrade-') ? 'Upgrade' :
                           slug.split('-').slice(-2).join(' ').replace(/\b\w/g, l => l.toUpperCase());
    uniqueTitle = `${prompt.title} (${slugIdentifier})`;
  }

  // Add context to title tag to differentiate from H1
  // H1 will be just the prompt title, but title tag should be SEO-optimized
  // Ensure minimum 30 characters for SEO (recommended 30-60)
  let seoTitle = `${uniqueTitle} - AI Prompt | CopilotHub`;
  if (seoTitle.length < 30) {
    // If still too short, add more descriptive context
    seoTitle = `${uniqueTitle} - AI Prompt for GitHub Copilot | CopilotHub`;
  }

  return createMetadata({
    title: {
      absolute: seoTitle,
    },
    description,
    openGraph: {
      title: prompt.title,
      description,
      url,
      type: 'article',
      publishedTime: prompt.createdAt.toISOString(),
      modifiedTime: prompt.updatedAt.toISOString(),
      authors: prompt.author.name ? [prompt.author.name] : undefined,
      tags: prompt.tags,
      images: [
        {
          url: `${getBaseUrl()}/og-image.png`,
          width: 1200,
          height: 630,
          alt: prompt.title,
        },
      ],
    },
    twitter: {
      title: prompt.title,
      description,
    },
  });
}

export default async function PromptDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);

  if (!prompt) {
    notFound();
  }

  const voteCount = prompt.votes.reduce((sum, vote) => sum + vote.value, 0);
  const structuredData = createStructuredData('Article', {
    headline: prompt.title,
    description: prompt.description,
    author: {
      '@type': 'Person',
      name: prompt.author.name || 'Anonymous',
    },
    datePublished: prompt.createdAt.toISOString(),
    dateModified: prompt.updatedAt.toISOString(),
    url: `${getBaseUrl()}/prompts/${slug}`,
    keywords: prompt.tags.join(', '),
  });

  return (
    <>
      <ContentViewTracker type="prompt" id={prompt.id} title={prompt.title} />
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
          <h1 className="mb-4 text-4xl font-bold">{prompt.title}</h1>
          <p className="text-xl text-muted-foreground">{prompt.description}</p>
        </div>

        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {prompt.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <VoteButton
            targetId={prompt.id}
            targetType="PROMPT"
            initialVoteCount={voteCount}
          />
          <CopyButton text={prompt.content} contentType="prompt" contentId={prompt.id} />
          <AddToCollectionButton
            targetId={prompt.id}
            targetType="PROMPT"
            targetTitle={prompt.title}
          />
        </div>

        {/* Prompt Content */}
        <div className="mb-4 rounded-lg border border-border bg-muted/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Prompt</h2>
            <CopyButton text={prompt.content} contentType="prompt" contentId={prompt.id} />
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {prompt.content}
          </pre>
        </div>
      </article>
    </div>
    </>
  );
}

