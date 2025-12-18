import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';

export async function GET() {
  try {
    // Fetch only tags from all approved prompts (lightweight query)
    const prompts = await db.prompt.findMany({
      where: { status: ContentStatus.APPROVED },
      select: { tags: true },
    });

    const counts: Record<string, number> = {};
    let total = 0;

    for (const prompt of prompts) {
      total++;
      for (const tag of prompt.tags) {
        const normalizedTag = tag.toLowerCase();
        // Extract category from tags like "category:code-generation"
        if (normalizedTag.startsWith('category:')) {
          const category = normalizedTag.replace('category:', '');
          counts[category] = (counts[category] ?? 0) + 1;
        }
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
    console.error('Error fetching category counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category counts' },
      { status: 500 }
    );
  }
}

