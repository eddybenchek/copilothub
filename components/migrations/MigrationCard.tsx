import Link from "next/link";
import { CardBase } from "@/components/ui/CardBase";
import type { MigrationGuide } from "@prisma/client";
import { ArrowRight } from "lucide-react";

export function MigrationCard({ migration }: { migration: MigrationGuide }) {
  return (
    <Link href={`/migrations/${migration.slug}`} className="block h-full">
      <CardBase className="h-full cursor-pointer hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-sky-500/40 transition duration-150">
        <div className="flex flex-col gap-3 h-full">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-slate-100 line-clamp-2">
                {migration.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">
              {migration.description}
            </p>
            
            {/* From -> To */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
              <span className="text-slate-400">{migration.fromStack}</span>
              <ArrowRight className="h-3 w-3" />
              <span className="text-slate-400">{migration.toStack}</span>
            </div>
          </div>
          
          <div className="mt-auto flex flex-wrap gap-1.5 text-[10px]">
            <span className="rounded-full bg-slate-800/60 border border-slate-700/40 px-2 py-1 text-slate-300">
              {migration.category}
            </span>
            <span className="rounded-full bg-slate-800/60 border border-slate-700/40 px-2 py-1 text-slate-400">
              {migration.difficulty.toLowerCase()}
            </span>
          </div>
        </div>
      </CardBase>
    </Link>
  );
}

