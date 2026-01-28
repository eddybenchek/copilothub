'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Sparkles, Zap, Calendar } from 'lucide-react';
import type { SpringBootStats } from '@/lib/hub-helpers';

interface SpringBootHeroProps {
  stats: SpringBootStats;
}

export function SpringBootHero({ stats }: SpringBootHeroProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left: Title and CTAs */}
        <div className="flex flex-col justify-center order-2 lg:order-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Spring Boot Hub
          </h1>
          <p className="mt-3 sm:mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Playbooks, Copilot prompts, and workflows for upgrading Spring Boot apps safely.
          </p>
          
          <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:flex-wrap sm:items-center max-w-full">
            <Button size="lg" className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap" asChild>
              <Link href="/instructions/spring-boot-2-to-3-migration" className="inline-flex items-center justify-center sm:justify-start">
                Start with 2 → 3 (Jakarta)
                <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap" asChild>
              <a href="#content" className="inline-flex items-center justify-center sm:justify-start">
                Browse all Spring Boot content
              </a>
            </Button>
          </div>
        </div>

        {/* Right: Stat tiles */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 order-1 lg:order-2 min-w-0">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-primary/10 p-1.5 sm:p-2 flex-shrink-0">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.playbooks}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Playbooks</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-primary/10 p-1.5 sm:p-2 flex-shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.prompts}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Prompts</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-primary/10 p-1.5 sm:p-2 flex-shrink-0">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-foreground truncate">{stats.workflows}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Workflows</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-primary/10 p-1.5 sm:p-2 flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  {formatDate(stats.lastUpdated)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Last updated</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="mt-6 sm:mt-8 flex flex-wrap gap-2">
        {[
          '2 → 3 (Jakarta)',
          '3 → 4',
          'Spring Security',
          'Hibernate',
          'Testing',
          'Maven',
          'Gradle',
          'Observability',
        ].map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-border bg-card px-2.5 py-1 sm:px-3 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            {chip}
          </span>
        ))}
      </div>
    </section>
  );
}
