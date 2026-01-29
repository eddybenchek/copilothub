import { db } from './db';
import { ContentStatus } from '@prisma/client';
import type { InstructionWithAuthor, PromptWithAuthor, AgentWithAuthor, ToolWithAuthor, McpWithAuthor } from './types';

export interface SpringBootContent {
  instructions: InstructionWithAuthor[];
  prompts: PromptWithAuthor[];
  agents: AgentWithAuthor[];
  tools: ToolWithAuthor[];
  mcps: McpWithAuthor[];
}

export interface SpringBootStats {
  playbooks: number;
  prompts: number;
  workflows: number;
  lastUpdated: Date | null;
}

/**
 * Fetch all Spring Boot related content
 */
export async function getSpringBootContent(): Promise<SpringBootContent> {
  const springBootTags = ['spring-boot', 'spring', 'jakarta', 'migration', 'jakarta-ee'];
  
  const [instructions, prompts, agents, tools, mcps] = await Promise.all([
    // Instructions - Spring Boot related
    db.instruction.findMany({
      where: {
        status: ContentStatus.APPROVED,
        OR: [
          { tags: { hasSome: springBootTags } },
          { framework: { equals: 'spring-boot', mode: 'insensitive' } },
          { slug: { contains: 'spring-boot' } },
        ],
      },
      include: {
        author: true,
        votes: true,
      },
      orderBy: {
        views: 'desc',
      },
    }),
    
    // Prompts - Spring Boot related (strict filtering)
    // Must have spring-boot or spring tag, OR contain "spring boot" in title/content
    db.prompt.findMany({
      where: {
        status: ContentStatus.APPROVED,
        OR: [
          { tags: { has: 'spring-boot' } },
          { tags: { has: 'spring' } },
          { 
            AND: [
              { content: { contains: 'spring boot', mode: 'insensitive' } },
              {
                NOT: {
                  OR: [
                    { tags: { has: 'nextjs' } },
                    { tags: { has: 'react' } },
                    { tags: { has: 'vue' } },
                    { tags: { has: 'angular' } },
                    { tags: { has: 'nodejs' } },
                    { tags: { has: 'typescript' } },
                    { tags: { has: 'javascript' } },
                    { tags: { has: 'python' } },
                    { tags: { has: 'graphql' } },
                    { tags: { has: 'webpack' } },
                    { tags: { has: 'vite' } },
                    { tags: { has: 'prisma' } },
                    { tags: { has: 'typeorm' } },
                  ],
                },
              },
            ],
          },
          { title: { contains: 'spring boot', mode: 'insensitive' } },
        ],
      },
      include: {
        author: true,
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    
    // Agents - Spring Boot related
    db.agent.findMany({
      where: {
        status: ContentStatus.APPROVED,
        OR: [
          { tags: { hasSome: springBootTags } },
          { frameworks: { hasSome: ['spring-boot', 'spring'] } },
        ],
      },
      include: {
        author: true,
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    
    // Tools - Spring Boot related
    db.tool.findMany({
      where: {
        status: ContentStatus.APPROVED,
        OR: [
          { tags: { hasSome: springBootTags } },
          { title: { contains: 'spring boot', mode: 'insensitive' } },
        ],
      },
      include: {
        author: true,
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    
    // MCPs - Spring Boot related (if any)
    db.mcpServer.findMany({
      where: {
        status: ContentStatus.APPROVED,
        OR: [
          { tags: { hasSome: springBootTags } },
        ],
      },
      include: {
        author: true,
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return {
    instructions: instructions as InstructionWithAuthor[],
    prompts: prompts as PromptWithAuthor[],
    agents: agents as AgentWithAuthor[],
    tools: tools as ToolWithAuthor[],
    mcps: mcps as McpWithAuthor[],
  };
}

/**
 * Get statistics for Spring Boot hub
 */
export async function getSpringBootStats(): Promise<SpringBootStats> {
  const content = await getSpringBootContent();
  
  // Count playbooks (instructions)
  const playbooks = content.instructions.length;
  
  // Count prompts
  const prompts = content.prompts.length;
  
  // Count workflows (can be instructions or prompts tagged as workflow)
  const workflows = [
    ...content.instructions.filter(i => i.tags.includes('workflow') || i.tags.includes('migration')),
    ...content.prompts.filter(p => p.tags.includes('workflow')),
  ].length;
  
  // Get last updated date
  const allDates = [
    ...content.instructions.map(i => i.updatedAt),
    ...content.prompts.map(p => p.updatedAt),
    ...content.agents.map(a => a.updatedAt),
    ...content.tools.map(t => t.updatedAt),
    ...content.mcps.map(m => m.updatedAt),
  ].filter(Boolean) as Date[];
  
  const lastUpdated = allDates.length > 0 
    ? new Date(Math.max(...allDates.map(d => d.getTime())))
    : null;

  return {
    playbooks,
    prompts,
    workflows,
    lastUpdated,
  };
}

/**
 * Get featured playbooks (top 2 Spring Boot migration instructions)
 */
export async function getFeaturedPlaybooks(): Promise<InstructionWithAuthor[]> {
  const instructions = await db.instruction.findMany({
    where: {
      status: ContentStatus.APPROVED,
      OR: [
        { slug: 'spring-boot-2-to-3-migration' },
        { slug: 'spring-boot-3x-to-40-migration-guide' },
        { tags: { hasSome: ['spring-boot', 'migration'] } },
      ],
    },
    include: {
      author: true,
      votes: true,
    },
    orderBy: {
      views: 'desc',
    },
    take: 2,
  });

  return instructions as InstructionWithAuthor[];
}

/**
 * Filter Spring Boot content by various criteria
 */
export function filterSpringBootContent(
  content: SpringBootContent,
  filters: {
    type?: 'all' | 'playbooks' | 'prompts' | 'workflows' | 'tools';
    version?: '2→3' | '3→4' | '3.x' | 'security-6' | 'hibernate-6';
    build?: 'maven' | 'gradle';
    appType?: 'mvc' | 'webflux';
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  }
): SpringBootContent {
  let filtered = { ...content };

  // Filter by type
  if (filters.type && filters.type !== 'all') {
    if (filters.type === 'playbooks') {
      filtered = { ...filtered, prompts: [], agents: [], tools: [], mcps: [] };
    } else if (filters.type === 'prompts') {
      filtered = { ...filtered, instructions: [], agents: [], tools: [], mcps: [] };
    } else if (filters.type === 'workflows') {
      filtered = {
        ...filtered,
        instructions: filtered.instructions.filter(i => 
          i.tags.includes('workflow') || i.tags.includes('migration')
        ),
        prompts: filtered.prompts.filter(p => p.tags.includes('workflow')),
        agents: [],
        tools: [],
        mcps: [],
      };
    } else if (filters.type === 'tools') {
      filtered = { ...filtered, instructions: [], prompts: [], agents: [], mcps: [] };
    }
  }

  // Filter by version
  if (filters.version) {
    const versionMap: Record<string, string[]> = {
      '2→3': ['2-to-3', '2-3', 'jakarta'],
      '3→4': ['3-to-4', '3-4', '3x-to-40'],
      '3.x': ['3.', '3x'],
      'security-6': ['spring-security', 'security-6', 'security'],
      'hibernate-6': ['hibernate-6', 'hibernate'],
    };

    const versionTags = versionMap[filters.version] || [];
    
    filtered.instructions = filtered.instructions.filter(i =>
      versionTags.some(tag => 
        i.slug.includes(tag) || 
        i.tags.some(t => t.toLowerCase().includes(tag))
      )
    );
    
    filtered.prompts = filtered.prompts.filter(p =>
      versionTags.some(tag =>
        p.tags.some(t => t.toLowerCase().includes(tag))
      )
    );
  }

  // Filter by build tool
  if (filters.build) {
    const buildTag = filters.build.toLowerCase();
    filtered.instructions = filtered.instructions.filter(i =>
      i.tags.includes(buildTag) || i.tags.includes('maven') || i.tags.includes('gradle')
    );
    filtered.prompts = filtered.prompts.filter(p =>
      p.tags.includes(buildTag) || p.tags.includes('maven') || p.tags.includes('gradle')
    );
  }

  // Filter by app type
  if (filters.appType) {
    const appTypeTag = filters.appType.toLowerCase();
    filtered.instructions = filtered.instructions.filter(i =>
      i.tags.includes(appTypeTag) || i.tags.includes('webflux') || i.tags.includes('mvc')
    );
    filtered.prompts = filtered.prompts.filter(p =>
      p.tags.includes(appTypeTag) || p.tags.includes('webflux') || p.tags.includes('mvc')
    );
  }

  // Filter by difficulty
  if (filters.difficulty) {
    filtered.instructions = filtered.instructions.filter(i => i.difficulty === filters.difficulty);
    filtered.prompts = filtered.prompts.filter(p => p.difficulty === filters.difficulty);
    filtered.agents = filtered.agents.filter(a => a.difficulty === filters.difficulty);
  }

  return filtered;
}
