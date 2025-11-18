// lib/search.ts
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';
import type { SearchResults, SearchType, Difficulty } from './search-types';

type SearchOptions = {
  query: string;
  type?: SearchType;
  difficulty?: Difficulty | 'ALL';
  limitPerSection?: number;
};

export async function performSearch({
  query,
  type = 'all',
  difficulty = 'ALL',
  limitPerSection = 20,
}: SearchOptions): Promise<SearchResults> {
  const q = query.trim();

  const baseWhere = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
          { content: { contains: q, mode: 'insensitive' as const } },
          { tags: { has: q.toLowerCase() } },
        ],
      }
    : {};

  const difficultyFilter =
    difficulty === 'ALL' ? {} : { difficulty: { equals: difficulty } };

  const [prompts, workflows, tools] = await Promise.all([
    type === 'all' || type === 'prompt'
      ? db.prompt.findMany({
          where: { ...baseWhere, ...difficultyFilter, status: ContentStatus.APPROVED },
          take: limitPerSection,
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    type === 'all' || type === 'workflow'
      ? db.workflow.findMany({
          where: { ...baseWhere, ...difficultyFilter, status: ContentStatus.APPROVED },
          take: limitPerSection,
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    type === 'all' || type === 'tool'
      ? db.tool.findMany({
          where: { ...baseWhere, ...difficultyFilter, status: ContentStatus.APPROVED },
          take: limitPerSection,
          orderBy: [
            { featured: 'desc' }, // featured tools first
            { createdAt: 'desc' },
          ],
        })
      : Promise.resolve([]),
  ]);

  return {
    prompts: prompts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description || '',
      difficulty: p.difficulty,
      type: 'prompt' as const,
    })),
    workflows: workflows.map((w) => ({
      id: w.id,
      title: w.title,
      slug: w.slug,
      description: w.description || '',
      difficulty: w.difficulty,
      type: 'workflow' as const,
    })),
    tools: tools.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      description: t.shortDescription || t.description || '',
      difficulty: t.difficulty,
      type: 'tool' as const,
    })),
  };
}

