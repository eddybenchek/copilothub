import { db } from "@/lib/db";
import { MigrationCard } from "@/components/migrations/migration-card";
import { ContentStatus } from "@prisma/client";

export default async function MigrationsPage({
  searchParams,
}: {
  searchParams?: { q?: string; category?: string; level?: string };
}) {
  const q = searchParams?.q ?? "";
  const category = searchParams?.category;
  const level = searchParams?.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;

  const migrations = await db.migrationGuide.findMany({
    where: {
      status: ContentStatus.APPROVED,
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { fromStack: { contains: q, mode: "insensitive" } },
                { toStack: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category } : {},
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
        <h1 className="text-2xl font-semibold text-slate-50">Migration Catalog</h1>
        <p className="text-sm text-slate-400">
          Structured guides for safely migrating between frameworks, languages, and tools.
        </p>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {migrations.map((migration) => (
          <MigrationCard key={migration.id} migration={migration} />
        ))}
        {migrations.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">
            No migrations found for this filter yet.
          </p>
        )}
      </section>
    </main>
  );
}
