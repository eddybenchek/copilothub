import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBaseUrl, createMetadata } from '@/lib/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { getErrorByKey, getAllErrors } from '@/lib/hub-indexes/spring-boot-index';
import { getSpringBootContent } from '@/lib/hub-helpers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { CopyButton } from '@/components/copy-button';

function generateErrorStructuredData(error: ReturnType<typeof getErrorByKey>) {
  if (!error) return null;
  
  const baseUrl = getBaseUrl();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: error.title,
    description: error.description,
    url: `${baseUrl}/spring-boot/errors/${error.key}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/spring-boot/errors/${error.key}`,
    },
    about: {
      '@type': 'Thing',
      name: 'Spring Boot Migration Error',
    },
  };
}

interface ErrorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const errors = getAllErrors();
  return errors.map((error) => ({
    slug: error.key,
  }));
}

export async function generateMetadata({ params }: ErrorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const error = getErrorByKey(slug);

  if (!error) {
    return createMetadata({
      title: { absolute: 'Error Not Found | CopilotHub' },
    });
  }

  return createMetadata({
    title: {
      absolute: `${error.title} - Spring Boot Migration Solution | CopilotHub`,
    },
    description: `${error.description}. Fix ${error.title} with step-by-step solutions and Copilot prompts.`,
    alternates: {
      canonical: `${getBaseUrl()}/spring-boot/errors/${slug}`,
    },
  });
}

export default async function ErrorPage({ params }: ErrorPageProps) {
  const { slug } = await params;
  const error = getErrorByKey(slug);

  if (!error) {
    notFound();
  }

  const content = await getSpringBootContent();
  
  // Filter related prompts
  const relatedPrompts = content.prompts.filter((p) =>
    error.tags.some((tag) => p.tags.some((pt) => pt.toLowerCase().includes(tag.toLowerCase())))
  );

  const playbookHref = `/instructions/${error.instructionSlug}#${error.anchor}`;

  const copilotPrompt = `Fix this Spring Boot migration error: ${error.title}

Error: ${error.description}

Context:
${error.searchAliases.join(', ')}

Solution:
1. ${error.fixPatterns?.[0] || 'See playbook for detailed steps'}
${error.fixPatterns?.slice(1).map((pattern, i) => `${i + 2}. ${pattern}`).join('\n') || ''}

Full guide: ${getBaseUrl()}${playbookHref}
`;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Spring Boot Hub', href: '/spring-boot' },
    { label: 'Errors', href: '/spring-boot/errors' },
    { label: error.title, href: `/spring-boot/errors/${slug}` },
  ];

  const structuredData = generateErrorStructuredData(error);

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
        <div className="mb-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-orange-500" />
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {error.title}
          </h1>
        </div>
        <p className="mb-6 text-lg text-muted-foreground">{error.description}</p>

        <div className="mb-8 flex flex-wrap gap-2">
          {error.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {error.fixPatterns && error.fixPatterns.length > 0 && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>Fix Patterns</CardTitle>
              <CardDescription>Step-by-step solution</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {error.fixPatterns.map((pattern, index) => (
                  <li key={index} className="text-foreground">{pattern}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Migration Playbook</CardTitle>
              <CardDescription>Complete guide with examples</CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle>Copilot Prompt</CardTitle>
              <CardDescription>Copy-ready prompt for GitHub Copilot</CardDescription>
            </CardHeader>
            <CardContent>
              <CopyButton text={copilotPrompt} variant="outline" className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy prompt
              </CopyButton>
            </CardContent>
          </Card>
        </div>

        {relatedPrompts.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Related Copilot Prompts</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPrompts.slice(0, 6).map((prompt) => (
                <Card key={prompt.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">{prompt.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{prompt.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/prompts/${prompt.slug}`}>
                        View prompt
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/spring-boot/errors">
              ← Back to all errors
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
