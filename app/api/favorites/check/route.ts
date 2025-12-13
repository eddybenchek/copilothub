import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { TargetType } from '@prisma/client';

// Check if specific items are favorited by the user
// POST: { targetIds: string[], targetType: TargetType }
// Returns: { [targetId]: boolean }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { targetIds, targetType } = body;

  if (!targetIds || !Array.isArray(targetIds) || !targetType) {
    return NextResponse.json({ error: 'targetIds array and targetType required' }, { status: 400 });
  }

  const favorites = await db.favorite.findMany({
    where: {
      userId: session.user.id,
      targetType: targetType as TargetType,
      targetId: { in: targetIds },
    },
  });

  const favoritedMap: Record<string, boolean> = {};
  targetIds.forEach((id: string) => {
    favoritedMap[id] = favorites.some(f => f.targetId === id);
  });

  return NextResponse.json(favoritedMap);
}

