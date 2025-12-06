'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar, User, ArrowRight } from 'lucide-react';
import type { MigrationGuide } from '@prisma/client';

type MigrationCardProps = {
  migration: MigrationGuide & {
    author?: { name: string | null } | null;
    votes?: { value: number }[];
  };
};

export function MigrationCard({ migration }: MigrationCardProps) {
  const voteCount = migration.votes?.reduce((sum, vote) => sum + vote.value, 0) ?? 0;

  return (
    <div className="animate-fadeUp">
      <Link href={`/migrations/${migration.slug}`}>
        <Card className="h-full transition duration-150 hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-sky-500/40 cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg line-clamp-2">{migration.title}</CardTitle>
              {voteCount > 0 && (
                <span className="shrink-0 inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200">
                  ↑ {voteCount}
                </span>
              )}
            </div>
            <CardDescription className="line-clamp-2">{migration.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* From → To */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{migration.fromStack}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-medium">{migration.toStack}</span>
                <span className="text-slate-600">•</span>
                <span>{migration.category}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {migration.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
                {migration.tags.length > 3 && (
                  <span className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200">
                    +{migration.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {migration.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{migration.author.name || 'Anonymous'}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(migration.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="ml-auto inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200">
                  {migration.difficulty}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

