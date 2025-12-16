import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Sparkles, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt/prompt-card';
import { ToolCard } from '@/components/tool/tool-card';
import { McpCard } from '@/components/mcp/mcp-card';
import { InstructionCard } from '@/components/instructions/instruction-card';
import { AgentCard } from '@/components/agents/agent-card';
import { GlobalSearchDropdown } from '@/components/search/global-search-dropdown';
import { ModernizationSection } from '@/components/home/modernization-section';
import { getLatestPrompts, getLatestTools } from '@/lib/prisma-helpers';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';

export default async function HomePage() {
  const [prompts, tools, modernizationPrompts, featuredMcps, featuredInstructions, featuredAgents] = await Promise.all([
    getLatestPrompts(3),
    getLatestTools(3),
    // Fetch modernization content
    db.prompt.findMany({
      where: {
        status: ContentStatus.APPROVED,
        tags: {
          hasSome: ['modernization', 'migration', 'upgrade', 'refactor', 'workflow'],
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
    // Fetch featured MCPs
    (db as any).mcpServer.findMany({
      where: { 
        status: ContentStatus.APPROVED,
        featured: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
      include: {
        author: true,
        votes: true,
      },
    }),
    // Fetch featured Instructions
    db.instruction.findMany({
      where: {
        status: ContentStatus.APPROVED,
        featured: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
      include: {
        author: true,
        votes: true,
      },
    }),
    // Fetch featured Agents
    db.agent.findMany({
      where: {
        status: ContentStatus.APPROVED,
        featured: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
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
                <div className="h-12 w-full rounded-lg border border-border bg-card animate-pulse"></div>
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
              <a 
                href="https://github.com/eddybenchek/copilothub"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contribute on GitHub
              </a>
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
      {modernizationPrompts.length > 0 && (
        <div className="container mx-auto px-4">
          <ModernizationSection
            prompts={modernizationPrompts}
          />
        </div>
      )}

      {/* Featured Instructions */}
      {featuredInstructions.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Coding Standards & Instructions</h2>
              <p className="mt-2 text-slate-400">Best practices that apply automatically to your code</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/instructions">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredInstructions.map((instruction) => (
              <InstructionCard key={instruction.id} instruction={instruction} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Agents */}
      {featuredAgents.length > 0 && (
        <section className="border-y border-border bg-muted/50">
          <div className="container mx-auto px-4 py-20">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">AI Agents</h2>
                <p className="mt-2 text-slate-400">Specialized assistants for complex development tasks</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/agents">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured MCPs */}
      {featuredMcps.length > 0 && (
        <section className="border-y border-border bg-muted/50">
          <div className="container mx-auto px-4 py-20">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Featured MCPs</h2>
                <p className="mt-2 text-slate-400">Extend your AI capabilities with Model Context Protocol servers</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/mcps">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredMcps.map((mcp: any) => (
                <McpCard key={mcp.id} mcp={mcp} />
              ))}
            </div>
          </div>
        </section>
      )}

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
            <p className="mb-8 text-muted-foreground">
              Join our community and share your own prompts, instructions, agents, tools, and MCPs.
            </p>
            <Button size="lg" asChild>
              <a 
                href="https://github.com/eddybenchek/copilothub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                Contribute on GitHub
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
