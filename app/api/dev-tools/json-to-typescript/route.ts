import { NextResponse } from 'next/server';
import { convertJsonToTypeScript } from '@/lib/dev-tools/json-to-typescript';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const jsonString = typeof body?.json === 'string' ? body.json : '';
    const result = await convertJsonToTypeScript(jsonString);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body. Send { "json": "<string>" }.' },
      { status: 400 }
    );
  }
}
