# Analytics Setup Guide

CopilotHub uses **Vercel Analytics** and **PostHog** for comprehensive analytics tracking.

## Features Tracked

### Automatic Tracking
- **Page Views**: Tracked automatically via PostHog provider
- **Performance Metrics**: Tracked via Vercel Speed Insights

### Custom Events
- **Content Views**: When users view prompts, instructions, agents, MCPs, or tools
- **Votes**: Upvotes and downvotes on content
- **Favorites**: Adding/removing favorites
- **Copy Actions**: When users copy content
- **Search**: Search queries and result counts
- **Category Clicks**: Category navigation from homepage/sidebar
- **External Links**: GitHub and website link clicks
- **Downloads**: Content downloads

## Setup Instructions

### 1. Vercel Analytics

Vercel Analytics is automatically enabled when deployed on Vercel. No configuration needed!

### 2. PostHog Setup

1. **Create a PostHog account**:
   - Go to [https://posthog.com](https://posthog.com)
   - Sign up for a free account

2. **Get your API key**:
   - Navigate to Project Settings → API Keys
   - Copy your Project API Key

3. **Configure environment variables**:
   ```bash
   # .env.local
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

4. **Deploy**:
   - Analytics will start tracking automatically after deployment

## Environment Variables

Add these to your `.env.local` file:

```env
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## Event Reference

### Content Events

```typescript
// Content viewed
analytics.trackContentView(type, id, title, properties?)

// Content voted
analytics.trackVote(type, id, value)

// Content favorited
analytics.trackFavorite(type, id, action)

// Content copied
analytics.trackCopy(type, id, contentLength)

// Content downloaded
analytics.trackDownload(type, id, title)
```

### Navigation Events

```typescript
// Search performed
analytics.trackSearch(query, resultsCount, type?)

// Category clicked
analytics.trackCategoryClick(category, source)

// External link clicked
analytics.trackExternalLink(url, type)
```

## Viewing Analytics

### Vercel Analytics
- Available in your Vercel dashboard
- Navigate to your project → Analytics tab

### PostHog
- Log in to [https://posthog.com](https://posthog.com)
- View events, funnels, and user behavior
- Create custom dashboards

## Privacy

- PostHog is GDPR compliant
- No personally identifiable information is tracked by default
- User sessions are anonymized
- IP addresses are not stored

## Disabling Analytics

To disable PostHog in development:

```typescript
// lib/analytics.ts
// Comment out or remove the PostHog initialization
```

Or set an empty key:

```env
NEXT_PUBLIC_POSTHOG_KEY=
```

