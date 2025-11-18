import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createWorkflowSchema } from '@/lib/validation';
import { slugify } from '@/lib/slug';

export async function GET() {
  try {
    const workflows = await db.workflow.findMany({
      where: { status: 'APPROVED' },
      include: {
        author: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createWorkflowSchema.parse(body);

    // Generate slug
    const slug = slugify(validatedData.title);

    // Check if slug exists
    const existingWorkflow = await db.workflow.findUnique({
      where: { slug },
    });

    const finalSlug = existingWorkflow
      ? `${slug}-${Math.random().toString(36).substring(2, 6)}`
      : slug;

    // Create workflow
    const workflow = await db.workflow.create({
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

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

