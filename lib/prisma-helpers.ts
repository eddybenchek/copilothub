import { db } from './db';
import { ContentStatus, Instruction, Agent, McpServer } from '@prisma/client';
import type { InstructionWithAuthor, AgentWithAuthor, McpWithAuthor } from './types';

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

