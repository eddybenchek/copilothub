import { Metadata } from 'next';
import { getBaseUrl, createMetadata } from '@/lib/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { getAllErrors } from '@/lib/hub-indexes/spring-boot-index';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = createMetadata({
  title: {
    absolute: 'Spring Boot Migration Errors & Solutions | CopilotHub',
  },
  description: 'Common Spring Boot migration errors and their solutions. Fix WebSecurityConfigurerAdapter, Jakarta imports, Hibernate queries, and more.',
  alternates: {
    canonical: `${getBaseUrl()}/spring-boot/errors`,
  },
});

export default async function ErrorsIndexPage() {
  const errors = getAllErrors();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Spring Boot Hub', href: '/spring-boot' },
    { label: 'Errors', href: '/spring-boot/errors' },
  ];

  return (
    <>
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-orange-500" />
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Common Spring Boot Migration Errors
          </h1>
        </div>
        <p className="mb-8 text-lg text-muted-foreground">
          Quick solutions to the most common errors encountered during Spring Boot migrations.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {errors.map((error) => (
            <Card key={error.key} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{error.title}</CardTitle>
                <CardDescription className="mt-2">{error.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {error.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/spring-boot/errors/${error.key}`}>
                    View solution
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
