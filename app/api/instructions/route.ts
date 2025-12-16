import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    
    // Optimized query: Only fetch needed fields
    const instructions = await db.instruction.findMany({
      where: { status: ContentStatus.APPROVED },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        filePattern: true,
        language: true,
        framework: true,
        scope: true,
        tags: true,
        difficulty: true,
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
    }));

    const hasMore = instructions.length === limit;

    return NextResponse.json({
      instructions: instructionsWithVotes,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching instructions:', error);
    return NextResponse.json({ error: 'Failed to fetch instructions' }, { status: 500 });
  }
}

