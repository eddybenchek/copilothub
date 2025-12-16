import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ExternalLink, Github, Download, Copy, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToCollectionButton } from '@/components/collections/add-to-collection-button';
import { VoteButton } from '@/components/votes/vote-button';
import { MarkdownPreview } from '@/components/markdown-preview';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';
import { CopyButton } from '@/components/copy-button';
import { getBaseUrl, createMetadata, createStructuredData } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const mcp = await db.mcpServer.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!mcp || mcp.status !== ContentStatus.APPROVED) {
    return {};
  }

  const url = `${getBaseUrl()}/mcps/${slug}`;
  const description = mcp.description || `MCP Server: ${mcp.title}`;

  return createMetadata({
    title: mcp.title,
    description,
    openGraph: {
      title: mcp.title,
      description,
      url,
      type: 'article',
      publishedTime: mcp.createdAt.toISOString(),
      modifiedTime: mcp.updatedAt.toISOString(),
      authors: mcp.author.name ? [mcp.author.name] : undefined,
      tags: [...mcp.tags, ...(mcp.category ? [mcp.category] : [])],
      images: [
        {
          url: `${getBaseUrl()}/og-image.png`,
          width: 1200,
          height: 630,
          alt: mcp.title,
        },
      ],
    },
    twitter: {
      title: mcp.title,
      description,
    },
  });
}

export default async function McpDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Find by slug
  const mcp = await db.mcpServer.findUnique({
    where: { slug },
    include: {
      author: true,
      votes: true,
    },
  });

  if (!mcp || mcp.status !== ContentStatus.APPROVED) {
    notFound();
  }

  const voteCount = mcp.votes.reduce((sum, vote) => sum + vote.value, 0);
  
  const structuredData = createStructuredData('SoftwareApplication', {
    name: mcp.title,
    description: mcp.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    author: {
      '@type': 'Person',
      name: mcp.author.name || 'Anonymous',
    },
    datePublished: mcp.createdAt.toISOString(),
    dateModified: mcp.updatedAt.toISOString(),
    url: `${getBaseUrl()}/mcps/${slug}`,
    keywords: [...mcp.tags, ...(mcp.category ? [mcp.category] : [])].join(', '),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  });

  // Extract just the repo name and format it
  const rawName = mcp.title;
  const repoName = rawName.includes('/') ? rawName.split('/')[1] : rawName;
  const displayName = repoName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

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
            {mcp.category && (
              <Badge variant="outline" className="capitalize">{mcp.category}</Badge>
            )}
            {voteCount > 0 && (
              <Badge variant="outline">↑ {voteCount} votes</Badge>
            )}
            {mcp.featured && (
              <Badge variant="default" className="bg-sky-500/10 text-sky-300 border-sky-500/20">
                Featured
              </Badge>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-50">{displayName}</h1>
          <p className="text-xl text-slate-400">{mcp.description}</p>
        </div>

        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {mcp.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="capitalize">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <VoteButton
            targetId={mcp.id}
            targetType="MCP"
            initialVoteCount={voteCount}
          />
          <CopyButton 
            text={mcp.configExample || JSON.stringify({
              name: mcp.slug,
              command: mcp.installCommand?.split(' ')[0] || 'npx',
              args: mcp.installCommand ? mcp.installCommand.split(' ').slice(1) : [],
            }, null, 2)}
            size="lg"
            variant="primary"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy MCP Config
          </CopyButton>
          {mcp.githubUrl && (
            <Button size="lg" variant="outline" asChild>
              <a href={mcp.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          )}
          {mcp.websiteUrl && (
            <Button size="lg" variant="outline" asChild>
              <a href={mcp.websiteUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Website
              </a>
            </Button>
          )}
          <AddToCollectionButton
            targetId={mcp.id}
            targetType="MCP"
            targetTitle={displayName}
          />
        </div>

        {/* Installation Instructions */}
        {mcp.installCommand && (
          <div className="mb-8 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-50">Installation</h2>
            <div className="rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-300">
              <code>{mcp.installCommand}</code>
            </div>
          </div>
        )}

        {/* Configuration Example */}
        {(mcp.configExample || mcp.installCommand) && (
          <div className="mb-8 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-50">Configuration</h2>
            <p className="mb-3 text-sm text-slate-400">
              Add this to your Copilot settings (Settings → Features → MCP → Add New MCP Server):
            </p>
            <div className="rounded-lg bg-slate-950 p-4 relative">
              <pre className="overflow-x-auto text-xs text-slate-300">
                <code>{mcp.configExample || JSON.stringify({
                  name: mcp.slug,
                  command: mcp.installCommand?.split(' ')[0] || 'npx',
                  args: mcp.installCommand ? mcp.installCommand.split(' ').slice(1) : [],
                }, null, 2)}</code>
              </pre>
              <CopyButton 
                text={mcp.configExample || JSON.stringify({
                  name: mcp.slug,
                  command: mcp.installCommand?.split(' ')[0] || 'npx',
                  args: mcp.installCommand ? mcp.installCommand.split(' ').slice(1) : [],
                }, null, 2)}
                className="absolute top-2 right-2"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mb-8 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-50">About This MCP Server</h2>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8">
            <MarkdownPreview content={mcp.content} />
          </div>
        </div>

        {/* Full Documentation CTA */}
        {mcp.githubUrl && (
          <div className="rounded-lg border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-purple-500/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/20">
              <BookOpen className="h-8 w-8 text-sky-400" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-50">Need More Details?</h3>
            <p className="mb-6 text-slate-400">
              View the complete documentation, examples, changelog, and more on GitHub
            </p>
            <Button size="lg" variant="primary" asChild>
              <a href={mcp.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                View Full Documentation on GitHub
              </a>
            </Button>
          </div>
        )}
      </article>
    </div>
    </>
  );
}

