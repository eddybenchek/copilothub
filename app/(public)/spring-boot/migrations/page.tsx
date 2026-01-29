import { Metadata } from 'next';
import { getBaseUrl, createMetadata } from '@/lib/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { getAllMigrations } from '@/lib/hub-indexes/spring-boot-index';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = createMetadata({
  title: {
    absolute: 'Spring Boot Migration Guides | CopilotHub',
  },
  description: 'Comprehensive migration guides for Spring Boot 2→3, 3→4, Spring Security 6, Hibernate 6, and more.',
  alternates: {
    canonical: `${getBaseUrl()}/spring-boot/migrations`,
  },
});

export default async function MigrationsIndexPage() {
  const migrations = getAllMigrations();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Spring Boot Hub', href: '/spring-boot' },
    { label: 'Migrations', href: '/spring-boot/migrations' },
  ];

  return (
    <>
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
          Spring Boot Migration Guides
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Step-by-step migration guides for upgrading Spring Boot applications safely.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {migrations.map((migration) => {
            const playbookHref = migration.anchor
              ? `/instructions/${migration.primaryInstructionSlug}#${migration.anchor}`
              : `/instructions/${migration.primaryInstructionSlug}`;

            return (
              <Card key={migration.key} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{migration.title}</CardTitle>
                  <CardDescription className="mt-2">{migration.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {migration.tags.slice(0, 3).map((tag) => (
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
                    <Link href={`/spring-boot/migrations/${migration.key}`}>
                      View guide
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
