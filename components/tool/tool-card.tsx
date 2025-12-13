"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import clsx from "clsx";
import { FavoriteButton } from "@/components/favorites/favorite-button";

export type ToolCardProps = {
  tool: {
    id: string;
    name?: string | null;
    title?: string;
    shortDescription?: string | null;
    description?: string;
    websiteUrl?: string | null;
    url?: string | null;
    logo?: string | null;
    tags: string[];
    difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    authorName?: string | null;
    createdAt?: string | Date | null;
    featured?: boolean;
  };
};

export function ToolCard({ tool }: ToolCardProps) {
  const displayName = tool.name || tool.title || "Untitled Tool";
  const displayDescription = tool.shortDescription || tool.description || "";
  const displayUrl = tool.websiteUrl || tool.url || "";
  
  const createdAt =
    tool.createdAt instanceof Date
      ? tool.createdAt
      : tool.createdAt
      ? new Date(tool.createdAt)
      : null;

  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={clsx(
        "flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-sm transition duration-150",
        "hover:border-sky-500/40 hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:scale-[1.01] cursor-pointer",
        tool.featured &&
          "border-sky-500/50 shadow-[0_0_22px_rgba(56,189,248,0.28)]",
      )}
    >
      {/* Top: logo + title + website link */}
      <div className="flex min-h-[48px] items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/60">
          {tool.logo ? (
            <Image
              src={tool.logo}
              alt={displayName}
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <span className="text-xs font-semibold text-slate-200">
              {initials}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="mb-0.5 text-base font-semibold text-slate-50">
              {displayName}
            </h3>
            <div className="flex items-center gap-2 ml-auto">
              {displayUrl && (
                <Link
                  href={displayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline">Website</span>
                </Link>
              )}
              <div onClick={(e) => e.preventDefault()} className="relative z-10">
                <FavoriteButton targetId={tool.id} targetType="TOOL" size="sm" />
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            {displayDescription}
          </p>
        </div>
      </div>

      {/* Tags */}
      {tool.tags?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2.5 py-1 text-xs text-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {tool.authorName && (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            {tool.authorName}
          </span>
        )}

        {createdAt && (
          <span className="flex items-center gap-1">
            <span aria-hidden>📅</span>
            {createdAt.toLocaleDateString()}
          </span>
        )}

        {tool.difficulty && (
          <span
            className={clsx(
              "ml-auto inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide",
              "bg-slate-800/60 border border-slate-700/40 text-slate-200",
            )}
          >
            {tool.difficulty}
          </span>
        )}
      </div>
    </div>
  );
}
