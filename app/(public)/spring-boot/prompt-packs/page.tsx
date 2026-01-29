import { Metadata } from 'next';
import { getBaseUrl, createMetadata } from '@/lib/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { getAllPromptPacks } from '@/lib/hub-indexes/spring-boot-index';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export const metadata: Metadata = createMetadata({
  title: {
    absolute: 'Spring Boot Copilot Prompt Packs | CopilotHub',
  },
  description: 'Ready-to-use Copilot prompt packs for Spring Boot migrations: Jakarta refactor, Security migration, Hibernate/JPA, Testing, and Build tools.',
  alternates: {
    canonical: `${getBaseUrl()}/spring-boot/prompt-packs`,
  },
});

export default async function PromptPacksIndexPage() {
  const promptPacks = getAllPromptPacks();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Spring Boot Hub', href: '/spring-boot' },
    { label: 'Prompt Packs', href: '/spring-boot/prompt-packs' },
  ];

  return (
    <>
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Copilot Prompt Packs for Spring Boot
          </h1>
        </div>
        <p className="mb-8 text-lg text-muted-foreground">
          Copy-ready prompt packs designed for GitHub Copilot to help with Spring Boot migrations.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promptPacks.map((pack) => (
            <Card key={pack.key} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{pack.title}</CardTitle>
                {pack.description && (
                  <CardDescription className="mt-2">{pack.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pack.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button asChild className="w-full">
                  <Link href={`/spring-boot/prompt-packs/${pack.key}`}>
                    View pack
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
