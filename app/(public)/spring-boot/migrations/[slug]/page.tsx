import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBaseUrl, createMetadata } from '@/lib/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { getMigrationByKey, getAllMigrations } from '@/lib/hub-indexes/spring-boot-index';
import { getSpringBootContent } from '@/lib/hub-helpers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { PromptCard } from '@/components/prompt/prompt-card';

interface MigrationPageProps {
  params: Promise<{ slug: string }>;
}

function generateMigrationStructuredData(migration: ReturnType<typeof getMigrationByKey>) {
  if (!migration) return null;
  
  const baseUrl = getBaseUrl();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: migration.title,
    description: migration.description,
    url: `${baseUrl}/spring-boot/migrations/${migration.key}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/spring-boot/migrations/${migration.key}`,
    },
    about: {
      '@type': 'Thing',
      name: 'Spring Boot Migration',
    },
  };
}

export async function generateStaticParams() {
  const migrations = getAllMigrations();
  return migrations.map((migration) => ({
    slug: migration.key,
  }));
}

export async function generateMetadata({ params }: MigrationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const migration = getMigrationByKey(slug);

  if (!migration) {
    return createMetadata({
      title: { absolute: 'Migration Not Found | CopilotHub' },
    });
  }

  return createMetadata({
    title: {
      absolute: `${migration.title} Migration Guide | CopilotHub`,
    },
    description: migration.description,
    alternates: {
      canonical: `${getBaseUrl()}/spring-boot/migrations/${slug}`,
    },
  });
}

export default async function MigrationPage({ params }: MigrationPageProps) {
  const { slug } = await params;
  const migration = getMigrationByKey(slug);

  if (!migration) {
    notFound();
  }

  const content = await getSpringBootContent();
  
  // Filter related prompts
  const relatedPrompts = content.prompts.filter((p) =>
    migration.tags.some((tag) => p.tags.some((pt) => pt.toLowerCase().includes(tag.toLowerCase())))
  );

  const playbookHref = migration.anchor
    ? `/instructions/${migration.primaryInstructionSlug}#${migration.anchor}`
    : `/instructions/${migration.primaryInstructionSlug}`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Spring Boot Hub', href: '/spring-boot' },
    { label: 'Migrations', href: '/spring-boot/migrations' },
    { label: migration.title, href: `/spring-boot/migrations/${slug}` },
  ];

  const structuredData = generateMigrationStructuredData(migration);

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
          {migration.title}
        </h1>
        <p className="mb-6 text-lg text-muted-foreground">{migration.description}</p>

        <div className="mb-8 flex flex-wrap gap-2">
          {migration.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-8">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Migration Playbook</CardTitle>
              <CardDescription>Complete step-by-step guide</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={playbookHref}>
                  Open playbook
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {migration.related?.promptPackKey && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Related Prompt Packs</h2>
            <Button variant="outline" asChild>
              <Link href={`/spring-boot/prompt-packs/${migration.related.promptPackKey}`}>
                View prompt pack
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {relatedPrompts.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Related Copilot Prompts</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPrompts.slice(0, 6).map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/spring-boot/migrations">
              ← Back to all migrations
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
