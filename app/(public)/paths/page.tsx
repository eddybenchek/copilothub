import { db } from "@/lib/db";
import { LearningPathCard } from "@/components/paths/learning-path-card";
import { ContentStatus } from "@prisma/client";

export default async function PathsPage({
  searchParams,
}: {
  searchParams?: { q?: string; audience?: string; level?: string };
}) {
  const q = searchParams?.q ?? "";
  const audience = searchParams?.audience;
  const level = searchParams?.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;

  const paths = await db.learningPath.findMany({
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
        audience ? { audience } : {},
        level ? { level } : {},
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
        <h1 className="text-2xl font-semibold text-slate-50">Learning Paths</h1>
        <p className="text-sm text-slate-400">
          Curated paths that link prompts, workflows, tools, recipes, and migrations.
        </p>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paths.map((path) => (
          <LearningPathCard key={path.id} path={path} />
        ))}
        {paths.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">
            No learning paths found for this filter yet.
          </p>
        )}
      </section>
    </main>
  );
}
