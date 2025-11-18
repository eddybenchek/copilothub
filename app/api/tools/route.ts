import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createToolSchema } from '@/lib/validation';
import { slugify } from '@/lib/slug';

export async function GET() {
  try {
    const tools = await db.tool.findMany({
      where: { status: 'APPROVED' },
      include: {
        author: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

