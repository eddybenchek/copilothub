import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { ContentStatus } from "@prisma/client";
import { FileCode, Download, Copy, Star, Share2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/ui/code-block";
import { DownloadButton } from "@/components/instructions/download-button";
import { CopyButton } from "@/components/copy-button";
import { AddToCollectionButton } from "@/components/collections/add-to-collection-button";
import { ShareButton } from "@/components/share-button";
import { VoteButton } from "@/components/votes/vote-button";
import { MarkdownPreview } from "@/components/markdown-preview-lazy";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import { getBaseUrl, createMetadata, createStructuredData } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const instruction = await db.instruction.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!instruction || instruction.status !== ContentStatus.APPROVED) {
    return {};
  }

  const url = `${getBaseUrl()}/instructions/${slug}`;
  const description = instruction.description || `Copilot instruction: ${instruction.title}`;

  // Add context to title tag to differentiate from H1
  // H1 will be just the instruction title, but title tag should be SEO-optimized
  // Ensure minimum 30 characters for SEO (recommended 30-60)
  let seoTitle = `${instruction.title} - Copilot Instruction | CopilotHub`;
  if (seoTitle.length < 30) {
    // If still too short, add more descriptive context
    seoTitle = `${instruction.title} - GitHub Copilot Instruction | CopilotHub`;
  }

  return createMetadata({
    title: {
      absolute: seoTitle,
    },
    description,
    openGraph: {
      title: instruction.title,
      description,
      url,
      type: 'article',
      publishedTime: instruction.createdAt.toISOString(),
      modifiedTime: instruction.updatedAt.toISOString(),
      authors: instruction.author.name ? [instruction.author.name] : undefined,
      tags: [...instruction.tags, ...(instruction.language ? [instruction.language] : []), ...(instruction.framework ? [instruction.framework] : [])],
      images: [
        {
          url: `${getBaseUrl()}/og-image.png`,
          width: 1200,
          height: 630,
          alt: instruction.title,
        },
      ],
    },
    twitter: {
      title: instruction.title,
      description,
    },
  });
}

export default async function InstructionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const instruction = await db.instruction.findUnique({
    where: { slug },
    include: {
      author: true,
      votes: true,
    },
  });

  if (!instruction || instruction.status !== ContentStatus.APPROVED) {
    notFound();
  }

  // Increment view count
  await db.instruction.update({
    where: { id: instruction.id },
    data: { views: { increment: 1 } },
  });

  const voteCount = instruction.votes.reduce((sum, vote) => sum + vote.value, 0);
  
  const structuredData = createStructuredData('TechArticle', {
    headline: instruction.title,
    description: instruction.description,
    author: {
      '@type': 'Person',
      name: instruction.author.name || 'Anonymous',
    },
    datePublished: instruction.createdAt.toISOString(),
    dateModified: instruction.updatedAt.toISOString(),
    url: `${getBaseUrl()}/instructions/${slug}`,
    keywords: [...instruction.tags, ...(instruction.language ? [instruction.language] : []), ...(instruction.framework ? [instruction.framework] : [])].join(', '),
  });

  return (
    <>
      <ContentViewTracker type="instruction" id={instruction.id} title={instruction.title} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-12">
        <article className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-sky-500/10 p-3">
              <FileCode className="h-6 w-6 text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold text-slate-50">{instruction.title}</h1>
              {instruction.filePattern && (
                <code className="mt-1 text-sm text-slate-400 block">
                  Applies to: {instruction.filePattern}
                </code>
              )}
            </div>
          </div>
          <p className="text-xl text-slate-400">{instruction.description}</p>
        </div>

        {/* Metadata Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-4 border-y border-slate-800 py-4 text-sm text-slate-500">
          {instruction.language && (
            <Badge variant="secondary" className="capitalize">{instruction.language}</Badge>
          )}
          {instruction.framework && (
            <Badge variant="outline" className="capitalize">{instruction.framework}</Badge>
          )}
          {instruction.scope && (
            <Badge variant="outline" className="capitalize">{instruction.scope}</Badge>
          )}
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{instruction.downloads} downloads</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{instruction.views} views</span>
          </div>
          {voteCount > 0 && (
            <div className="flex items-center gap-1">
              <span>↑ {voteCount} votes</span>
            </div>
          )}
          {instruction.featured && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="h-4 w-4 fill-current" />
              <span>Featured</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <VoteButton
            targetId={instruction.id}
            targetType="INSTRUCTION"
            initialVoteCount={voteCount}
          />
          <CopyButton text={instruction.content} contentType="instruction" contentId={instruction.id} />
          <DownloadButton instruction={instruction} />
          <AddToCollectionButton
            targetId={instruction.id}
            targetType="INSTRUCTION"
            targetTitle={instruction.title}
          />
          <ShareButton 
            title={instruction.title}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="preview" className="mb-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="raw">Raw Markdown</TabsTrigger>
            <TabsTrigger value="howto">How to Use</TabsTrigger>
            {(instruction.exampleBefore || instruction.exampleAfter) && (
              <TabsTrigger value="examples">Examples</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="preview">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8">
              <MarkdownPreview content={instruction.content} />
            </div>
          </TabsContent>

          <TabsContent value="raw">
            <CodeBlock code={instruction.content} language="markdown" />
          </TabsContent>

          <TabsContent value="howto">
            <div className="space-y-6 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-50">📁 Installation</h3>
                <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
                  <li>Create or open <code className="px-2 py-0.5 rounded bg-slate-800 text-sky-400">.github/copilot-instructions.md</code> in your repository</li>
                  <li>Copy the instruction content from the &quot;Raw Markdown&quot; tab</li>
                  <li>Paste it into your file</li>
                  <li>Commit and push to your repository</li>
                  <li>GitHub Copilot will automatically apply these instructions</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-slate-50">🎯 What This Does</h3>
                <p className="text-sm text-slate-400">
                  This instruction will be automatically applied when GitHub Copilot generates
                  suggestions for files matching:{" "}
                  <code className="px-2 py-0.5 rounded bg-slate-800 text-sky-400">
                    {instruction.filePattern || "all files"}
                  </code>
                </p>
              </div>

              {instruction.framework && (
                <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-4">
                  <p className="text-sm text-sky-200">
                    💡 <strong>Framework-specific:</strong> This instruction is optimized for{" "}
                    <span className="capitalize">{instruction.framework}</span> projects.
                  </p>
                </div>
              )}

              {instruction.language && (
                <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
                  <p className="text-sm text-purple-200">
                    🔤 <strong>Language:</strong> Best suited for{" "}
                    <span className="capitalize">{instruction.language}</span> codebases.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {(instruction.exampleBefore || instruction.exampleAfter) && (
            <TabsContent value="examples">
              <div className="space-y-4">
                {instruction.exampleBefore && (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
                    <h3 className="mb-3 text-sm font-medium text-slate-400">❌ Before</h3>
                    <CodeBlock 
                      code={instruction.exampleBefore} 
                      language={instruction.language || "typescript"} 
                    />
                  </div>
                )}
                {instruction.exampleAfter && (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
                    <h3 className="mb-3 text-sm font-medium text-slate-400">
                      ✅ After (with instruction)
                    </h3>
                    <CodeBlock 
                      code={instruction.exampleAfter} 
                      language={instruction.language || "typescript"} 
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Tags */}
        {instruction.tags.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {instruction.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

      </article>
    </div>
    </>
  );
}

