import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ContentStatus } from "@prisma/client";
import { Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PromptCard } from "@/components/prompt/prompt-card";
import { WorkflowCard } from "@/components/workflow/workflow-card";
import { ToolCard } from "@/components/tool/tool-card";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { MigrationCard } from "@/components/migrations/migration-card";

export default async function LearningPathDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = await db.learningPath.findUnique({
    where: { slug },
    include: {
      author: true,
      votes: true,
    },
  });

  if (!path || path.status !== ContentStatus.APPROVED) {
    notFound();
  }

  const voteCount = path.votes.reduce((sum, vote) => sum + vote.value, 0);

  // Fetch related content
  const [
    relatedPrompts,
    relatedWorkflows,
    relatedTools,
    relatedRecipes,
    relatedMigrations,
  ] = await Promise.all([
    path.promptSlugs.length > 0
      ? db.prompt.findMany({
          where: {
            slug: { in: path.promptSlugs },
            status: ContentStatus.APPROVED,
          },
          include: { author: true, votes: true },
        })
      : [],
    path.workflowSlugs.length > 0
      ? db.workflow.findMany({
          where: {
            slug: { in: path.workflowSlugs },
            status: ContentStatus.APPROVED,
          },
          include: { author: true, votes: true },
        })
      : [],
    path.toolSlugs.length > 0
      ? db.tool.findMany({
          where: {
            slug: { in: path.toolSlugs },
            status: ContentStatus.APPROVED,
          },
          include: { author: true, votes: true },
        })
      : [],
    path.recipeSlugs.length > 0
      ? db.codeRecipe.findMany({
          where: {
            slug: { in: path.recipeSlugs },
            status: ContentStatus.APPROVED,
          },
          include: { author: true, votes: true },
        })
      : [],
    path.migrationSlugs.length > 0
      ? db.migrationGuide.findMany({
          where: {
            slug: { in: path.migrationSlugs },
            status: ContentStatus.APPROVED,
          },
          include: { author: true, votes: true },
        })
      : [],
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary">{path.level}</Badge>
            <Badge variant="outline">{path.audience}</Badge>
            {voteCount > 0 && (
              <Badge variant="outline">↑ {voteCount} votes</Badge>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-50">
            {path.title}
          </h1>
          <p className="text-xl text-slate-400">{path.description}</p>
        </div>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 border-y border-slate-800 py-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{path.author.name || "Anonymous"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(path.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {path.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Overview */}
        {path.overview && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">
              Overview
            </h2>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {path.overview}
              </p>
            </div>
          </div>
        )}

        {/* Goals */}
        {path.goals && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">Goals</h2>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {path.goals}
              </p>
            </div>
          </div>
        )}

        {/* Steps */}
        {path.steps.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">Path Steps</h2>
            <ol className="space-y-2">
              {path.steps.map((step, index) => (
                <li
                  key={index}
                  className="flex gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-300">
                    {index + 1}
                  </span>
                  <span className="text-slate-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Recommended Resources */}
        {(relatedPrompts.length > 0 ||
          relatedWorkflows.length > 0 ||
          relatedTools.length > 0 ||
          relatedRecipes.length > 0 ||
          relatedMigrations.length > 0) && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-semibold text-slate-50">
              Recommended Resources
            </h2>

            {relatedPrompts.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-300">
                  Prompts
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>
              </div>
            )}

            {relatedWorkflows.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-300">
                  Workflows
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedWorkflows.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} />
                  ))}
                </div>
              </div>
            )}

            {relatedTools.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-300">
                  Tools
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            )}

            {relatedRecipes.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-300">
                  Recipes
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </div>
            )}

            {relatedMigrations.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-300">
                  Migrations
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedMigrations.map((migration) => (
                    <MigrationCard key={migration.id} migration={migration} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
