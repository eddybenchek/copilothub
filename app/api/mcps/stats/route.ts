import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';

export async function GET() {
  try {
    // Fetch only category to keep the query lightweight
    const mcps = await db.mcpServer.findMany({
      where: { status: ContentStatus.APPROVED },
      select: {
        category: true,
      },
    });

    const total = mcps.length;
    const counts: Record<string, number> = {};
    const categorySet = new Set<string>();

    for (const mcp of mcps) {
      const category = (mcp.category || 'other').toLowerCase().trim();
      if (!category) continue;
      categorySet.add(category);
      counts[category] = (counts[category] ?? 0) + 1;
    }

    const categories = Array.from(categorySet).sort();

    return NextResponse.json(
      { total, categories, counts },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching MCP stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MCP stats' },
      { status: 500 }
    );
  }
}


