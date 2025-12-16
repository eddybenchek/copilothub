import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { ContentStatus } from "@prisma/client";
import { Bot, Download, Plug, Eye, Star, Share2, ExternalLink as ExternalLinkIcon } from "lucide-react";
import { ExternalLink } from "@/components/analytics/external-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AddToCollectionButton } from "@/components/collections/add-to-collection-button";
import { ShareButton } from "@/components/share-button";
import { VoteButton } from "@/components/votes/vote-button";
import { MarkdownPreview } from "@/components/markdown-preview";
import { AgentDownloadButton } from "@/components/agents/download-button";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import { getBaseUrl, createMetadata, createStructuredData } from "@/lib/metadata";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = await db.agent.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!agent || agent.status !== ContentStatus.APPROVED) {
    return {};
  }

  const url = `${getBaseUrl()}/agents/${slug}`;
  const description = agent.description || `AI agent: ${agent.title}`;

  return createMetadata({
    title: agent.title,
    description,
    openGraph: {
      title: agent.title,
      description,
      url,
      type: 'article',
      publishedTime: agent.createdAt.toISOString(),
      modifiedTime: agent.updatedAt.toISOString(),
      authors: agent.author.name ? [agent.author.name] : undefined,
      tags: [...agent.tags, ...(agent.category ? [agent.category] : [])],
      images: [
        {
          url: `${getBaseUrl()}/og-image.png`,
          width: 1200,
          height: 630,
          alt: agent.title,
        },
      ],
    },
    twitter: {
      title: agent.title,
      description,
    },
  });
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await db.agent.findUnique({
    where: { slug },
    include: {
      author: true,
      votes: true,
    },
  });

  if (!agent || agent.status !== ContentStatus.APPROVED) {
    notFound();
  }

  const downloads = agent.downloads || 0;
  const views = agent.views || 0;
  const mcpCount = agent.mcpServers?.length || 0;
  const voteCount = agent.votes.reduce((sum, vote) => sum + vote.value, 0);
  
  const structuredData = createStructuredData('SoftwareApplication', {
    name: agent.title,
    description: agent.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    author: {
      '@type': 'Person',
      name: agent.author.name || 'Anonymous',
    },
    datePublished: agent.createdAt.toISOString(),
    dateModified: agent.updatedAt.toISOString(),
    url: `${getBaseUrl()}/agents/${slug}`,
    keywords: [...agent.tags, ...agent.languages, ...agent.frameworks].join(', '),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  });

  // Fetch actual MCP servers from database to validate links
  const mcpSlugs = agent.mcpServers.map((name) => 
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  );
  
  const validMcps = await db.mcpServer.findMany({
    where: {
      slug: { in: mcpSlugs },
      status: ContentStatus.APPROVED,
    },
    select: {
      slug: true,
      name: true,
      description: true,
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-12">
        <article className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-3">
              <Bot className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-50">{agent.title}</h1>
              {agent.category && (
                <p className="mt-1 text-sm text-slate-500 capitalize">
                  {agent.category}
                </p>
              )}
            </div>
          </div>
          {agent.description.toLowerCase() !== agent.title.toLowerCase() && (
            <p className="text-xl text-slate-400">{agent.description}</p>
          )}
        </div>

        {/* Metadata Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-4 border-y border-slate-800 py-4">
          {agent.languages.map((lang) => (
            <Badge key={lang} variant="secondary" className="capitalize">
              {lang}
            </Badge>
          ))}
          {agent.frameworks.map((framework) => (
            <Badge key={framework} variant="outline" className="capitalize">
              {framework}
            </Badge>
          ))}
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Download className="h-4 w-4" />
            <span>{downloads} installs</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Eye className="h-4 w-4" />
            <span>{views} views</span>
          </div>
          {mcpCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-teal-400">
              <Plug className="h-4 w-4" />
              <span>{mcpCount} MCP{mcpCount > 1 ? 's' : ''} required</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <VoteButton
            targetId={agent.id}
            targetType="AGENT"
            initialVoteCount={voteCount}
          />
          {agent.vsCodeInstallUrl && (
            <ExternalLink href={agent.vsCodeInstallUrl} type="other">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Download className="mr-2 h-5 w-5" />
                Install in VS Code
              </Button>
            </ExternalLink>
          )}
          {agent.vsCodeInsidersUrl && (
            <ExternalLink href={agent.vsCodeInsidersUrl} type="other">
              <Button size="lg" variant="outline" className="border-teal-500/40 text-teal-300 hover:bg-teal-500/10">
                <Download className="mr-2 h-5 w-5" />
                Install in VS Code Insiders
              </Button>
            </ExternalLink>
          )}
          <AgentDownloadButton agent={agent} />
          <ShareButton title={agent.title} />
          <AddToCollectionButton
            targetId={agent.id}
            targetType="AGENT"
            targetTitle={agent.title}
          />
        </div>

        {/* MCP Requirements Section */}
        {mcpCount > 0 && (
          <div className="mb-8 rounded-lg border border-teal-500/20 bg-teal-500/5 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-50">
              <Plug className="h-5 w-5 text-teal-400" />
              Required MCP Servers
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              This agent requires the following MCP servers to function. Click to view installation instructions.
            </p>
            <div className="flex flex-wrap gap-2">
              {validMcps.length > 0 ? (
                validMcps.map((mcp) => (
                  <Link 
                    key={mcp.slug}
                    href={`/mcps/${mcp.slug}`}
                    className="group flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2 transition-colors hover:border-teal-500/40 hover:bg-slate-700/60"
                  >
                    <Plug className="h-4 w-4 text-teal-400" />
                    <span className="text-sm font-medium text-slate-200 group-hover:text-teal-300">
                      {mcp.name}
                    </span>
                    <ExternalLinkIcon className="h-3.5 w-3.5 text-slate-500 group-hover:text-teal-400" />
                  </Link>
                ))
              ) : (
                <div className="text-sm text-slate-500">
                  <p className="mb-2">MCP servers listed but not yet available in our directory:</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.mcpServers.map((mcpName, idx) => (
                      <span 
                        key={idx}
                        className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-400"
                      >
                        {mcpName}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs">
                    💡 <Link href="/mcps" className="text-teal-400 hover:underline">Browse all available MCPs</Link> or check back later.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="preview" className="mb-8">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="raw">Raw Markdown</TabsTrigger>
            <TabsTrigger value="howto">How to Install</TabsTrigger>
          </TabsList>

          <TabsContent value="preview">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8">
              <MarkdownPreview content={agent.content} />
            </div>
          </TabsContent>

          <TabsContent value="raw">
            <CodeBlock code={agent.content} language="markdown" />
          </TabsContent>

          <TabsContent value="howto">
            <div className="space-y-6 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-50">📦 Installation</h3>
                <ol className="space-y-3 text-sm text-slate-300">
                  <li>
                    <strong>1. Click the install button above</strong> to open VS Code directly
                  </li>
                  <li>
                    <strong>2. Or download the .agent.md file</strong> and add it to your repository:
                    <code className="ml-2 rounded bg-slate-800 px-2 py-1">
                      .github/copilot/agents/{agent.slug}.agent.md
                    </code>
                  </li>
                  {mcpCount > 0 && (
                    <li>
                      <strong>3. Install required MCP servers</strong> (see above for links)
                    </li>
                  )}
                  <li>
                    <strong>{mcpCount > 0 ? '4' : '3'}. Activate the agent</strong> in VS Code Chat interface or Copilot CLI
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-50">🎯 Usage</h3>
                <p className="text-sm text-slate-400">
                  Once installed, access this agent through:
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  <li>• <strong>VS Code Chat</strong> - Type <code className="rounded bg-slate-800 px-2 py-1">@{agent.slug}</code> in chat</li>
                  <li>• <strong>Copilot Coding Agent (CCA)</strong> - Assign in settings</li>
                  <li>• <strong>Copilot CLI</strong> - Coming soon</li>
                </ul>
              </div>

              {agent.tags.length > 0 && (
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                  <p className="text-sm text-purple-200">
                    💡 <strong>Best for:</strong> {agent.tags.slice(0, 3).join(', ')} tasks
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tags Section */}
        {agent.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-3 text-lg font-semibold text-slate-50">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {agent.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Related Content */}
        <div className="border-t border-slate-800 pt-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-50">Related Resources</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mcpCount > 0 && (
              <Link
                href="/mcps"
                className="group rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition hover:border-teal-500/40 hover:bg-slate-900"
              >
                <h3 className="font-semibold text-slate-100 group-hover:text-teal-300">
                  MCP Servers
                </h3>
                <p className="text-sm text-slate-400">
                  Install required MCP servers for this agent
                </p>
              </Link>
            )}
            <Link
              href="/agents"
              className="group rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition hover:border-purple-500/40 hover:bg-slate-900"
            >
              <h3 className="font-semibold text-slate-100 group-hover:text-purple-300">
                More Agents
              </h3>
              <p className="text-sm text-slate-400">
                Browse other specialized AI agents
              </p>
            </Link>
          </div>
        </div>
      </article>
    </div>
    </>
  );
}

