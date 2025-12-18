import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createPromptSchema } from '@/lib/validation';
import { slugify } from '@/lib/slug';
import { ContentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 per request
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    
    // Build where clause
    const whereConditions: any[] = [{ status: ContentStatus.APPROVED }];
    
    // Add category filter if provided
    if (category && category !== 'all') {
      whereConditions.push({
        tags: {
          has: `category:${category}`,
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
    
    // Optimized query: Only fetch needed fields, no votes relation
    const prompts = await db.prompt.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        tags: true,
        difficulty: true,
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
    }));

    // Check if there are more items
    const hasMore = prompts.length === limit;

    return NextResponse.json({
      prompts: promptsWithVotes,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPromptSchema.parse(body);

    // Generate slug
    const slug = slugify(validatedData.title);

    // Check if slug exists
    const existingPrompt = await db.prompt.findUnique({
      where: { slug },
    });

    const finalSlug = existingPrompt
      ? `${slug}-${Math.random().toString(36).substring(2, 6)}`
      : slug;

    // Create prompt
    const prompt = await db.prompt.create({
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

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}

