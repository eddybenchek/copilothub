import { Metadata } from 'next';

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export function getBaseUrl(): string {
  return baseUrl;
}

export function createMetadata(overrides: Partial<Metadata>): Metadata {
  // Extract title as string
  let defaultTitle = 'CopilotHub';
  if (overrides.title) {
    if (typeof overrides.title === 'string') {
      defaultTitle = overrides.title;
    } else if ('absolute' in overrides.title && overrides.title.absolute) {
      defaultTitle = overrides.title.absolute;
    } else if ('default' in overrides.title && overrides.title.default) {
      defaultTitle = overrides.title.default;
    }
  }

  // Extract description as string
  const defaultDescription = typeof overrides.description === 'string'
    ? overrides.description
    : 'A curated collection of AI prompts, agents, tools, MCP servers, and instructions for GitHub Copilot.';

  // Ensure OG image is always set with proper types
  let ogImageUrl = `${baseUrl}/og-image.png`;
  if (overrides.openGraph?.images) {
    if (typeof overrides.openGraph.images === 'string') {
      ogImageUrl = overrides.openGraph.images;
    } else if (Array.isArray(overrides.openGraph.images) && overrides.openGraph.images.length > 0) {
      const firstImage = overrides.openGraph.images[0];
      if (typeof firstImage === 'string') {
        ogImageUrl = firstImage;
      } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
        ogImageUrl = typeof firstImage.url === 'string' ? firstImage.url : firstImage.url.toString();
      }
    }
  }

  const ogImageAlt = defaultTitle;

  // Build openGraph object with proper types
  const openGraphDefaults = {
    siteName: 'CopilotHub' as const,
    locale: 'en_US' as const,
    type: 'website' as const,
    url: baseUrl,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: ogImageAlt,
      },
    ] as const,
  };

  // Merge with overrides (overrides take precedence)
  const openGraph: any = {
    ...openGraphDefaults,
    ...(overrides.openGraph || {}),
    // Ensure required fields are always set
    siteName: 'CopilotHub',
    locale: 'en_US',
    // Use provided images if available, otherwise use default
    images: overrides.openGraph?.images || openGraphDefaults.images,
  };

  // Extract Twitter title and description
  const twitterTitle = overrides.twitter?.title 
    || (typeof overrides.openGraph?.title === 'string' ? overrides.openGraph.title : defaultTitle);
  const twitterDescription = overrides.twitter?.description 
    || (typeof overrides.openGraph?.description === 'string' ? overrides.openGraph.description : defaultDescription);
  const twitterImages = overrides.twitter?.images || [ogImageUrl];

  return {
    ...overrides,
    openGraph,
    twitter: {
      card: 'summary_large_image' as const,
      title: twitterTitle || undefined,
      description: twitterDescription || undefined,
      images: twitterImages,
      ...overrides.twitter,
    },
  };
}

export function createStructuredData(type: string, data: Record<string, any>) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
}

/**
 * Optimize meta description to be between 120-160 characters
 * - If too short (<120): Expand with context (category, tags, use case)
 * - If too long (>160): Truncate to 160 chars with ellipsis
 */
export function truncateDescription(
  description: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    context?: {
      title?: string;
      category?: string;
      tags?: string[];
      type?: 'prompt' | 'instruction' | 'agent' | 'tool' | 'mcp';
    };
  }
): string {
  const minLength = options?.minLength ?? 120;
  const maxLength = options?.maxLength ?? 160;
  const context = options?.context;
  
  let optimized = description.trim();
  
  // If description is too short, expand it with context
  if (optimized.length < minLength && context) {
    const parts: string[] = [optimized];
    
    // Add category if available
    if (context.category) {
      parts.push(`Category: ${context.category}.`);
    }
    
    // Add top tags if available
    if (context.tags && context.tags.length > 0) {
      const topTags = context.tags.slice(0, 3).join(', ');
      parts.push(`Tags: ${topTags}.`);
    }
    
    // Add type-specific context
    if (context.type) {
      const typeContext: Record<string, string> = {
        prompt: 'AI prompt for GitHub Copilot',
        instruction: 'Copilot instruction for consistent coding standards',
        agent: 'Specialized AI agent for GitHub Copilot',
        tool: 'Development tool for GitHub Copilot',
        mcp: 'MCP server for GitHub Copilot',
      };
      parts.push(typeContext[context.type] || '');
    }
    
    optimized = parts.filter(Boolean).join(' ');
    
    // If still too short, add title
    if (optimized.length < minLength && context.title) {
      optimized = `${context.title}. ${optimized}`;
    }
  }
  
  // If description is too long, truncate intelligently
  if (optimized.length > maxLength) {
    // Try to truncate at a sentence boundary
    const truncated = optimized.substring(0, maxLength - 3);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');
    
    // Prefer truncating at sentence end, then at word boundary
    if (lastPeriod > maxLength * 0.7) {
      optimized = truncated.substring(0, lastPeriod + 1);
    } else if (lastSpace > maxLength * 0.7) {
      optimized = truncated.substring(0, lastSpace) + '...';
    } else {
      optimized = truncated + '...';
    }
  }
  
  // Final check: ensure we're within bounds
  if (optimized.length < minLength && context?.title) {
    // Last resort: use title with minimal context
    const fallback = `${context.title} - ${context.type ? getTypeDescription(context.type) : 'Content'} on CopilotHub`;
    if (fallback.length <= maxLength) {
      optimized = fallback;
    }
  }
  
  return optimized.substring(0, maxLength);
}

function getTypeDescription(type: string): string {
  const types: Record<string, string> = {
    prompt: 'AI Prompt',
    instruction: 'Copilot Instruction',
    agent: 'AI Agent',
    tool: 'Development Tool',
    mcp: 'MCP Server',
  };
  return types[type] || 'Content';
}

