import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';
import { getBaseUrl } from '@/lib/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/prompts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mcps`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instructions`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic pages - Prompts
  const prompts = await db.prompt.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { slug: true, updatedAt: true },
  });

  const promptPages: MetadataRoute.Sitemap = prompts.map((prompt) => ({
    url: `${baseUrl}/prompts/${prompt.slug}`,
    lastModified: prompt.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic pages - Agents
  const agents = await db.agent.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { slug: true, updatedAt: true },
  });

  const agentPages: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${baseUrl}/agents/${agent.slug}`,
    lastModified: agent.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic pages - Tools
  const tools = await db.tool.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { slug: true, updatedAt: true },
  });

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: tool.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic pages - MCPs
  const mcps = await db.mcpServer.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { slug: true, updatedAt: true },
  });

  const mcpPages: MetadataRoute.Sitemap = mcps.map((mcp) => ({
    url: `${baseUrl}/mcps/${mcp.slug}`,
    lastModified: mcp.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic pages - Instructions
  const instructions = await db.instruction.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { slug: true, updatedAt: true },
  });

  const instructionPages: MetadataRoute.Sitemap = instructions.map((instruction) => ({
    url: `${baseUrl}/instructions/${instruction.slug}`,
    lastModified: instruction.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...promptPages,
    ...agentPages,
    ...toolPages,
    ...mcpPages,
    ...instructionPages,
  ];
}

