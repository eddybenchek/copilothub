import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';
import { slugify } from '@/lib/slug';

export async function GET() {
  try {
    const mcps = await db.mcpServer.findMany({
      where: { status: ContentStatus.APPROVED },
      include: {
        author: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(mcps);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch MCP servers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

