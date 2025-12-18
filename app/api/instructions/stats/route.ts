import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';

export async function GET() {
  try {
    // Fetch only the fields needed for stats to keep the query lightweight
    const instructions = await db.instruction.findMany({
      where: { status: ContentStatus.APPROVED },
      select: {
        featured: true,
        language: true,
      },
    });

    const total = instructions.length;
    const featured = instructions.filter((i) => i.featured).length;
    const languageSet = new Set(
      instructions
        .map((i) => i.language?.toLowerCase().trim())
        .filter((lang): lang is string => Boolean(lang))
    );

    return NextResponse.json(
      {
        total,
        featured,
        languages: languageSet.size,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching instruction stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instruction stats' },
      { status: 500 }
    );
  }
}


