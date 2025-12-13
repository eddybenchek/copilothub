import { notFound } from 'next/navigation';
import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/copy-button';
import { AddToCollectionButton } from '@/components/collections/add-to-collection-button';
import { getPromptBySlug } from '@/lib/prisma-helpers';

export default async function PromptDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);

  if (!prompt) {
    notFound();
  }

  const voteCount = prompt.votes.reduce((sum, vote) => sum + vote.value, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary">{prompt.difficulty}</Badge>
            {voteCount > 0 && (
              <Badge variant="outline">↑ {voteCount} votes</Badge>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold">{prompt.title}</h1>
          <p className="text-xl text-muted-foreground">{prompt.description}</p>
        </div>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border py-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{prompt.author.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
          </div>
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
        <div className="mb-8 flex flex-wrap gap-3">
          <CopyButton text={prompt.content} />
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
            <CopyButton text={prompt.content} />
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {prompt.content}
          </pre>
        </div>
      </article>
    </div>
  );
}

