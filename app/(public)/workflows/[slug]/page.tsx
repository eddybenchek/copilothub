import { notFound } from 'next/navigation';
import { Calendar, User, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/copy-button';
import { getWorkflowBySlug } from '@/lib/prisma-helpers';

export default async function WorkflowDetailPage({ params }: { params: { slug: string } }) {
  const workflow = await getWorkflowBySlug(params.slug);

  if (!workflow) {
    notFound();
  }

  const voteCount = workflow.votes.reduce((sum, vote) => sum + vote.value, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary">{workflow.difficulty}</Badge>
            {voteCount > 0 && (
              <Badge variant="outline">↑ {voteCount} votes</Badge>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold">{workflow.title}</h1>
          <p className="text-xl text-muted-foreground">{workflow.description}</p>
        </div>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border py-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{workflow.author.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {workflow.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Content */}
        <div className="mb-8 prose prose-invert max-w-none">
          <p className="text-foreground/80">{workflow.content}</p>
        </div>

        {/* Steps */}
        <div className="rounded-lg border border-border bg-muted/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Workflow Steps</h2>
            <Badge variant="secondary">{workflow.steps.length} steps</Badge>
          </div>
          <ol className="space-y-4">
            {workflow.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {index + 1}
                </div>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </article>
    </div>
  );
}

