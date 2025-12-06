import Link from "next/link";
import { CardBase } from "@/components/ui/CardBase";
import type { LearningPath } from "@prisma/client";
import { GraduationCap } from "lucide-react";

export function LearningPathCard({ path }: { path: LearningPath }) {
  return (
    <Link href={`/paths/${path.slug}`} className="block h-full">
      <CardBase className="h-full cursor-pointer hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-sky-500/40 transition duration-150">
        <div className="flex flex-col gap-3 h-full">
          <div>
            <div className="flex items-start gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
              <h3 className="text-sm font-semibold text-slate-100 line-clamp-2">
                {path.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
              {path.description}
            </p>
            
            {/* Steps count */}
            <div className="text-[11px] text-slate-500">
              {path.steps.length} steps
            </div>
          </div>
          
          <div className="mt-auto flex flex-wrap gap-1.5 text-[10px]">
            <span className="rounded-full bg-slate-800/60 border border-slate-700/40 px-2 py-1 text-slate-300">
              {path.audience}
            </span>
            <span className="rounded-full bg-slate-800/60 border border-slate-700/40 px-2 py-1 text-slate-400">
              {path.level.toLowerCase()}
            </span>
          </div>
        </div>
      </CardBase>
    </Link>
  );
}

