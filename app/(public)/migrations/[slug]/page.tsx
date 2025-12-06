import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ContentStatus } from "@prisma/client";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PromptCard } from "@/components/prompt/prompt-card";
import { WorkflowCard } from "@/components/workflow/workflow-card";
import { ToolCard } from "@/components/tool/tool-card";
import { RecipeCard } from "@/components/recipes/recipe-card";

export default async function MigrationDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const migration = await db.migrationGuide.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      votes: true,
    },
  });

  if (!migration || migration.status !== ContentStatus.APPROVED) {
    notFound();
  }

  const voteCount = migration.votes.reduce((sum, vote) => sum + vote.value, 0);

  // Fetch related content
  const [relatedPrompts, relatedWorkflows, relatedTools, relatedRecipes] =
    await Promise.all([
      migration.relatedPromptSlugs.length > 0
        ? db.prompt.findMany({
            where: {
              slug: { in: migration.relatedPromptSlugs },
              status: ContentStatus.APPROVED,
            },
            include: { author: true, votes: true },
          })
        : [],
      migration.relatedWorkflowSlugs.length > 0
        ? db.workflow.findMany({
            where: {
              slug: { in: migration.relatedWorkflowSlugs },
              status: ContentStatus.APPROVED,
            },
            include: { author: true, votes: true },
          })
        : [],
      migration.relatedToolSlugs.length > 0
        ? db.tool.findMany({
            where: {
              slug: { in: migration.relatedToolSlugs },
              status: ContentStatus.APPROVED,
            },
            include: { author: true, votes: true },
          })
        : [],
      migration.relatedRecipeSlugs.length > 0
        ? db.codeRecipe.findMany({
            where: {
              slug: { in: migration.relatedRecipeSlugs },
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
            <Badge variant="secondary">{migration.difficulty}</Badge>
            <Badge variant="outline">{migration.category}</Badge>
            {voteCount > 0 && (
              <Badge variant="outline">↑ {voteCount} votes</Badge>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-50">
            {migration.title}
          </h1>
          <p className="mb-4 text-xl text-slate-400">{migration.description}</p>
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-300">
            <span>{migration.fromStack}</span>
            <ArrowRight className="h-5 w-5" />
            <span>{migration.toStack}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 border-y border-slate-800 py-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{migration.author.name || "Anonymous"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(migration.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {migration.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Overview */}
        {migration.overview && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">
              Overview
            </h2>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {migration.overview}
              </p>
            </div>
          </div>
        )}

        {/* Risks */}
        {migration.risks && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">Risks</h2>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {migration.risks}
              </p>
            </div>
          </div>
        )}

        {/* Prerequisites */}
        {migration.prerequisites && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">
              Prerequisites
            </h2>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {migration.prerequisites}
              </p>
            </div>
          </div>
        )}

        {/* Steps */}
        {migration.steps.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">Steps</h2>
            <ol className="space-y-2">
              {migration.steps.map((step, index) => (
                <li
                  key={index}
                  className="flex gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-300">
                    {index + 1}
                  </span>
                  <span className="text-slate-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Related Content */}
        {(relatedPrompts.length > 0 ||
          relatedWorkflows.length > 0 ||
          relatedTools.length > 0 ||
          relatedRecipes.length > 0) && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-semibold text-slate-50">
              Related Resources
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
          </div>
        )}
      </article>
    </div>
  );
}
