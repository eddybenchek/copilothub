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
import { getLatestPrompts, getLatestTools, getTopCategories, getPromptsByCategory, getLatestContent } from '@/lib/prisma-helpers';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';
import type { InstructionWithAuthor, AgentWithAuthor, McpWithAuthor } from '@/lib/types';

export default async function HomePage() {
  // Get top categories first
  const topCategories = await getTopCategories(6);
  
  // Fetch all data in parallel
  const [tools, modernizationPrompts, latestMcps, latestInstructions, latestAgents] = await Promise.all([
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
    // Fetch latest MCPs
    getLatestContent('mcp', 6) as Promise<McpWithAuthor[]>,
    // Fetch latest Instructions
    getLatestContent('instruction', 6) as Promise<InstructionWithAuthor[]>,
    // Fetch latest Agents
    getLatestContent('agent', 6) as Promise<AgentWithAuthor[]>,
  ]);

  // Fetch prompts for each category
  const categoryPrompts = await Promise.all(
    topCategories.map((category) => getPromptsByCategory(category, 8))
  );

  return (
    <div className="flex flex-col space-y-24">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Supercharge Your Development with{' '}
            <span className="text-primary">GitHub Copilot</span>
          </h1>
          <p className="mb-12 text-xl text-muted-foreground">
            A curated collection of prompts, instructions, agents, tools, and MCP servers to help you build faster and smarter
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
              <h3 className="mb-2 text-lg font-semibold">AI Agents & Instructions</h3>
              <p className="text-sm text-muted-foreground">
                Specialized AI agents and coding instructions for consistent, high-quality development.
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

      {/* Category-Based Prompts */}
      {topCategories.length > 0 && (
        <>
          {topCategories.map((category, index) => {
            const prompts = categoryPrompts[index];
            if (!prompts || prompts.length === 0) return null;
            
            const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1);
            
            return (
              <section 
                key={category} 
                className={index % 2 === 0 ? "container mx-auto px-4 py-20" : "border-y border-border bg-muted/50 py-20"}
              >
                <div className="container mx-auto px-4">
                  <div className="mb-12 flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold">{categoryDisplayName}</h2>
                      <p className="mt-2 text-muted-foreground">
                        {prompts.length}+ prompts for {categoryDisplayName} development
                      </p>
                    </div>
                    <Button variant="ghost" asChild>
                      <Link href={`/prompts?tags=${category}`}>
                        View all
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {prompts.slice(0, 6).map((prompt) => (
                      <PromptCard key={prompt.id} prompt={prompt} />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </>
      )}

      {/* Modernization & Technical Migration Section */}
      {modernizationPrompts.length > 0 && (
        <div className="container mx-auto px-4">
          <ModernizationSection
            prompts={modernizationPrompts}
          />
        </div>
      )}

      {/* Latest Instructions */}
      {latestInstructions.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Latest Instructions</h2>
              <p className="mt-2 text-muted-foreground">Best practices that apply automatically to your code</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/instructions">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestInstructions.map((instruction) => (
              <InstructionCard key={instruction.id} instruction={instruction} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Agents */}
      {latestAgents.length > 0 && (
        <section className="border-y border-border bg-muted/50">
          <div className="container mx-auto px-4 py-20">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Latest Agents</h2>
                <p className="mt-2 text-muted-foreground">Specialized assistants for complex development tasks</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/agents">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest MCPs */}
      {latestMcps.length > 0 && (
        <section className="border-y border-border bg-muted/50">
          <div className="container mx-auto px-4 py-20">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Latest MCPs</h2>
                <p className="mt-2 text-muted-foreground">Extend your AI capabilities with Model Context Protocol servers</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/mcps">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestMcps.map((mcp: any) => (
                <McpCard key={mcp.id} mcp={mcp} />
              ))}
            </div>
          </div>
        </section>
      )}

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
