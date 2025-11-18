import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createPromptSchema } from '@/lib/validation';
import { slugify } from '@/lib/slug';

export async function GET() {
  try {
    const prompts = await db.prompt.findMany({
      where: { status: 'APPROVED' },
      include: {
        author: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(prompts);
  } catch (error) {
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

