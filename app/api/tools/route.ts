import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createToolSchema } from '@/lib/validation';
import { slugify } from '@/lib/slug';
import { ContentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    
    // Optimized query: Only fetch needed fields
    const tools = await db.tool.findMany({
      where: { status: ContentStatus.APPROVED },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        tags: true,
        difficulty: true,
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
    }));

    const hasMore = tools.length === limit;

    return NextResponse.json({
      tools: toolsWithVotes,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Restrict to ADMIN only - Tools can only be added by administrators
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          error: 'Forbidden: Only administrators can create tools. Regular users cannot submit tools via the API. Please contact us for paid submissions or submit via GitHub PR.' 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createToolSchema.parse(body);

    // Generate slug
    const slug = slugify(validatedData.title);

    // Check if slug exists
    const existingTool = await db.tool.findUnique({
      where: { slug },
    });

    const finalSlug = existingTool
      ? `${slug}-${Math.random().toString(36).substring(2, 6)}`
      : slug;

    // Create tool
    const tool = await db.tool.create({
      data: {
        ...validatedData,
        slug: finalSlug,
        authorId: session.user.id,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    );
  }
}

