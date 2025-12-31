import { db } from './db';
import { ContentStatus } from '@prisma/client';

/**
 * Find instruction by exact or fuzzy slug match
 * Returns the correct slug if found, null otherwise
 */
export async function findInstructionBySlug(slug: string): Promise<string | null> {
  // First try exact match
  const exactMatch = await db.instruction.findFirst({
    where: {
      slug: slug.toLowerCase(),
      status: ContentStatus.APPROVED,
    },
    select: { slug: true },
  });

  if (exactMatch) {
    return exactMatch.slug;
  }

  // Try fuzzy match - find instructions where slug contains the search term
  // or where the search term is contained in the slug
  const fuzzyMatch = await db.instruction.findFirst({
    where: {
      status: ContentStatus.APPROVED,
      OR: [
        { slug: { contains: slug.toLowerCase(), mode: 'insensitive' } },
        { title: { contains: slug, mode: 'insensitive' } },
      ],
    },
    select: { slug: true },
    orderBy: { createdAt: 'desc' }, // Prefer newer items
  });

  if (fuzzyMatch) {
    return fuzzyMatch.slug;
  }

  return null;
}

/**
 * Find agent by exact or fuzzy slug match
 * Returns the correct slug if found, null otherwise
 */
export async function findAgentBySlug(slug: string): Promise<string | null> {
  // First try exact match
  const exactMatch = await db.agent.findFirst({
    where: {
      slug: slug.toLowerCase(),
      status: ContentStatus.APPROVED,
    },
    select: { slug: true },
  });

  if (exactMatch) {
    return exactMatch.slug;
  }

  // Try fuzzy match
  const fuzzyMatch = await db.agent.findFirst({
    where: {
      status: ContentStatus.APPROVED,
      OR: [
        { slug: { contains: slug.toLowerCase(), mode: 'insensitive' } },
        { title: { contains: slug, mode: 'insensitive' } },
      ],
    },
    select: { slug: true },
    orderBy: { createdAt: 'desc' },
  });

  if (fuzzyMatch) {
    return fuzzyMatch.slug;
  }

  return null;
}

/**
 * Find MCP server by exact or fuzzy slug match
 * Returns the correct slug if found, null otherwise
 */
export async function findMcpBySlug(slug: string): Promise<string | null> {
  // First try exact match
  const exactMatch = await db.mcpServer.findFirst({
    where: {
      slug: slug.toLowerCase(),
      status: ContentStatus.APPROVED,
    },
    select: { slug: true },
  });

  if (exactMatch) {
    return exactMatch.slug;
  }

  // Try fuzzy match - also check title and name fields
  // Handle domain-like slugs (e.g., "swarmia.com" -> "mattjegan-swarmia-mcp")
  const domainName = slug.replace(/\.(com|org|net|io|dev)$/i, '').toLowerCase();
  
  const fuzzyMatch = await db.mcpServer.findFirst({
    where: {
      status: ContentStatus.APPROVED,
      OR: [
        { slug: { contains: slug.toLowerCase(), mode: 'insensitive' } },
        { title: { contains: slug, mode: 'insensitive' } },
        { name: { contains: slug, mode: 'insensitive' } },
        // Handle cases like "swarmia.com" -> "mattjegan-swarmia-mcp"
        { slug: { contains: domainName, mode: 'insensitive' } },
        { slug: { contains: slug.replace(/\./g, '-'), mode: 'insensitive' } },
      ],
    },
    select: { slug: true },
    orderBy: { createdAt: 'desc' },
  });

  if (fuzzyMatch) {
    return fuzzyMatch.slug;
  }

  return null;
}

/**
 * Find agent by title containing "specification" or "spec"
 * Used for /spec redirect
 * Prefers exact "specification" slug match
 */
export async function findSpecificationAgent(): Promise<string | null> {
  // First try exact "specification" slug match
  const exactMatch = await db.agent.findFirst({
    where: {
      slug: 'specification',
      status: ContentStatus.APPROVED,
    },
    select: { slug: true },
  });

  if (exactMatch) {
    return exactMatch.slug;
  }

  // Then try fuzzy match
  const agent = await db.agent.findFirst({
    where: {
      status: ContentStatus.APPROVED,
      OR: [
        { slug: { contains: 'specification', mode: 'insensitive' } },
        { title: { contains: 'specification', mode: 'insensitive' } },
        // Only use "spec" if it's not part of another word
        { slug: { equals: 'spec', mode: 'insensitive' } },
      ],
    },
    select: { slug: true },
    orderBy: { createdAt: 'desc' },
  });

  return agent?.slug || null;
}

