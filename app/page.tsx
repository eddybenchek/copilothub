import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Sparkles, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt/prompt-card';
import { WorkflowCard } from '@/components/workflow/workflow-card';
import { ToolCard } from '@/components/tool/tool-card';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { MigrationCard } from '@/components/migrations/migration-card';
import { LearningPathCard } from '@/components/paths/learning-path-card';
import { GlobalSearchDropdown } from '@/components/search/global-search-dropdown';
import { ModernizationSection } from '@/components/home/modernization-section';
import { getLatestPrompts, getLatestWorkflows, getLatestTools } from '@/lib/prisma-helpers';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';

export default async function HomePage() {
  const [prompts, workflows, tools, modernizationPrompts, modernizationWorkflows, latestRecipes, latestMigrations, latestPaths] = await Promise.all([
    getLatestPrompts(3),
    getLatestWorkflows(3),
    getLatestTools(3),
    // Fetch modernization content
    db.prompt.findMany({
      where: {
        status: ContentStatus.APPROVED,
        tags: {
          hasSome: ['modernization', 'migration', 'upgrade', 'refactor'],
        },
      },
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        difficulty: true,
        tags: true,
      },
    }),
    db.workflow.findMany({
      where: {
        status: ContentStatus.APPROVED,
        tags: {
          hasSome: ['modernization', 'migration', 'upgrade', 'refactor'],
        },
      },
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        difficulty: true,
        tags: true,
      },
    }),
    // Fetch new content types
    db.codeRecipe.findMany({ 
      where: { status: ContentStatus.APPROVED }, 
      orderBy: { createdAt: "desc" }, 
      take: 6,
      include: {
        author: true,
        votes: true,
      },
    }),
    db.migrationGuide.findMany({ 
      where: { status: ContentStatus.APPROVED }, 
      orderBy: { createdAt: "desc" }, 
      take: 6,
      include: {
        author: true,
        votes: true,
      },
    }),
    db.learningPath.findMany({ 
      where: { status: ContentStatus.APPROVED }, 
      orderBy: { createdAt: "desc" }, 
      take: 4,
      include: {
        author: true,
        votes: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col space-y-24">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Powered by AI</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Supercharge Your Development with{' '}
            <span className="text-primary">AI Copilot</span>
          </h1>
          <p className="mb-12 text-xl text-muted-foreground">
            A curated collection of prompts, workflows, and tools to help you build faster and smarter
            with AI-powered development.
          </p>
          
          {/* Global Search */}
          <div className="mb-12">
            <Suspense fallback={
              <div className="relative">
                <div className="h-12 w-full rounded-lg border border-slate-800 bg-slate-900/40 animate-pulse"></div>
              </div>
            }>
              <GlobalSearchDropdown />
            </Suspense>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/prompts">
                Browse Prompts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/submit">Submit Your Own</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Curated Prompts</h3>
              <p className="text-sm text-muted-foreground">
                Battle-tested prompts for code review, documentation, debugging, and more.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Complete Workflows</h3>
              <p className="text-sm text-muted-foreground">
                Step-by-step workflows for building features, APIs, and components from scratch.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Essential Tools</h3>
              <p className="text-sm text-muted-foreground">
                Discover the best tools and extensions to enhance your AI-powered workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modernization & Technical Migration Section */}
      <div className="container mx-auto px-4">
        <ModernizationSection
          prompts={modernizationPrompts}
          workflows={modernizationWorkflows}
        />
      </div>

      {/* Code Recipes */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Code Recipes</h2>
            <p className="mt-2 text-slate-400">Reusable patterns and snippets for real projects</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/recipes">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* Migration Catalog */}
      <section className="border-y border-border bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Migration Catalog</h2>
              <p className="mt-2 text-slate-400">Structured guides for framework and language migrations</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/migrations">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestMigrations.map((migration) => (
              <MigrationCard key={migration.id} migration={migration} />
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Learning Paths</h2>
            <p className="mt-2 text-slate-400">Curated journeys to master AI-assisted development</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/paths">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestPaths.map((path) => (
            <LearningPathCard key={path.id} path={path} />
          ))}
        </div>
      </section>

      {/* Latest Prompts */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold transition-transform duration-200 group-hover:-translate-y-0.5">Latest Prompts</h2>
          <Button variant="ghost" asChild>
            <Link href="/prompts">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      {/* Latest Workflows */}
      <section className="border-y border-border bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-3xl font-bold transition-transform duration-200 group-hover:-translate-y-0.5">Latest Workflows</h2>
            <Button variant="ghost" asChild>
              <Link href="/workflows">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Tools */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold transition-transform duration-200 group-hover:-translate-y-0.5">Essential Tools</h2>
          <Button variant="ghost" asChild>
            <Link href="/tools">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join our community and share your own prompts, workflows, and tools.
            </p>
            <Button size="lg" asChild>
              <Link href="/submit">
                Submit Your Contribution
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
