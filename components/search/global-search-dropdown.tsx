// components/search/global-search-dropdown.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { SearchResults, SearchType } from "@/lib/search-types";
import { highlightMatch } from "@/lib/search-types";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

type GlobalSearchProps = {
  initialQuery?: string;
};

type FlattenedResult = {
  id: string;
  title: string;
  description: string;
  type: "prompt" | "workflow" | "tool";
  slug: string;
};

export function GlobalSearchDropdown({ initialQuery = "" }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [searchType] = useState<SearchType>("all");
  const debouncedQuery = useDebouncedValue(query, 250);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Flatten results for keyboard navigation
  const flatResults: FlattenedResult[] = useMemo(() => {
    if (!results) return [];
    return [
      ...results.prompts,
      ...results.workflows,
      ...results.tools,
    ].map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      slug: r.slug,
    }));
  }, [results]);

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
        setOpen(true);
        setActiveIndex(data.results ? 0 : -1);
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
  }, [debouncedQuery, searchType]);

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

  const goToResult = (result: FlattenedResult) => {
    setOpen(false);
    setActiveIndex(-1);

    if (result.type === "prompt") {
      router.push(`/prompts/${result.slug}`);
    } else if (result.type === "workflow") {
      router.push(`/workflows/${result.slug}`);
    } else {
      router.push(`/tools/${result.slug}`);
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
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  const hasResults =
    results &&
    (results.prompts.length ||
      results.workflows.length ||
      results.tools.length);

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
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search prompts, workflows, tools..."
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
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/95 p-2 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <SearchDropdownSection
            label="Prompts"
            icon="✨"
            items={results!.prompts}
            query={debouncedQuery}
            flatResults={flatResults}
            activeIndex={activeIndex}
            offset={0}
            onClick={goToResult}
          />
          <SearchDropdownSection
            label="Workflows"
            icon="⚙️"
            items={results!.workflows}
            query={debouncedQuery}
            flatResults={flatResults}
            activeIndex={activeIndex}
            offset={results!.prompts.length}
            onClick={goToResult}
          />
          <SearchDropdownSection
            label="Tools"
            icon="🔧"
            items={results!.tools}
            query={debouncedQuery}
            flatResults={flatResults}
            activeIndex={activeIndex}
            offset={results!.prompts.length + results!.workflows.length}
            onClick={goToResult}
          />
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
    type: "prompt" | "workflow" | "tool";
    difficulty: any;
  }[];
  query: string;
  flatResults: FlattenedResult[];
  activeIndex: number;
  offset: number;
  onClick: (item: FlattenedResult) => void;
};

function SearchDropdownSection({
  label,
  icon,
  items,
  query,
  flatResults,
  activeIndex,
  offset,
  onClick,
}: SectionProps) {
  if (!items.length) return null;

  return (
    <div className="mb-1 rounded-xl bg-slate-900/60 p-2">
      <div className="mb-1 flex items-center justify-between px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        <span>
          {icon} {label}
        </span>
        <span>{items.length}</span>
      </div>
      <ul className="space-y-1">
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
    </div>
  );
}

