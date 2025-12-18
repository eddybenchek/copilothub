import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const category = searchParams.get('category');

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
        category: true,
        mcpServers: true,
        languages: true,
        frameworks: true,
        tags: true,
        difficulty: true,
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
    }));

    const hasMore = agents.length === limit;

    return NextResponse.json({
      agents: agentsWithVotes,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

