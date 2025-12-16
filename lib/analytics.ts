'use client';

import posthog from 'posthog-js';

// Initialize PostHog
export function initPostHog() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug(); // Enable debug mode in development
        }
      },
      capture_pageview: false, // We'll capture pageviews manually
      capture_pageleave: true,
    });
  }
}

// Track custom events
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, properties);
  }
}

// Track page views
export function trackPageView(path: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      path,
      ...properties,
    });
  }
}

// Content-specific tracking functions
export const analytics = {
  // Content views
  trackContentView: (type: 'prompt' | 'instruction' | 'agent' | 'mcp' | 'tool', id: string, title: string, properties?: Record<string, any>) => {
    trackEvent('content_viewed', {
      content_type: type,
      content_id: id,
      content_title: title,
      ...properties,
    });
  },

  // Votes
  trackVote: (type: 'prompt' | 'instruction' | 'agent' | 'mcp' | 'tool', id: string, value: 1 | -1) => {
    trackEvent('content_voted', {
      content_type: type,
      content_id: id,
      vote_value: value,
    });
  },

  // Favorites
  trackFavorite: (type: 'prompt' | 'instruction' | 'agent' | 'mcp' | 'tool', id: string, action: 'added' | 'removed') => {
    trackEvent('content_favorited', {
      content_type: type,
      content_id: id,
      action,
    });
  },

  // Copy actions
  trackCopy: (type: 'prompt' | 'instruction' | 'agent', id: string, contentLength: number) => {
    trackEvent('content_copied', {
      content_type: type,
      content_id: id,
      content_length: contentLength,
    });
  },

  // Search
  trackSearch: (query: string, resultsCount: number, type?: string) => {
    trackEvent('search_performed', {
      query,
      results_count: resultsCount,
      search_type: type || 'all',
    });
  },

  // Category clicks
  trackCategoryClick: (category: string, source: 'homepage' | 'sidebar' | 'filter') => {
    trackEvent('category_clicked', {
      category,
      source,
    });
  },

  // External links
  trackExternalLink: (url: string, type: 'github' | 'website' | 'other') => {
    trackEvent('external_link_clicked', {
      url,
      link_type: type,
    });
  },

  // Downloads
  trackDownload: (type: 'instruction' | 'agent', id: string, title: string) => {
    trackEvent('content_downloaded', {
      content_type: type,
      content_id: id,
      content_title: title,
    });
  },

  // User actions
  trackUserAction: (action: 'sign_in' | 'sign_out' | 'sign_up') => {
    trackEvent('user_action', {
      action,
    });
  },
};

