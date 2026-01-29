'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code } from 'lucide-react';

export function RelatedMigrationHubs() {
  const relatedHubs = [
    {
      title: 'JavaScript → TypeScript Migration',
      description: 'Incrementally migrate JavaScript codebases to TypeScript with Copilot prompts and workflows',
      href: '/prompts/migrate-js-to-ts',
      tags: ['TypeScript', 'JavaScript', 'Migration'],
    },
    {
      title: 'Next.js Pages → App Router',
      description: 'Migrate Next.js projects from Pages Router to App Router with step-by-step guides',
      href: '/prompts/nextjs-pages-to-app-router',
      tags: ['Next.js', 'React', 'Migration'],
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Code className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">Related Migration Hubs</h2>
      </div>
      <p className="mb-6 text-muted-foreground">
        Explore other production-grade migration guides for modernizing your codebase
      </p>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {relatedHubs.map((hub) => (
          <Card key={hub.title} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">{hub.title}</CardTitle>
              <CardDescription className="mt-2">{hub.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {hub.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={hub.href}>
                  Explore migration
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
