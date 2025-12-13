// components/home/modernization-section.tsx
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type PromptLike = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
};

type ModernizationSectionProps = {
  prompts: PromptLike[];
};

export function ModernizationSection({
  prompts,
}: ModernizationSectionProps) {
  return (
    <section className="mt-20 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950/80 via-slate-950 to-slate-950/90 px-6 py-10 shadow-[0_0_60px_rgba(15,23,42,0.9)] sm:px-8 lg:px-10">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Modernization & Technical Migration
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-slate-50 sm:text-3xl">
            Use AI to upgrade legacy systems, safely.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-[15px]">
            Curated prompts to help you plan and execute
            framework upgrades, language migrations, dependency updates,
            and large-scale refactors with GitHub Copilot.
          </p>

          {/* Use-case pills */}
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-300">
            {[
              "React / Next.js upgrades",
              "JavaScript → TypeScript",
              "Node & runtime upgrades",
              "Dependency modernization",
              "Legacy monolith refactors",
              "SQL & schema migrations",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1"
              >
                {label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <button
              onClick={() => {
                const element = document.getElementById('modernization-prompts');
                if (element) {
                  const yOffset = -80; // Offset for fixed header
                  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 font-medium text-slate-950 hover:bg-sky-400 transition-colors"
            >
              Browse modernization prompts
              <span className="ml-1 text-xs">↓</span>
            </button>
            <Link
              href="/prompts?tags=modernization"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-200 hover:border-slate-500 transition-colors"
            >
              View all prompts
            </Link>
          </div>
        </div>

        {/* Summary stats / reassurance */}
        <div className="mt-4 grid w-full max-w-xs grid-cols-2 gap-3 text-xs text-slate-300 md:mt-0">
          <StatCard label="Modernization prompts" value={`${prompts.length}+`} />
          <StatCard label="Focus: production apps" value="Real-world use" />
          <StatCard label="Best for" value="Teams & codebases" />
          <StatCard label="Safe upgrades" value="Step-by-step" />
        </div>
      </div>

      {/* Content rails */}
      <div className="mt-10 space-y-8">
        {/* Prompts rail */}
        <section id="modernization-prompts">
          <RailHeader
            title="Modernization Prompts"
            subtitle="High-signal prompt patterns for Copilot to refactor, upgrade, and clean up code at scale."
            href="/modernization/prompts"
          />
          <HorizontalRail>
            {prompts.length === 0 && (
              <EmptyRailPlaceholder kind="prompts" />
            )}
            {prompts.map((prompt) => (
              <MiniPromptCard key={prompt.id} prompt={prompt} />
            ))}
          </HorizontalRail>
        </section>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-3">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-50">{value}</div>
    </div>
  );
}

function RailHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100 sm:text-base">
          {title}
        </h3>
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="text-[11px] font-medium text-sky-400 hover:text-sky-300"
      >
        View all →
      </Link>
    </div>
  );
}

function HorizontalRail({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 overflow-x-auto pb-1">
      <div className="flex min-w-full gap-3">
        {children}
      </div>
    </div>
  );
}

function EmptyRailPlaceholder({ kind }: { kind: "prompts" }) {
  return (
    <div className="flex h-24 flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-4 text-xs text-slate-500">
      No {kind} tagged for modernization yet. Seed a few and this rail will
      showcase them automatically.
    </div>
  );
}

/* --- Mini cards (lightweight, homepage-optimized) --- */

function MiniPromptCard({ prompt }: { prompt: PromptLike }) {
  return (
    <Link
      href={`/prompts/${prompt.slug}`}
      className="group flex w-72 flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs transition hover:border-sky-500/70 hover:bg-slate-900"
    >
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        Prompt
      </div>
      <h4 className="line-clamp-2 text-[13px] font-semibold text-slate-50 group-hover:text-sky-200">
        {prompt.title}
      </h4>
      <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
        {prompt.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1">
        {prompt.tags.slice(0, 3).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </Link>
  );
}


function Badge({
  children,
  subtle,
}: {
  children: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px]",
        subtle
          ? "border border-slate-700 bg-slate-900/80 text-slate-300"
          : "border border-slate-700 bg-slate-900/80 text-slate-200"
      )}
    >
      {children}
    </span>
  );
}


