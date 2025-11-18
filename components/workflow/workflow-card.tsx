'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar, User, List } from 'lucide-react';
import type { WorkflowWithAuthor } from '@/lib/types';

interface WorkflowCardProps {
  workflow: WorkflowWithAuthor;
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const voteCount = workflow.votes.reduce((sum, vote) => sum + vote.value, 0);

  return (
    <div className="animate-fadeUp">
      <Link href={`/workflows/${workflow.slug}`}>
        <Card className="h-full transition duration-150 hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-sky-500/40 cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg line-clamp-2">{workflow.title}</CardTitle>
              {voteCount > 0 && (
                <span className="shrink-0 inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200">
                  ↑ {voteCount}
                </span>
              )}
            </div>
            <CardDescription className="line-clamp-2">{workflow.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Step count */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <List className="h-4 w-4" />
                <span>{workflow.steps.length} steps</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {workflow.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
                {workflow.tags.length > 3 && (
                  <span className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200">
                    +{workflow.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{workflow.author.name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200">
                  {workflow.difficulty}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

