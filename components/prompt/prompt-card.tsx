'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { CopyButton } from '@/components/copy-button';
import type { PromptWithAuthor } from '@/lib/types';

interface PromptCardProps {
  prompt: PromptWithAuthor;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const voteCount = prompt.votes.reduce((sum, vote) => sum + vote.value, 0);

  return (
    <div className="animate-fadeUp">
      <Link href={`/prompts/${prompt.slug}`}>
        <Card className="h-full transition duration-150 hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-sky-500/40 cursor-pointer relative">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
              {voteCount > 0 && (
                <span className="shrink-0 inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200">
                  ↑ {voteCount}
                </span>
              )}
            </div>
            <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
                {prompt.tags.length > 3 && (
                  <span className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200">
                    +{prompt.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{prompt.author.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200">
                    {prompt.difficulty}
                  </span>
                </div>
                <div onClick={(e) => e.preventDefault()}>
                  <CopyButton text={prompt.content} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

