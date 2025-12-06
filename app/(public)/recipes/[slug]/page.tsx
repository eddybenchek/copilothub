import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ContentStatus } from "@prisma/client";
import { Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";

export default async function RecipeDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const recipe = await db.codeRecipe.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      votes: true,
    },
  });

  if (!recipe || recipe.status !== ContentStatus.APPROVED) {
    notFound();
  }

  const voteCount = recipe.votes.reduce((sum, vote) => sum + vote.value, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary">{recipe.difficulty}</Badge>
            <Badge variant="outline">{recipe.language}</Badge>
            {recipe.framework && (
              <Badge variant="outline">{recipe.framework}</Badge>
            )}
            {voteCount > 0 && (
              <Badge variant="outline">↑ {voteCount} votes</Badge>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-50">
            {recipe.title}
          </h1>
          <p className="text-xl text-slate-400">{recipe.description}</p>
        </div>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 border-y border-slate-800 py-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{recipe.author.name || "Anonymous"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8 flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Code Sample */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-50">Code</h2>
          <CodeBlock code={recipe.codeSample} language={recipe.language} />
        </div>

        {/* Explanation */}
        {recipe.explanation && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">
              Explanation
            </h2>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-slate-300 leading-relaxed">
                {recipe.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Usage Notes */}
        {recipe.usageNotes && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">
              Usage Notes
            </h2>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-slate-300 leading-relaxed">
                {recipe.usageNotes}
              </p>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
