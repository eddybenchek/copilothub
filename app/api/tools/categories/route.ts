import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';

export async function GET() {
  try {
    // Fetch only tags for approved tools to keep the query lightweight
    const tools = await db.tool.findMany({
      where: { status: ContentStatus.APPROVED },
      select: { tags: true },
    });

    const counts: Record<string, number> = {};
    let total = 0;

    for (const tool of tools) {
      total++;
      for (const tag of tool.tags) {
        const key = tag.toLowerCase();
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }

    return NextResponse.json(
      { counts, total },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching tool category counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool category counts' },
      { status: 500 }
    );
  }
}


