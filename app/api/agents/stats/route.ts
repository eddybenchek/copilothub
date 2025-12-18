import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';

export async function GET() {
  try {
    // Fetch only the fields needed for stats to keep the query lightweight
    const agents = await db.agent.findMany({
      where: { status: ContentStatus.APPROVED },
      select: {
        category: true,
      },
    });

    const total = agents.length;
    const counts: Record<string, number> = {};
    const categorySet = new Set<string>();

    for (const agent of agents) {
      const category = (agent.category || 'Other').trim();
      if (!category) continue;
      categorySet.add(category);
      counts[category] = (counts[category] ?? 0) + 1;
    }

    const categories = Array.from(categorySet).sort();

    return NextResponse.json(
      {
        total,
        categories,
        counts,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent stats' },
      { status: 500 }
    );
  }
}


