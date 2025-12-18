import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';
import { slugify } from '@/lib/slug';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    
    // Build where clause
    const whereConditions: any[] = [{ status: ContentStatus.APPROVED }];
    
    // Add category filter if provided
    if (category && category !== 'all') {
      const normalizedCategory = category.toLowerCase();
      whereConditions.push({
        OR: [
          { category: { equals: normalizedCategory, mode: 'insensitive' as const } },
          { tags: { has: normalizedCategory } },
        ],
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
    
    const where = whereConditions.length > 1 ? { AND: whereConditions } : whereConditions[0];
    
    // Optimized query: Only fetch needed fields
    const mcps = await db.mcpServer.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        tags: true,
        category: true,
        difficulty: true,
        createdAt: true,
        updatedAt: true,
        githubUrl: true,
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
    const mcpIds = mcps.map(m => m.id);
    const voteCounts = mcpIds.length > 0 ? await db.vote.groupBy({
      by: ['targetId'],
      where: {
        targetId: { in: mcpIds },
      },
      _sum: {
        value: true,
      },
    }) : [];

    const voteMap = new Map(
      voteCounts.map(v => [v.targetId, v._sum.value || 0])
    );

    const mcpsWithVotes = mcps.map(mcp => ({
      ...mcp,
      voteCount: voteMap.get(mcp.id) || 0,
      votes: [],
    }));

    const hasMore = mcps.length === limit;

    return NextResponse.json({
      mcps: mcpsWithVotes,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching MCP servers:', error);
    return NextResponse.json({ error: 'Failed to fetch MCP servers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Restrict to ADMIN only - MCPs can only be added by administrators
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          error: 'Forbidden: Only administrators can create MCP servers. Regular users cannot submit MCPs via the API. Please contact us for paid submissions or submit via GitHub PR.' 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, content, githubUrl, websiteUrl, tags, category, installCommand, configExample } = body;

    if (!title || !description || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate slug
    const slug = slugify(title);

    // Check if slug exists
    const existingMcp = await db.mcpServer.findUnique({
      where: { slug },
    });

    const finalSlug = existingMcp
      ? `${slug}-${Math.random().toString(36).substring(2, 6)}`
      : slug;

    // Create MCP server
    const mcp = await db.mcpServer.create({
      data: {
        title,
        slug: finalSlug,
        description,
        content,
        githubUrl: githubUrl || null,
        websiteUrl: websiteUrl || null,
        tags: tags || [],
        category: category || null,
        installCommand: installCommand || null,
        configExample: configExample || null,
        authorId: session.user.id,
        status: ContentStatus.PENDING,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    return NextResponse.json(mcp, { status: 201 });
  } catch (error) {
    console.error('Error creating MCP server:', error);
    return NextResponse.json(
      { error: 'Failed to create MCP server' },
      { status: 500 }
    );
  }
}

