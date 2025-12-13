import { notFound } from 'next/navigation';
import { Calendar, User, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToCollectionButton } from '@/components/collections/add-to-collection-button';
import { getToolBySlug } from '@/lib/prisma-helpers';

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const voteCount = tool.votes.reduce((sum, vote) => sum + vote.value, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary">{tool.difficulty}</Badge>
            {voteCount > 0 && (
              <Badge variant="outline">↑ {voteCount} votes</Badge>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold">{tool.title}</h1>
          <p className="text-xl text-muted-foreground">{tool.description}</p>
        </div>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border py-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{tool.author.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(tool.createdAt).toLocaleDateString()}</span>
          </div>
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
        <div className="mb-8 flex flex-wrap gap-3">
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
  );
}

