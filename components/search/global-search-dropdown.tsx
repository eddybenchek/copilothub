// components/search/global-search-dropdown.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { SearchResults, SearchType } from "@/lib/search-types";
import { highlightMatch } from "@/lib/search-types";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

// Caps for preview suggestions in dropdown
const MAX_PROMPT_SUGGESTIONS = 5;
const MAX_WORKFLOW_SUGGESTIONS = 5;
const MAX_TOOL_SUGGESTIONS = 3;
const MAX_RECIPE_SUGGESTIONS = 5;
const MAX_MIGRATION_SUGGESTIONS = 5;
const MAX_PATH_SUGGESTIONS = 3;
const MAX_MCP_SUGGESTIONS = 5;

type GlobalSearchProps = {
  initialQuery?: string;
};

type FlattenedResult = {
  id: string;
  title: string;
  description: string;
  type: "prompt" | "workflow" | "tool" | "recipe" | "migration" | "path" | "mcp";
  slug: string;
};

export function GlobalSearchDropdown({ initialQuery = "" }: GlobalSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(initialQuery);
  const [searchType] = useState<SearchType>("all");
  const debouncedQuery = useDebouncedValue(query, 250);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [hasUserTyped, setHasUserTyped] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Slice results for preview (memoized to avoid recreating on every render)
  const promptPreview = useMemo(() => results?.prompts.slice(0, MAX_PROMPT_SUGGESTIONS) ?? [], [results?.prompts]);
  const workflowPreview = useMemo(() => results?.workflows.slice(0, MAX_WORKFLOW_SUGGESTIONS) ?? [], [results?.workflows]);
  const toolPreview = useMemo(() => results?.tools.slice(0, MAX_TOOL_SUGGESTIONS) ?? [], [results?.tools]);
  const recipePreview = useMemo(() => results?.recipes?.slice(0, MAX_RECIPE_SUGGESTIONS) ?? [], [results?.recipes]);
  const migrationPreview = useMemo(() => results?.migrations?.slice(0, MAX_MIGRATION_SUGGESTIONS) ?? [], [results?.migrations]);
  const pathPreview = useMemo(() => results?.paths?.slice(0, MAX_PATH_SUGGESTIONS) ?? [], [results?.paths]);
  const mcpPreview = useMemo(() => results?.mcps?.slice(0, MAX_MCP_SUGGESTIONS) ?? [], [results?.mcps]);

  // Flatten preview results for keyboard navigation
  const flatResults: FlattenedResult[] = useMemo(() => {
    return [
      ...promptPreview,
      ...workflowPreview,
      ...toolPreview,
      ...recipePreview,
      ...migrationPreview,
      ...pathPreview,
      ...mcpPreview,
    ].map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      slug: r.slug,
    }));
  }, [promptPreview, workflowPreview, toolPreview, recipePreview, migrationPreview, pathPreview, mcpPreview]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({
      q: debouncedQuery,
      type: searchType,
    });

    fetch(`/api/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setResults(data.results);
        // Only open dropdown if user has started typing
        if (hasUserTyped) {
          setOpen(true);
          setActiveIndex(data.results ? 0 : -1);
        }
      })
      .catch((err) => {
        console.error("Search error", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchType, hasUserTyped]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on navigation (URL change)
  useEffect(() => {
    setOpen(false);
    setActiveIndex(-1);
    setHasUserTyped(false);
  }, [pathname, searchParams]);

  // Close dropdown helper
  const closeDropdown = () => {
    setOpen(false);
    setActiveIndex(-1);
    setHasUserTyped(false);
    inputRef.current?.blur();
  };

  const goToResult = (result: FlattenedResult) => {
    closeDropdown();

    if (result.type === "prompt") {
      router.push(`/prompts/${result.slug}`);
    } else if (result.type === "workflow") {
      router.push(`/workflows/${result.slug}`);
    } else if (result.type === "tool") {
      router.push(`/tools/${result.slug}`);
    } else if (result.type === "recipe") {
      router.push(`/recipes/${result.slug}`);
    } else if (result.type === "migration") {
      router.push(`/migrations/${result.slug}`);
    } else if (result.type === "path") {
      router.push(`/paths/${result.slug}`);
    } else if (result.type === "mcp") {
      router.push(`/mcps/${result.slug}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!flatResults.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) =>
        prev < flatResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : flatResults.length - 1
      );
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < flatResults.length) {
        e.preventDefault();
        goToResult(flatResults[activeIndex]);
      } else {
        // Fallback: go to full search page
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (open) {
        setOpen(false);
        setActiveIndex(-1);
      } else {
        setQuery("");
      }
    }
  };

  const handleSubmitFull = (e: React.FormEvent) => {
    e.preventDefault();
    closeDropdown();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const hasResults = useMemo(() => {
    return (
      (results?.prompts.length ?? 0) > 0 ||
      (results?.workflows.length ?? 0) > 0 ||
      (results?.tools.length ?? 0) > 0 ||
      (results?.recipes?.length ?? 0) > 0 ||
      (results?.migrations?.length ?? 0) > 0 ||
      (results?.paths?.length ?? 0) > 0 ||
      (results?.mcps?.length ?? 0) > 0
    );
  }, [results]);

  const totalCount = useMemo(() => {
    return (
      (results?.prompts.length ?? 0) +
      (results?.workflows.length ?? 0) +
      (results?.tools.length ?? 0) +
      (results?.recipes?.length ?? 0) +
      (results?.migrations?.length ?? 0) +
      (results?.paths?.length ?? 0) +
      (results?.mcps?.length ?? 0)
    );
  }, [results]);

  // Handlers for "View all" buttons
  const handleViewAllResults = () => {
    closeDropdown();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleViewAllPrompts = () => {
    closeDropdown();
    router.push(`/search?q=${encodeURIComponent(query)}&type=prompt`);
  };

  const handleViewAllWorkflows = () => {
    closeDropdown();
    router.push(`/search?q=${encodeURIComponent(query)}&type=workflow`);
  };

  const handleViewAllTools = () => {
    closeDropdown();
    router.push(`/search?q=${encodeURIComponent(query)}&type=tool`);
  };

  const handleViewAllRecipes = () => {
    closeDropdown();
    router.push(`/search?q=${encodeURIComponent(query)}&type=recipe`);
  };

  const handleViewAllMigrations = () => {
    closeDropdown();
    router.push(`/search?q=${encodeURIComponent(query)}&type=migration`);
  };

  const handleViewAllPaths = () => {
    closeDropdown();
    router.push(`/search?q=${encodeURIComponent(query)}&type=path`);
  };

  const handleViewAllMcps = () => {
    closeDropdown();
    router.push(`/search?q=${encodeURIComponent(query)}&type=mcp`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl">
      <form onSubmit={handleSubmitFull}>
        <div
          className={cn(
            "flex items-center rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm shadow-[0_0_0_1px_rgba(56,189,248,0.0)] transition-all duration-300",
            "focus-within:shadow-[0_0_20px_rgba(59,130,246,0.3)] focus-within:border-sky-500 focus-within:scale-[1.01]"
          )}
        >
          <Search className="mr-2 h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!hasUserTyped) setHasUserTyped(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search prompts, workflows, tools, recipes, migrations, paths, MCPs..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(null);
                setOpen(false);
                setActiveIndex(-1);
                setHasUserTyped(false);
                inputRef.current?.focus();
              }}
              className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </form>

      {open && hasResults && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-800/80 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
          {/* Scrollable content container */}
          <div className="relative max-h-[60vh] overflow-y-auto">
            <SearchDropdownSection
              label="Prompts"
              icon="✨"
              items={promptPreview}
              totalCount={results!.prompts.length}
              query={debouncedQuery}
              flatResults={flatResults}
              activeIndex={activeIndex}
              offset={0}
              onClick={goToResult}
              onViewAll={handleViewAllPrompts}
            />
            <SearchDropdownSection
              label="Workflows"
              icon="⚙️"
              items={workflowPreview}
              totalCount={results!.workflows.length}
              query={debouncedQuery}
              flatResults={flatResults}
              activeIndex={activeIndex}
              offset={promptPreview.length}
              onClick={goToResult}
              onViewAll={handleViewAllWorkflows}
            />
            <SearchDropdownSection
              label="Tools"
              icon="🔧"
              items={toolPreview}
              totalCount={results!.tools.length}
              query={debouncedQuery}
              flatResults={flatResults}
              activeIndex={activeIndex}
              offset={promptPreview.length + workflowPreview.length}
              onClick={goToResult}
              onViewAll={handleViewAllTools}
            />
            <SearchDropdownSection
              label="Recipes"
              icon="📝"
              items={recipePreview}
              totalCount={results!.recipes?.length ?? 0}
              query={debouncedQuery}
              flatResults={flatResults}
              activeIndex={activeIndex}
              offset={promptPreview.length + workflowPreview.length + toolPreview.length}
              onClick={goToResult}
              onViewAll={handleViewAllRecipes}
            />
            <SearchDropdownSection
              label="Migrations"
              icon="🔄"
              items={migrationPreview}
              totalCount={results!.migrations?.length ?? 0}
              query={debouncedQuery}
              flatResults={flatResults}
              activeIndex={activeIndex}
              offset={promptPreview.length + workflowPreview.length + toolPreview.length + recipePreview.length}
              onClick={goToResult}
              onViewAll={handleViewAllMigrations}
            />
            <SearchDropdownSection
              label="Paths"
              icon="🛤️"
              items={pathPreview}
              totalCount={results!.paths?.length ?? 0}
              query={debouncedQuery}
              flatResults={flatResults}
              activeIndex={activeIndex}
              offset={promptPreview.length + workflowPreview.length + toolPreview.length + recipePreview.length + migrationPreview.length}
              onClick={goToResult}
              onViewAll={handleViewAllPaths}
            />
            <SearchDropdownSection
              label="MCPs"
              icon="🔌"
              items={mcpPreview}
              totalCount={results!.mcps?.length ?? 0}
              query={debouncedQuery}
              flatResults={flatResults}
              activeIndex={activeIndex}
              offset={promptPreview.length + workflowPreview.length + toolPreview.length + recipePreview.length + migrationPreview.length + pathPreview.length}
              onClick={goToResult}
              onViewAll={handleViewAllMcps}
            />
            
            {/* Bottom fade gradient */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950/95 to-transparent" />
          </div>

          {/* View all results button */}
          {totalCount > 0 && (
            <button
              type="button"
              onClick={handleViewAllResults}
              className="w-full border-t border-slate-800/70 px-4 py-3 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 flex items-center justify-center gap-2 transition-colors"
            >
              <span>View all {totalCount} results for</span>
              <span className="font-medium text-slate-100">&ldquo;{query}&rdquo;</span>
              <span>→</span>
            </button>
          )}
        </div>
      )}

      {open && !loading && !hasResults && debouncedQuery && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/95 p-4 text-sm text-slate-400 backdrop-blur-sm">
          <div className="font-medium text-slate-200">
            No results for &ldquo;{debouncedQuery}&rdquo;
          </div>
          <ul className="mt-2 list-disc pl-5 text-xs text-slate-400 space-y-1">
            <li>Try a different keyword or tag (e.g. &ldquo;typescript&rdquo;, &ldquo;api&rdquo;)</li>
            <li>Remove difficulty filters on the search page</li>
            <li>Browse all prompts or tools from the navigation</li>
          </ul>
        </div>
      )}
    </div>
  );
}

type SectionProps = {
  label: string;
  icon: string;
  items: {
    id: string;
    title: string;
    slug: string;
    description: string;
    type: "prompt" | "workflow" | "tool" | "recipe" | "migration" | "path" | "mcp";
    difficulty: any;
  }[];
  totalCount: number;
  query: string;
  flatResults: FlattenedResult[];
  activeIndex: number;
  offset: number;
  onClick: (item: FlattenedResult) => void;
  onViewAll: () => void;
};

function SearchDropdownSection({
  label,
  icon,
  items,
  totalCount,
  query,
  flatResults,
  activeIndex,
  offset,
  onClick,
  onViewAll,
}: SectionProps) {
  if (!items.length) return null;

  const hasMore = totalCount > items.length;

  return (
    <div>
      {/* Sticky section header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 border-b border-slate-800/70 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-medium">
            {icon} {label}
          </span>
          <span className="text-[10px] text-slate-600">{totalCount}</span>
        </div>
      </div>

      {/* Items list */}
      <ul className="space-y-0.5 px-2 py-2">
        {items.map((item, idx) => {
          const globalIndex = offset + idx;
          const isActive = activeIndex === globalIndex;

          const { parts } = highlightMatch(item.title, query);

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onClick(flatResults[globalIndex])}
                className={cn(
                  "flex w-full flex-col items-start rounded-lg px-2 py-1.5 text-left text-xs transition",
                  isActive
                    ? "bg-sky-600/20 text-sky-100"
                    : "text-slate-200 hover:bg-slate-800/80"
                )}
              >
                <div className="font-medium">
                  {parts.map((p, i) => (
                    <span
                      key={i}
                      className={p.match ? "text-sky-400" : undefined}
                    >
                      {p.text}
                    </span>
                  ))}
                </div>
                <div className="line-clamp-1 text-[11px] text-slate-400">
                  {item.description}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* View all link for this section if there are more items */}
      {hasMore && (
        <button
          type="button"
          onClick={onViewAll}
          className="w-full px-3 pb-2 pt-1 text-[11px] text-slate-500 hover:text-sky-400 text-left transition-colors"
        >
          View all {totalCount} {label.toLowerCase()} →
        </button>
      )}
    </div>
  );
}

