"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import clsx from "clsx";
import { FavoriteButton } from "@/components/favorites/favorite-button";

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
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition duration-150",
        "hover:border-primary/40 hover:shadow-[0_0_18px_rgba(59,130,246,0.25)] dark:hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:scale-[1.01] cursor-pointer",
        mcp.featured && "ring-2 ring-primary/20"
      )}
    >
      <Link href={`/mcps/${mcp.slug || mcp.title?.toLowerCase().replace(/\s+/g, "-") || mcp.id}`}>
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted border border-border backdrop-blur-sm">
            {mcp.logo ? (
              <Image
                src={mcp.logo}
                alt={displayName}
                width={32}
                height={32}
                className="rounded-lg"
                loading="lazy"
                unoptimized={mcp.logo.startsWith('http')}
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{initials}</span>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-card-foreground line-clamp-1">
                {displayName}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                {mcp.featured && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Featured
                  </span>
                )}
                <div onClick={(e) => e.preventDefault()} className="relative z-10">
                  <FavoriteButton targetId={mcp.id} targetType="MCP" size="sm" />
                </div>
              </div>
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {displayDescription}
            </p>

            {/* Tags */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {mcp.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-muted border border-border backdrop-blur-sm px-2 py-0.5 text-[10px] text-muted-foreground capitalize"
                >
                  {tag}
                </span>
              ))}
              {mcp.tags.length > 3 && (
                <span className="inline-flex items-center rounded-full bg-muted border border-border backdrop-blur-sm px-2 py-0.5 text-[10px] text-muted-foreground">
                  +{mcp.tags.length - 3}
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
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          <span>View Repository</span>
        </a>
      )}
    </div>
  );
}

