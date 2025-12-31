import { db } from './db';
import { ContentStatus, Instruction, Agent, McpServer } from '@prisma/client';
import type { InstructionWithAuthor, AgentWithAuthor, McpWithAuthor, PromptWithAuthor, ToolWithAuthor } from './types';

// Prompt helpers
export async function getLatestPrompts(limit = 6) {
  return await db.prompt.findMany({
    where: { status: ContentStatus.APPROVED },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getPromptBySlug(slug: string) {
  return await db.prompt.findUnique({
    where: { slug },
    include: {
      author: true,
      votes: true,
    },
  });
}

export async function getAllPrompts() {
  return await db.prompt.findMany({
    where: { status: ContentStatus.APPROVED },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Tool helpers
export async function getLatestTools(limit = 6) {
  return await db.tool.findMany({
    where: { status: ContentStatus.APPROVED },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getToolBySlug(slug: string) {
  return await db.tool.findUnique({
    where: { slug },
    include: {
      author: true,
      votes: true,
    },
  });
}

export async function getAllTools() {
  return await db.tool.findMany({
    where: { status: ContentStatus.APPROVED },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Vote helpers
// MCP helpers
export async function getMcpBySlug(slug: string) {
  return await db.mcpServer.findUnique({
    where: { slug },
    include: {
      author: true,
      votes: true,
    },
  });
}

export async function getAllMcps() {
  return await db.mcpServer.findMany({
    where: { status: ContentStatus.APPROVED },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVoteCount(targetId: string) {
  const votes = await db.vote.findMany({
    where: { targetId },
  });
  
  return votes.reduce((sum, vote) => sum + vote.value, 0);
}

export async function getUserVote(userId: string, targetId: string) {
  return await db.vote.findFirst({
    where: {
      userId,
      targetId,
    },
  });
}

// Category helpers
export async function getPromptsByCategory(category: string, limit = 8) {
  return await db.prompt.findMany({
    where: {
      status: ContentStatus.APPROVED,
      tags: {
        has: category.toLowerCase(),
      },
    },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getTopCategories(limit = 6) {
  // Common technology categories to check
  const commonCategories = [
    'typescript',
    'react',
    'python',
    'javascript',
    'nextjs',
    'nodejs',
    'vue',
    'angular',
    'django',
    'flask',
    'express',
    'nestjs',
    'tailwind',
    'sql',
    'mongodb',
    'postgresql',
    'docker',
    'kubernetes',
    'aws',
    'terraform',
  ];

  // Get all approved prompts with their tags
  const allPrompts = await db.prompt.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { tags: true },
  });

  // Count prompts per category
  const categoryCounts: Record<string, number> = {};
  
  allPrompts.forEach((prompt) => {
    prompt.tags.forEach((tag) => {
      const normalizedTag = tag.toLowerCase();
      if (commonCategories.includes(normalizedTag)) {
        categoryCounts[normalizedTag] = (categoryCounts[normalizedTag] || 0) + 1;
      }
    });
  });

  // Sort by count and return top categories
  const sortedCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([category]) => category);

  return sortedCategories;
}

export async function getLatestContent(
  type: 'instruction',
  limit?: number
): Promise<InstructionWithAuthor[]>;
export async function getLatestContent(
  type: 'agent',
  limit?: number
): Promise<AgentWithAuthor[]>;
export async function getLatestContent(
  type: 'mcp',
  limit?: number
): Promise<McpWithAuthor[]>;
export async function getLatestContent(
  type: 'instruction' | 'agent' | 'mcp',
  limit = 6
): Promise<InstructionWithAuthor[] | AgentWithAuthor[] | McpWithAuthor[]> {
  switch (type) {
    case 'instruction':
      return await db.instruction.findMany({
        where: { status: ContentStatus.APPROVED },
        include: {
          author: true,
          votes: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }) as InstructionWithAuthor[];
    case 'agent':
      return await db.agent.findMany({
        where: { status: ContentStatus.APPROVED },
        include: {
          author: true,
          votes: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }) as AgentWithAuthor[];
    case 'mcp':
      return await (db as any).mcpServer.findMany({
        where: { status: ContentStatus.APPROVED },
        include: {
          author: true,
          votes: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }) as McpWithAuthor[];
    default:
      return [];
  }
}

// Server-side pagination functions for SSR

// Prompts pagination
export async function getPromptsPaginated(options: {
  offset?: number;
  limit?: number;
  category?: string;
  query?: string;
}) {
  const offset = options.offset || 0;
  const limit = Math.min(options.limit || 20, 50);
  const category = options.category;
  const query = options.query;

  // Build where clause
  const whereConditions: any[] = [{ status: ContentStatus.APPROVED }];

  // Add category filter if provided
  if (category && category !== 'all') {
    // Try both category:${category} format and direct tag match
    // This handles both category tags (category:code-generation) and language/tech tags (javascript, react)
    whereConditions.push({
      OR: [
        { tags: { has: `category:${category}` } },
        { tags: { has: category.toLowerCase() } },
      ],
    });
  }

  // Add search query filter if provided
  if (query && query.trim()) {
    const searchTerm = query.trim();
    whereConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' as const } },
        { description: { contains: searchTerm, mode: 'insensitive' as const } },
        { content: { contains: searchTerm, mode: 'insensitive' as const } },
        { tags: { has: searchTerm.toLowerCase() } },
      ],
    });
  }

  // Combine all conditions with AND
  const where = whereConditions.length > 1 ? { AND: whereConditions } : whereConditions[0];

  // Optimized query: Only fetch needed fields
  const prompts = await db.prompt.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      content: true,
      tags: true,
      difficulty: true,
      status: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  // Batch fetch vote counts for all prompts in one query
  const promptIds = prompts.map(p => p.id);
  const voteCounts = promptIds.length > 0 ? await db.vote.groupBy({
    by: ['targetId'],
    where: {
      targetId: { in: promptIds },
    },
    _sum: {
      value: true,
    },
  }) : [];

  // Create a map for O(1) lookup
  const voteMap = new Map(
    voteCounts.map(v => [v.targetId, v._sum.value || 0])
  );

  // Attach vote counts to prompts
  const promptsWithVotes = prompts.map(prompt => ({
    ...prompt,
    voteCount: voteMap.get(prompt.id) || 0,
    votes: [], // Empty array for compatibility with existing types
  })) as unknown as PromptWithAuthor[];

  // Check if there are more items
  const hasMore = prompts.length === limit;

  return {
    prompts: promptsWithVotes,
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  };
}

export async function getPromptsCategories() {
  // Fetch only tags from all approved prompts (lightweight query)
  const prompts = await db.prompt.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { tags: true },
  });

  const counts: Record<string, number> = {};
  let total = 0;

  for (const prompt of prompts) {
    total++;
    for (const tag of prompt.tags) {
      const normalizedTag = tag.toLowerCase();
      // Extract category from tags like "category:code-generation"
      if (normalizedTag.startsWith('category:')) {
        const category = normalizedTag.replace('category:', '');
        counts[category] = (counts[category] ?? 0) + 1;
      }
    }
  }

  return { counts, total };
}

// Instructions pagination
export async function getInstructionsPaginated(options: {
  offset?: number;
  limit?: number;
}) {
  const offset = options.offset || 0;
  const limit = Math.min(options.limit || 20, 50);

  // Optimized query: Only fetch needed fields
  const instructions = await db.instruction.findMany({
    where: { status: ContentStatus.APPROVED },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      content: true,
      filePattern: true,
      language: true,
      framework: true,
      scope: true,
      tags: true,
      difficulty: true,
      status: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      featured: true,
      downloads: true,
      views: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
    skip: offset,
  });

  // Batch fetch vote counts
  const instructionIds = instructions.map(i => i.id);
  const voteCounts = instructionIds.length > 0 ? await db.vote.groupBy({
    by: ['targetId'],
    where: {
      targetId: { in: instructionIds },
    },
    _sum: {
      value: true,
    },
  }) : [];

  const voteMap = new Map(
    voteCounts.map(v => [v.targetId, v._sum.value || 0])
  );

  const instructionsWithVotes = instructions.map(instruction => ({
    ...instruction,
    voteCount: voteMap.get(instruction.id) || 0,
    votes: [],
  })) as unknown as InstructionWithAuthor[];

  const hasMore = instructions.length === limit;

  return {
    instructions: instructionsWithVotes,
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  };
}

export async function getInstructionsStats() {
  // Fetch only the fields needed for stats to keep the query lightweight
  const instructions = await db.instruction.findMany({
    where: { status: ContentStatus.APPROVED },
    select: {
      featured: true,
      language: true,
    },
  });

  const total = instructions.length;
  const featured = instructions.filter((i) => i.featured).length;
  const languageSet = new Set(
    instructions
      .map((i) => i.language?.toLowerCase().trim())
      .filter((lang): lang is string => Boolean(lang))
  );

  return {
    total,
    featured,
    languages: languageSet.size,
  };
}

// Tools pagination
export async function getToolsPaginated(options: {
  offset?: number;
  limit?: number;
  category?: string;
  query?: string;
}) {
  const offset = options.offset || 0;
  const limit = Math.min(options.limit || 20, 50);
  const category = options.category;
  const query = options.query;

  // Build where clause
  const whereConditions: any[] = [{ status: ContentStatus.APPROVED }];

  // Add category filter if provided
  if (category && category !== 'all') {
    whereConditions.push({
      tags: {
        has: category.toLowerCase(),
      },
    });
  }

  // Add search query filter if provided
  if (query && query.trim()) {
    const searchTerm = query.trim();
    whereConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' as const } },
        { description: { contains: searchTerm, mode: 'insensitive' as const } },
        { content: { contains: searchTerm, mode: 'insensitive' as const } },
        { tags: { has: searchTerm.toLowerCase() } },
      ],
    });
  }

  // Combine all conditions with AND
  const where = whereConditions.length > 1 ? { AND: whereConditions } : whereConditions[0];

  // Optimized query: Only fetch needed fields
  const tools = await db.tool.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      content: true,
      shortDescription: true,
      tags: true,
      difficulty: true,
      status: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      url: true,
      websiteUrl: true,
      logo: true,
      name: true,
      featured: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  // Batch fetch vote counts
  const toolIds = tools.map(t => t.id);
  const voteCounts = toolIds.length > 0 ? await db.vote.groupBy({
    by: ['targetId'],
    where: {
      targetId: { in: toolIds },
    },
    _sum: {
      value: true,
    },
  }) : [];

  const voteMap = new Map(
    voteCounts.map(v => [v.targetId, v._sum.value || 0])
  );

  const toolsWithVotes = tools.map(tool => ({
    ...tool,
    voteCount: voteMap.get(tool.id) || 0,
    votes: [],
  })) as unknown as ToolWithAuthor[];

  const hasMore = tools.length === limit;

  return {
    tools: toolsWithVotes,
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  };
}

export async function getToolsCategories() {
  // Fetch only tags for approved tools to keep the query lightweight
  const tools = await db.tool.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { tags: true },
  });

  const counts: Record<string, number> = {};
  let total = 0;

  for (const tool of tools) {
    total++;
    for (const tag of tool.tags) {
      const key = tag.toLowerCase();
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }

  return { counts, total };
}

// MCPs pagination
export async function getMcpsPaginated(options: {
  offset?: number;
  limit?: number;
  category?: string;
  query?: string;
}) {
  const offset = options.offset || 0;
  const limit = Math.min(options.limit || 20, 50);
  const category = options.category;
  const query = options.query;

  // Build where clause
  const whereConditions: any[] = [{ status: ContentStatus.APPROVED }];

  // Add category filter if provided
  if (category && category !== 'all') {
    const normalizedCategory = category.toLowerCase();
    whereConditions.push({
      OR: [
        { category: { equals: normalizedCategory, mode: 'insensitive' as const } },
        { tags: { has: normalizedCategory } },
      ],
    });
  }

  // Add search query filter if provided
  if (query && query.trim()) {
    const searchTerm = query.trim();
    whereConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' as const } },
        { description: { contains: searchTerm, mode: 'insensitive' as const } },
        { content: { contains: searchTerm, mode: 'insensitive' as const } },
        { tags: { has: searchTerm.toLowerCase() } },
      ],
    });
  }

  const where = whereConditions.length > 1 ? { AND: whereConditions } : whereConditions[0];

  // Optimized query: Only fetch needed fields
  const mcps = await db.mcpServer.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      content: true,
      shortDescription: true,
      tags: true,
      category: true,
      difficulty: true,
      status: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      githubUrl: true,
      websiteUrl: true,
      logo: true,
      name: true,
      featured: true,
      installCommand: true,
      configExample: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  // Batch fetch vote counts
  const mcpIds = mcps.map(m => m.id);
  const voteCounts = mcpIds.length > 0 ? await db.vote.groupBy({
    by: ['targetId'],
    where: {
      targetId: { in: mcpIds },
    },
    _sum: {
      value: true,
    },
  }) : [];

  const voteMap = new Map(
    voteCounts.map(v => [v.targetId, v._sum.value || 0])
  );

  const mcpsWithVotes = mcps.map(mcp => ({
    ...mcp,
    voteCount: voteMap.get(mcp.id) || 0,
    votes: [],
  })) as unknown as McpWithAuthor[];

  const hasMore = mcps.length === limit;

  return {
    mcps: mcpsWithVotes,
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  };
}

export async function getMcpsStats() {
  // Fetch only category to keep the query lightweight
  const mcps = await db.mcpServer.findMany({
    where: { status: ContentStatus.APPROVED },
    select: {
      category: true,
    },
  });

  const total = mcps.length;
  const counts: Record<string, number> = {};
  const categorySet = new Set<string>();

  for (const mcp of mcps) {
    const category = (mcp.category || 'other').toLowerCase().trim();
    if (!category) continue;
    categorySet.add(category);
    counts[category] = (counts[category] ?? 0) + 1;
  }

  const categories = Array.from(categorySet).sort();

  return { total, categories, counts };
}

// Agents pagination
export async function getAgentsPaginated(options: {
  offset?: number;
  limit?: number;
  category?: string;
}) {
  const offset = options.offset || 0;
  const limit = Math.min(options.limit || 20, 50);
  const category = options.category;

  // Build where clause
  const whereConditions: any[] = [{ status: ContentStatus.APPROVED }];

  // Add category filter if provided
  if (category && category !== 'all') {
    whereConditions.push({
      category,
    });
  }

  const where = whereConditions.length > 1 ? { AND: whereConditions } : whereConditions[0];

  // Optimized query: Only fetch needed fields
  const agents = await db.agent.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      content: true,
      category: true,
      mcpServers: true,
      languages: true,
      frameworks: true,
      tags: true,
      difficulty: true,
      status: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
      featured: true,
      downloads: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
    skip: offset,
  });

  // Batch fetch vote counts
  const agentIds = agents.map(a => a.id);
  const voteCounts = agentIds.length > 0 ? await db.vote.groupBy({
    by: ['targetId'],
    where: {
      targetId: { in: agentIds },
    },
    _sum: {
      value: true,
    },
  }) : [];

  const voteMap = new Map(
    voteCounts.map(v => [v.targetId, v._sum.value || 0])
  );

  const agentsWithVotes = agents.map(agent => ({
    ...agent,
    voteCount: voteMap.get(agent.id) || 0,
    votes: [],
  })) as unknown as AgentWithAuthor[];

  const hasMore = agents.length === limit;

  return {
    agents: agentsWithVotes,
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  };
}

export async function getAgentsStats() {
  // Fetch only the fields needed for stats to keep the query lightweight
  const agents = await db.agent.findMany({
    where: { status: ContentStatus.APPROVED },
    select: {
      category: true,
    },
  });

  const total = agents.length;
  const counts: Record<string, number> = {};
  const categorySet = new Set<string>();

  for (const agent of agents) {
    const category = (agent.category || 'Other').trim();
    if (!category) continue;
    categorySet.add(category);
    counts[category] = (counts[category] ?? 0) + 1;
  }

  const categories = Array.from(categorySet).sort();

  return {
    total,
    categories,
    counts,
  };
}

// Related content helpers - fetch items with shared tags/categories
export async function getRelatedPrompts(currentId: string, tags: string[], limit = 6): Promise<PromptWithAuthor[]> {
  if (tags.length === 0) {
    // If no tags, return latest prompts
    return await getLatestPrompts(limit);
  }

  // Find prompts with at least one matching tag
  const related = await db.prompt.findMany({
    where: {
      status: ContentStatus.APPROVED,
      id: { not: currentId },
      tags: {
        hasSome: tags,
      },
    },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // If we don't have enough, fill with latest
  if (related.length < limit) {
    const additional = await db.prompt.findMany({
      where: {
        status: ContentStatus.APPROVED,
        id: { notIn: [currentId, ...related.map(p => p.id)] },
      },
      include: {
        author: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit - related.length,
    });
    return [...related, ...additional] as PromptWithAuthor[];
  }

  return related as PromptWithAuthor[];
}

export async function getRelatedInstructions(currentId: string, tags: string[], language?: string | null, framework?: string | null, limit = 6): Promise<InstructionWithAuthor[]> {
  const whereConditions: any[] = [
    { status: ContentStatus.APPROVED },
    { id: { not: currentId } },
  ];

  // Prefer items with matching tags, language, or framework
  if (tags.length > 0 || language || framework) {
    const orConditions: any[] = [];
    
    if (tags.length > 0) {
      orConditions.push({ tags: { hasSome: tags } });
    }
    if (language) {
      orConditions.push({ language });
    }
    if (framework) {
      orConditions.push({ framework });
    }

    if (orConditions.length > 0) {
      whereConditions.push({ OR: orConditions });
    }
  }

  const related = await db.instruction.findMany({
    where: { AND: whereConditions },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // If we don't have enough, fill with latest
  if (related.length < limit) {
    const additional = await db.instruction.findMany({
      where: {
        status: ContentStatus.APPROVED,
        id: { notIn: [currentId, ...related.map(i => i.id)] },
      },
      include: {
        author: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit - related.length,
    });
    return [...related, ...additional] as InstructionWithAuthor[];
  }

  return related as InstructionWithAuthor[];
}

export async function getRelatedAgents(currentId: string, tags: string[], category?: string | null, languages?: string[], frameworks?: string[], limit = 6): Promise<AgentWithAuthor[]> {
  const whereConditions: any[] = [
    { status: ContentStatus.APPROVED },
    { id: { not: currentId } },
  ];

  // Prefer items with matching tags, category, languages, or frameworks
  if (tags.length > 0 || category || (languages && languages.length > 0) || (frameworks && frameworks.length > 0)) {
    const orConditions: any[] = [];
    
    if (tags.length > 0) {
      orConditions.push({ tags: { hasSome: tags } });
    }
    if (category) {
      orConditions.push({ category });
    }
    if (languages && languages.length > 0) {
      orConditions.push({ languages: { hasSome: languages } });
    }
    if (frameworks && frameworks.length > 0) {
      orConditions.push({ frameworks: { hasSome: frameworks } });
    }

    if (orConditions.length > 0) {
      whereConditions.push({ OR: orConditions });
    }
  }

  const related = await db.agent.findMany({
    where: { AND: whereConditions },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // If we don't have enough, fill with latest
  if (related.length < limit) {
    const additional = await db.agent.findMany({
      where: {
        status: ContentStatus.APPROVED,
        id: { notIn: [currentId, ...related.map(a => a.id)] },
      },
      include: {
        author: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit - related.length,
    });
    return [...related, ...additional] as AgentWithAuthor[];
  }

  return related as AgentWithAuthor[];
}

export async function getRelatedTools(currentId: string, tags: string[], limit = 6): Promise<ToolWithAuthor[]> {
  if (tags.length === 0) {
    return await getLatestTools(limit);
  }

  const related = await db.tool.findMany({
    where: {
      status: ContentStatus.APPROVED,
      id: { not: currentId },
      tags: {
        hasSome: tags,
      },
    },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // If we don't have enough, fill with latest
  if (related.length < limit) {
    const additional = await db.tool.findMany({
      where: {
        status: ContentStatus.APPROVED,
        id: { notIn: [currentId, ...related.map(t => t.id)] },
      },
      include: {
        author: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit - related.length,
    });
    return [...related, ...additional] as ToolWithAuthor[];
  }

  return related as ToolWithAuthor[];
}

export async function getRelatedMcps(currentId: string, tags: string[], category?: string | null, limit = 6): Promise<McpWithAuthor[]> {
  const whereConditions: any[] = [
    { status: ContentStatus.APPROVED },
    { id: { not: currentId } },
  ];

  // Prefer items with matching tags or category
  if (tags.length > 0 || category) {
    const orConditions: any[] = [];
    
    if (tags.length > 0) {
      orConditions.push({ tags: { hasSome: tags } });
    }
    if (category) {
      orConditions.push({ category });
    }

    if (orConditions.length > 0) {
      whereConditions.push({ OR: orConditions });
    }
  }

  const related = await (db as any).mcpServer.findMany({
    where: { AND: whereConditions },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // If we don't have enough, fill with latest
  if (related.length < limit) {
    const additional = await (db as any).mcpServer.findMany({
      where: {
        status: ContentStatus.APPROVED,
        id: { notIn: [currentId, ...related.map((m: any) => m.id)] },
      },
      include: {
        author: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit - related.length,
    });
    return [...related, ...additional] as McpWithAuthor[];
  }

  return related as McpWithAuthor[];
}

