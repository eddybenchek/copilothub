"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import clsx from "clsx";

export type McpCardProps = {
  mcp: {
    id: string;
    slug?: string;
    name?: string | null;
    title?: string;
    shortDescription?: string | null;
    description?: string;
    websiteUrl?: string | null;
    githubUrl?: string | null;
    logo?: string | null;
    tags: string[];
    difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    authorName?: string | null;
    createdAt?: string | Date | null;
    featured?: boolean;
  };
};

export function McpCard({ mcp }: McpCardProps) {
  // Extract just the repo name from owner/repo format
  const rawName = mcp.name || mcp.title || "Untitled MCP";
  const repoName = rawName.includes('/') ? rawName.split('/')[1] : rawName;
  
  // Replace hyphens with spaces and capitalize
  const displayName = repoName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
  
  const displayDescription = mcp.shortDescription || mcp.description || "";
  const displayUrl = mcp.websiteUrl || mcp.githubUrl || "";

  const createdAt =
    mcp.createdAt instanceof Date
      ? mcp.createdAt
      : mcp.createdAt
      ? new Date(mcp.createdAt)
      : null;

  const initials = displayName
    .split(" ")
    .filter(w => w.length > 0)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "MC";

  return (
    <div
      className={clsx(
        "flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-sm transition duration-150",
        "hover:border-sky-500/40 hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:scale-[1.01] cursor-pointer",
        mcp.featured && "ring-2 ring-sky-500/20"
      )}
    >
      <Link href={`/mcps/${mcp.slug || mcp.title?.toLowerCase().replace(/\s+/g, "-") || mcp.id}`}>
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm">
            {mcp.logo ? (
              <Image
                src={mcp.logo}
                alt={displayName}
                width={32}
                height={32}
                className="rounded-lg"
              />
            ) : (
              <span className="text-sm font-semibold text-slate-300">{initials}</span>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-100 line-clamp-1">
                {displayName}
              </h3>
              {mcp.featured && (
                <span className="shrink-0 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                  Featured
                </span>
              )}
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-slate-400">
              {displayDescription}
            </p>

            {/* Tags */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {mcp.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2 py-0.5 text-[10px] text-slate-200 capitalize"
                >
                  {tag}
                </span>
              ))}
              {mcp.tags.length > 3 && (
                <span className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2 py-0.5 text-[10px] text-slate-400">
                  +{mcp.tags.length - 3}
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                {mcp.authorName && (
                  <span className="truncate">{mcp.authorName}</span>
                )}
                {createdAt && (
                  <span>{createdAt.toLocaleDateString()}</span>
                )}
              </div>
              {mcp.difficulty && (
                <span className="inline-flex items-center rounded-full bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm px-2 py-0.5 text-[10px] text-slate-300">
                  {mcp.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* External Link */}
      {displayUrl && (
        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          <span>View Repository</span>
        </a>
      )}
    </div>
  );
}

