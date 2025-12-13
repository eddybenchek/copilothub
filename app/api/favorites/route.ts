import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { TargetType } from '@prisma/client';

// GET: Get user's favorites
// POST: Toggle favorite (add if not exists, remove if exists)
// DELETE: Remove favorite by targetId and targetType

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(favorites);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { targetId, targetType } = body;

  if (!targetId || !targetType) {
    return NextResponse.json({ error: 'targetId and targetType required' }, { status: 400 });
  }

  // Validate targetType
  const validTypes: TargetType[] = ['PROMPT', 'TOOL', 'MCP', 'INSTRUCTION', 'AGENT'];
  if (!validTypes.includes(targetType)) {
    return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
  }

  // Check if favorite already exists
  const existing = await db.favorite.findFirst({
    where: {
      userId: session.user.id,
      targetType,
      targetId,
    },
  });

  if (existing) {
    // Remove favorite
    await db.favorite.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ favorited: false, message: 'Removed from favorites' });
  } else {
    // Add favorite
    const favorite = await db.favorite.create({
      data: {
        userId: session.user.id,
        targetId,
        targetType,
      },
    });
    return NextResponse.json({ favorited: true, favorite, message: 'Added to favorites' });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const targetId = url.searchParams.get('targetId');
  const targetType = url.searchParams.get('targetType') as TargetType;

  if (!targetId || !targetType) {
    return NextResponse.json({ error: 'targetId and targetType required' }, { status: 400 });
  }

  const favorite = await db.favorite.findFirst({
    where: {
      userId: session.user.id,
      targetType,
      targetId,
    },
  });

  if (!favorite) {
    return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
  }

  await db.favorite.delete({
    where: { id: favorite.id },
  });

  return NextResponse.json({ success: true, message: 'Removed from favorites' });
}

