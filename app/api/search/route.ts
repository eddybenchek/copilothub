import { NextResponse } from 'next/server';
import { performSearch } from '@/lib/search';
import type { SearchType, Difficulty } from '@/lib/search-types';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const type = (searchParams.get('type') ?? 'all') as SearchType;
  const difficulty = (searchParams.get('difficulty') ?? 'ALL') as
    | Difficulty
    | 'ALL';

  try {
    const results = await performSearch({
      query: q,
      type,
      difficulty,
      limitPerSection: 20,
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[SEARCH_API_ERROR]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

