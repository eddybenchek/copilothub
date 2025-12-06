import { db } from "@/lib/db";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { ContentStatus } from "@prisma/client";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams?: { q?: string; lang?: string; framework?: string; level?: string };
}) {
  const q = searchParams?.q ?? "";
  const lang = searchParams?.lang;
  const framework = searchParams?.framework;
  const level = searchParams?.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;

  const recipes = await db.codeRecipe.findMany({
    where: {
      status: ContentStatus.APPROVED,
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { tags: { has: q.toLowerCase() } },
              ],
            }
          : {},
        lang ? { language: lang } : {},
        framework ? { framework } : {},
        level ? { difficulty: level } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      votes: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-50">Code Recipes</h1>
        <p className="text-sm text-slate-400">
          Reusable patterns and snippets to use with Copilot in real projects.
        </p>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
        {recipes.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">
            No recipes found for this filter yet.
          </p>
        )}
      </section>
    </main>
  );
}
