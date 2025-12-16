'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { InstructionCard } from "@/components/instructions/instruction-card";
import { Loader2, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InstructionWithAuthor } from '@/components/instructions/instruction-card';

const GITHUB_REPO_URL = 'https://github.com/eddybenchek/copilothub';

export default function InstructionsPage() {
  const [instructions, setInstructions] = useState<InstructionWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchInstructions = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/instructions?offset=${currentOffset}&limit=20`);
      const data = await response.json();
      
      if (reset) {
        setInstructions(data.instructions || []);
      } else {
        setInstructions(prev => [...prev, ...(data.instructions || [])]);
      }
      
      setHasMore(data.hasMore || false);
      setOffset(data.nextOffset || currentOffset + (data.instructions?.length || 0));
    } catch (error) {
      console.error('Error fetching instructions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchInstructions(true);
  }, []);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchInstructions(false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loading, loadingMore, fetchInstructions]);

  const featuredCount = instructions.filter(i => i.featured).length;
  const languageCount = new Set(instructions.map(i => i.language).filter(Boolean)).size;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-50">Copilot Instructions</h1>
            <p className="text-slate-400">
              Comprehensive coding standards and best practices that apply to specific file patterns
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <a 
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              Contribute on GitHub
            </a>
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="mb-8 flex flex-wrap gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-2">
          <div className="text-2xl font-bold text-slate-50">{instructions.length}</div>
          <div className="text-xs text-slate-400">Total Instructions</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-2">
          <div className="text-2xl font-bold text-slate-50">{featuredCount}</div>
          <div className="text-xs text-slate-400">Featured</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-2">
          <div className="text-2xl font-bold text-slate-50">{languageCount}</div>
          <div className="text-xs text-slate-400">Languages</div>
        </div>
      </div>

      {/* Instructions Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400 mb-4" />
          <p className="text-slate-400">Loading instructions...</p>
        </div>
      ) : instructions.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-400">No instructions found. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {instructions.map((instruction) => (
              <InstructionCard key={instruction.id} instruction={instruction} />
            ))}
          </div>
          
          {hasMore && (
            <div ref={loadMoreRef} className="mt-8 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

