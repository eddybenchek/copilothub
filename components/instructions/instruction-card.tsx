"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileCode, Star, Download, Eye } from "lucide-react";
import type { Instruction, User, Vote } from "@prisma/client";

export type InstructionWithAuthor = Instruction & {
  author: User;
  votes: Vote[];
};

export type InstructionCardProps = {
  instruction: InstructionWithAuthor;
};

export function InstructionCard({ instruction }: InstructionCardProps) {
  const voteCount = instruction.votes.reduce((sum, vote) => sum + vote.value, 0);

  return (
    <Link href={`/instructions/${instruction.slug}`} className="animate-fadeUp">
      <Card className="h-full transition duration-150 hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-sky-500/40 cursor-pointer relative">
        <CardHeader className="p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="rounded-lg bg-sky-500/10 p-2 shrink-0">
                <FileCode className="h-5 w-5 text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg line-clamp-1">{instruction.title}</CardTitle>
                {instruction.filePattern && (
                  <code className="text-xs text-slate-400 block truncate mt-0.5">
                    {instruction.filePattern}
                  </code>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {instruction.featured && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
              {voteCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2 py-0.5 text-xs text-slate-200">
                  ↑ {voteCount}
                </span>
              )}
            </div>
          </div>
          <CardDescription className="line-clamp-2 mt-2">
            {instruction.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-3">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {instruction.language && (
                <Badge variant="outline" className="capitalize">{instruction.language}</Badge>
              )}
              {instruction.framework && (
                <Badge variant="outline" className="capitalize">{instruction.framework}</Badge>
              )}
              {instruction.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="capitalize">
                  {tag}
                </Badge>
              ))}
              {instruction.tags.length > 2 && (
                <Badge variant="outline">+{instruction.tags.length - 2}</Badge>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span>{instruction.downloads}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{instruction.views}</span>
              </div>
              <Badge variant="outline" className="capitalize">{instruction.difficulty}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

