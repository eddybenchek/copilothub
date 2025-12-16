import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { voteSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');

    if (!targetId || !targetType) {
      return NextResponse.json({ error: 'targetId and targetType required' }, { status: 400 });
    }

    const vote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        targetId,
        targetType: targetType as any,
      },
      select: {
        value: true,
      },
    });

    return NextResponse.json(vote || null);
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = voteSchema.parse(body);

    // Check if user has already voted
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        targetId: validatedData.targetId,
        targetType: validatedData.targetType,
      },
    });

    if (existingVote) {
      // Update existing vote
      const updatedVote = await db.vote.update({
        where: { id: existingVote.id },
        data: { value: validatedData.value },
      });

      return NextResponse.json(updatedVote);
    }

    // Determine the relation field based on target type
    const relationField = {
      PROMPT: 'promptId',
      TOOL: 'toolId',
      MCP: 'mcpId',
      INSTRUCTION: 'instructionId',
      AGENT: 'agentId',
    }[validatedData.targetType];

    // Create new vote
    const vote = await db.vote.create({
      data: {
        userId: session.user.id,
        targetId: validatedData.targetId,
        targetType: validatedData.targetType,
        value: validatedData.value,
        [relationField]: validatedData.targetId,
      },
    });

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    console.error('Error creating vote:', error);
    return NextResponse.json(
      { error: 'Failed to create vote' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');

    if (!targetId) {
      return NextResponse.json({ error: 'Target ID required' }, { status: 400 });
    }

    await db.vote.deleteMany({
      where: {
        userId: session.user.id,
        targetId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vote:', error);
    return NextResponse.json(
      { error: 'Failed to delete vote' },
      { status: 500 }
    );
  }
}

