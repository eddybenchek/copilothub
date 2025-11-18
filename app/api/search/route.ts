import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Difficulty, ContentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // prompt, workflow, tool, all
    const difficulty = searchParams.get('difficulty') as Difficulty | null;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

    // Build search conditions
    const searchCondition = query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
            { content: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const difficultyCondition = difficulty ? { difficulty } : {};
    const tagsCondition = tags.length > 0 ? { tags: { hasSome: tags } } : {};
    const statusCondition = { status: ContentStatus.APPROVED };

    // Search Prompts
    const prompts =
      type === 'all' || type === 'prompt'
        ? await db.prompt.findMany({
            where: {
              ...searchCondition,
              ...difficultyCondition,
              ...tagsCondition,
              ...statusCondition,
            },
            include: {
              author: true,
              votes: true,
            },
            take: 20,
            orderBy: { createdAt: 'desc' },
          })
        : [];

    // Search Workflows
    const workflows =
      type === 'all' || type === 'workflow'
        ? await db.workflow.findMany({
            where: {
              ...searchCondition,
              ...difficultyCondition,
              ...tagsCondition,
              ...statusCondition,
            },
            include: {
              author: true,
              votes: true,
            },
            take: 20,
            orderBy: { createdAt: 'desc' },
          })
        : [];

    // Search Tools
    const tools =
      type === 'all' || type === 'tool'
        ? await db.tool.findMany({
            where: {
              ...searchCondition,
              ...difficultyCondition,
              ...tagsCondition,
              ...statusCondition,
            },
            include: {
              author: true,
              votes: true,
            },
            take: 20,
            orderBy: { createdAt: 'desc' },
          })
        : [];

    return NextResponse.json({
      prompts,
      workflows,
      tools,
      query,
      totalResults: prompts.length + workflows.length + tools.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

