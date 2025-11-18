'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import clsx from 'clsx';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form onSubmit={handleSubmit}>
        <div
          className={clsx(
            'relative rounded-2xl border bg-slate-900/40 backdrop-blur-sm transition-all duration-300',
            isFocused
              ? 'border-sky-500/60 shadow-[0_0_30px_rgba(56,189,248,0.3)] scale-[1.02]'
              : 'border-slate-700/60 shadow-lg hover:border-slate-600'
          )}
        >
          <div className="flex items-center px-6 py-4">
            <Search
              className={clsx(
                'h-6 w-6 transition-colors duration-200',
                isFocused ? 'text-sky-400' : 'text-slate-400'
              )}
            />
            <input
              type="text"
              placeholder="Search prompts, workflows, and tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="ml-4 flex-1 bg-transparent text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="ml-2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            )}
          </div>

          {/* Animated underline */}
          <div
            className={clsx(
              'h-0.5 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 transition-all duration-300',
              isFocused ? 'opacity-100' : 'opacity-0'
            )}
          />
        </div>
      </form>

      {/* Popular tags */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500">Popular:</span>
        {[
          'typescript',
          'react',
          'code-generation',
          'debugging',
          'documentation',
        ].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => router.push(`/search?tags=${tag}`)}
            className="rounded-full bg-slate-800/60 border border-slate-700/40 px-3 py-1 text-slate-300 transition-colors hover:bg-slate-700/60 hover:text-sky-300 hover:border-sky-500/40"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

