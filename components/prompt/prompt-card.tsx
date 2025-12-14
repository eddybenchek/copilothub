'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CopyButton } from '@/components/copy-button';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import type { PromptWithAuthor } from '@/lib/types';

interface PromptCardProps {
  prompt: PromptWithAuthor;
}

export function PromptCard({ prompt }: PromptCardProps) {
  // Support both voteCount (from optimized API) and votes array (from legacy)
  const voteCount = (prompt as any).voteCount !== undefined 
    ? (prompt as any).voteCount 
    : prompt.votes.reduce((sum, vote) => sum + vote.value, 0);

  return (
    <div className="animate-fadeUp">
      <Link href={`/prompts/${prompt.slug}`}>
        <Card className="h-full transition duration-150 hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-sky-500/40 cursor-pointer relative">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
              <div className="flex items-center gap-2 shrink-0">
                {voteCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200">
                    ↑ {voteCount}
                  </span>
                )}
                <div onClick={(e) => e.preventDefault()} className="relative z-10">
                  <FavoriteButton targetId={prompt.id} targetType="PROMPT" size="sm" />
                </div>
              </div>
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
              <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
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

