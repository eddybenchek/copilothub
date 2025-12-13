import { notFound } from 'next/navigation';
import { Calendar, User, ExternalLink, Github, Download, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToCollectionButton } from '@/components/collections/add-to-collection-button';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';
import { CopyButton } from '@/components/copy-button';

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

  if (!mcp) {
    notFound();
  }

  const voteCount = mcp.votes.reduce((sum, vote) => sum + vote.value, 0);

  // Extract just the repo name and format it
  const rawName = mcp.title;
  const repoName = rawName.includes('/') ? rawName.split('/')[1] : rawName;
  const displayName = repoName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary">{mcp.difficulty}</Badge>
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

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-slate-400 border-y border-slate-800 py-4">
          {mcp.author && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{mcp.author.name || mcp.authorName || 'Anonymous'}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(mcp.createdAt).toLocaleDateString()}</span>
          </div>
          {mcp.category && (
            <Badge variant="outline">{mcp.category}</Badge>
          )}
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
        <div className="mb-8 flex flex-wrap gap-4">
          <CopyButton 
            text={mcp.configExample || JSON.stringify({
              name: mcp.slug,
              command: mcp.installCommand?.split(' ')[0] || 'npx',
              args: mcp.installCommand ? mcp.installCommand.split(' ').slice(1) : [],
            }, null, 2)}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950"
          >
            <Download className="mr-2 h-4 w-4" />
            Add to Cursor
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
              Add this to your Cursor settings (Settings → Features → MCP → Add New MCP Server):
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
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-50">About This MCP Server</h2>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
              {mcp.content}
            </pre>
          </div>
        </div>
      </article>
    </div>
  );
}

