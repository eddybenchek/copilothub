import { db } from "@/lib/db";
import { ContentStatus } from "@prisma/client";
import { InstructionCard } from "@/components/instructions/instruction-card";

export default async function InstructionsPage() {
  const instructions = await db.instruction.findMany({
    where: {
      status: ContentStatus.APPROVED,
    },
    include: {
      author: true,
      votes: true,
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-50">Copilot Instructions</h1>
        <p className="text-slate-400">
          Comprehensive coding standards and best practices that apply to specific file patterns
        </p>
      </header>

      {/* Stats */}
      <div className="mb-8 flex flex-wrap gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-2">
          <div className="text-2xl font-bold text-slate-50">{instructions.length}</div>
          <div className="text-xs text-slate-400">Total Instructions</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-2">
          <div className="text-2xl font-bold text-slate-50">
            {instructions.filter(i => i.featured).length}
          </div>
          <div className="text-xs text-slate-400">Featured</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-2">
          <div className="text-2xl font-bold text-slate-50">
            {new Set(instructions.map(i => i.language).filter(Boolean)).size}
          </div>
          <div className="text-xs text-slate-400">Languages</div>
        </div>
      </div>

      {/* Instructions Grid */}
      {instructions.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-400">No instructions found. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {instructions.map((instruction) => (
            <InstructionCard key={instruction.id} instruction={instruction} />
          ))}
        </div>
      )}
    </main>
  );
}

