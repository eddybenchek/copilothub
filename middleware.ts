import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle legacy instruction URLs with .instructions.md extension
  // Redirect /instructions/{slug}.instructions.md to /instructions/{slug}
  if (pathname.startsWith('/instructions/') && pathname.endsWith('.instructions.md')) {
    const slug = pathname
      .replace('/instructions/', '')
      .replace(/\.instructions\.md$/, '');
    
    // Redirect to correct URL format
    const newUrl = new URL(`/instructions/${slug}`, request.url);
    return NextResponse.redirect(newUrl, 301); // Permanent redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all instruction paths to check for legacy .instructions.md URLs
    '/instructions/:path*',
  ],
};

