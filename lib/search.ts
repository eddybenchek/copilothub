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

  // Base where clause for models with content field
  const baseWhereWithContent = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
          { content: { contains: q, mode: 'insensitive' as const } },
          { tags: { has: q.toLowerCase() } },
        ],
      }
    : {};

  // Base where clause for models without content field
  const baseWhereWithoutContent = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
          { tags: { has: q.toLowerCase() } },
        ],
      }
    : {};

  // Where clause for migrations (includes fromStack and toStack)
  const migrationWhere = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
          { fromStack: { contains: q, mode: 'insensitive' as const } },
          { toStack: { contains: q, mode: 'insensitive' as const } },
          { tags: { has: q.toLowerCase() } },
        ],
      }
    : {};

  // Where clause for recipes (includes codeSample)
  const recipeWhere = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
          { codeSample: { contains: q, mode: 'insensitive' as const } },
          { language: { contains: q, mode: 'insensitive' as const } },
          { framework: { contains: q, mode: 'insensitive' as const } },
          { tags: { has: q.toLowerCase() } },
        ],
      }
    : {};

  const difficultyFilter =
    difficulty === 'ALL' ? {} : { difficulty: { equals: difficulty } };

  const [prompts, workflows, tools, recipes, migrations, paths, mcps, instructions, agents] = await Promise.all([
    type === 'all' || type === 'prompt'
      ? db.prompt.findMany({
          where: { ...baseWhereWithContent, ...difficultyFilter, status: ContentStatus.APPROVED },
          take: limitPerSection,
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    type === 'all' || type === 'workflow'
      ? db.workflow.findMany({
          where: { ...baseWhereWithContent, ...difficultyFilter, status: ContentStatus.APPROVED },
          take: limitPerSection,
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    type === 'all' || type === 'tool'
      ? db.tool.findMany({
          where: { ...baseWhereWithContent, ...difficultyFilter, status: ContentStatus.APPROVED },
          take: limitPerSection,
          orderBy: [
            { featured: 'desc' }, // featured tools first
            { createdAt: 'desc' },
          ],
        })
      : Promise.resolve([]),
    type === 'all' || type === 'recipe'
      ? db.codeRecipe.findMany({
          where: {
            ...recipeWhere,
            ...difficultyFilter,
            status: ContentStatus.APPROVED,
          },
          take: limitPerSection,
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    type === 'all' || type === 'migration'
      ? db.migrationGuide.findMany({
          where: {
            ...migrationWhere,
            ...difficultyFilter,
            status: ContentStatus.APPROVED,
          },
          take: limitPerSection,
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    type === 'all' || type === 'path'
      ? db.learningPath.findMany({
          where: {
            ...baseWhereWithoutContent,
            ...(difficulty === 'ALL' ? {} : { level: { equals: difficulty } }),
            status: ContentStatus.APPROVED,
          },
          take: limitPerSection,
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    type === 'all' || type === 'mcp'
      ? (db as any).mcpServer.findMany({
          where: {
            ...baseWhereWithoutContent,
            ...difficultyFilter,
            status: ContentStatus.APPROVED,
          },
          take: limitPerSection,
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' },
          ],
        })
      : Promise.resolve([]),
    type === 'all' || type === 'instruction'
      ? db.instruction.findMany({
          where: {
            ...baseWhereWithoutContent,
            ...difficultyFilter,
            status: ContentStatus.APPROVED,
          },
          take: limitPerSection,
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' },
          ],
        })
      : Promise.resolve([]),
    type === 'all' || type === 'agent'
      ? db.agent.findMany({
          where: {
            ...baseWhereWithContent,
            ...difficultyFilter,
            status: ContentStatus.APPROVED,
          },
          take: limitPerSection,
          orderBy: [
            { featured: 'desc' },
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
    recipes: recipes.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description || '',
      difficulty: r.difficulty,
      type: 'recipe' as const,
    })),
    migrations: migrations.map((m) => ({
      id: m.id,
      title: m.title,
      slug: m.slug,
      description: m.description || '',
      difficulty: m.difficulty,
      type: 'migration' as const,
    })),
    paths: paths.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description || '',
      difficulty: p.level,
      type: 'path' as const,
    })),
    mcps: mcps.map((m: any) => {
      // Extract just the repo name from owner/repo format and format it
      const rawName = m.title;
      const repoName = rawName.includes('/') ? rawName.split('/')[1] : rawName;
      const displayName = repoName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char: string) => char.toUpperCase());
      
      return {
        id: m.id,
        title: displayName,
        slug: m.slug,
        description: m.description || '',
        difficulty: m.difficulty,
        type: 'mcp' as const,
      };
    }),
    instructions: instructions.map((i) => ({
      id: i.id,
      title: i.title,
      slug: i.slug,
      description: i.description || '',
      difficulty: i.difficulty,
      type: 'instruction' as const,
    })),
    agents: agents.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      description: a.description || '',
      difficulty: a.difficulty,
      type: 'agent' as const,
    })),
  };
}

