import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBaseUrl, createMetadata } from '@/lib/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { getPromptPackByKey, getAllPromptPacks } from '@/lib/hub-indexes/spring-boot-index';
import { getSpringBootContent } from '@/lib/hub-helpers';
import { PromptCard } from '@/components/prompt/prompt-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

function generatePromptPackStructuredData(pack: ReturnType<typeof getPromptPackByKey>) {
  if (!pack) return null;
  
  const baseUrl = getBaseUrl();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: pack.title,
    description: pack.description || `Copilot prompt pack for ${pack.title}`,
    url: `${baseUrl}/spring-boot/prompt-packs/${pack.key}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/spring-boot/prompt-packs/${pack.key}`,
    },
  };
}

interface PromptPackPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const packs = getAllPromptPacks();
  return packs.map((pack) => ({
    slug: pack.key,
  }));
}

export async function generateMetadata({ params }: PromptPackPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pack = getPromptPackByKey(slug);

  if (!pack) {
    return createMetadata({
      title: { absolute: 'Prompt Pack Not Found | CopilotHub' },
    });
  }

  return createMetadata({
    title: {
      absolute: `${pack.title} - Spring Boot Copilot Prompts | CopilotHub`,
    },
    description: pack.description || `Copilot prompt pack for ${pack.title} in Spring Boot migrations.`,
    alternates: {
      canonical: `${getBaseUrl()}/spring-boot/prompt-packs/${slug}`,
    },
  });
}

export default async function PromptPackPage({ params }: PromptPackPageProps) {
  const { slug } = await params;
  const pack = getPromptPackByKey(slug);

  if (!pack) {
    notFound();
  }

  const content = await getSpringBootContent();
  
  // Filter prompts by pack tags
  const packPrompts = content.prompts.filter((p) => {
    const tagsLower = p.tags.map(t => t.toLowerCase());
    return pack.tags.some((tag) =>
      tagsLower.some((pt) => pt.includes(tag.toLowerCase()))
    );
  });

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Spring Boot Hub', href: '/spring-boot' },
    { label: 'Prompt Packs', href: '/spring-boot/prompt-packs' },
    { label: pack.title, href: `/spring-boot/prompt-packs/${slug}` },
  ];

  const structuredData = generatePromptPackStructuredData(pack);

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
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {pack.title}
          </h1>
        </div>
        {pack.description && (
          <p className="mb-6 text-lg text-muted-foreground">{pack.description}</p>
        )}

        <div className="mb-8 flex flex-wrap gap-2">
          {pack.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {packPrompts.length > 0 ? (
          <>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              Prompts in this pack ({packPrompts.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </>
        ) : (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No prompts found</CardTitle>
              <CardDescription>
                We&apos;re working on adding prompts for this category. Check back soon!
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/spring-boot/prompt-packs">
              ← Back to all prompt packs
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
