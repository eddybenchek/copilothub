import { db } from './db';
import { ContentStatus } from '@prisma/client';

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

// Workflow helpers
export async function getLatestWorkflows(limit = 6) {
  return await db.workflow.findMany({
    where: { status: ContentStatus.APPROVED },
    include: {
      author: true,
      votes: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getWorkflowBySlug(slug: string) {
  return await db.workflow.findUnique({
    where: { slug },
    include: {
      author: true,
      votes: true,
    },
  });
}

export async function getAllWorkflows() {
  return await db.workflow.findMany({
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

