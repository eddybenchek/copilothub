import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import redirectMap from './lib/redirect-map.json';

// Type for the redirect map
type RedirectMap = {
  instructions: Record<string, string>;
  agents: Record<string, string>;
  mcps: Record<string, string>;
  spec: string | null;
};

const map = redirectMap as RedirectMap;

/**
 * Find instruction slug in redirect map (case-insensitive)
 */
function findInstructionSlug(slug: string): string | null {
  const lowerSlug = slug.toLowerCase();
  return map.instructions[lowerSlug] || null;
}

/**
 * Find MCP slug in redirect map (case-insensitive)
 */
function findMcpSlug(slug: string): string | null {
  const lowerSlug = slug.toLowerCase();
  return map.mcps[lowerSlug] || null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Handle trailing slashes - redirect to non-trailing version
  if (pathname !== '/' && pathname.endsWith('/')) {
    url.pathname = pathname.slice(0, -1);
    // Preserve query parameters
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url, 301);
  }

  // Handle legacy instruction URLs with .instructions.md extension
  // Redirect /instructions/{slug}.instructions.md to /instructions/{correct-slug}
  if (pathname.startsWith('/instructions/') && pathname.endsWith('.instructions.md')) {
    const slug = pathname
      .replace('/instructions/', '')
      .replace(/\.instructions\.md$/, '');
    
    // Look up in redirect map
    const correctSlug = findInstructionSlug(slug);
    
    if (correctSlug) {
      // Redirect to correct slug
      url.pathname = `/instructions/${correctSlug}`;
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 301);
    } else {
      // Fallback: redirect to instructions listing page
      url.pathname = '/instructions';
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 301);
    }
  }

  // Handle /spec redirect to specification agent
  if (pathname === '/spec' || pathname === '/spec/') {
    if (map.spec) {
      url.pathname = `/agents/${map.spec}`;
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 301);
    } else {
      // Fallback: redirect to agents listing page
      url.pathname = '/agents';
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 301);
    }
  }

  // Handle MCP slug mismatches (e.g., /mcps/swarmia.com -> /mcps/mattjegan-swarmia-mcp)
  if (pathname.startsWith('/mcps/') && pathname !== '/mcps') {
    const slug = pathname.replace('/mcps/', '');
    
    // Only check if it looks like a mismatched slug (contains dots, or doesn't match standard slug pattern)
    if (slug.includes('.') || !/^[a-z0-9-]+$/.test(slug)) {
      const correctSlug = findMcpSlug(slug);
      
      if (correctSlug) {
        url.pathname = `/mcps/${correctSlug}`;
        url.search = request.nextUrl.search;
        return NextResponse.redirect(url, 301);
      }
      // If not found, let Next.js handle it (might be a valid slug or will 404)
    }
  }

  // Handle instruction 404s - try to find correct slug
  if (pathname.startsWith('/instructions/') && pathname !== '/instructions') {
    const slug = pathname.replace('/instructions/', '');
    
    // Look up in redirect map
    const correctSlug = findInstructionSlug(slug);
    
    if (correctSlug && correctSlug !== slug) {
      url.pathname = `/instructions/${correctSlug}`;
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths that might need redirects
    '/instructions/:path*',
    '/spec',
    '/spec/',
    '/mcps/:path*',
  ],
};

