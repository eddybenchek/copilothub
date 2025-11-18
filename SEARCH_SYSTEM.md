# Global Search System Documentation

## Overview

A comprehensive global search system inspired by cursor.directory, featuring instant client-side filtering, keyboard navigation, and a premium user experience.

## Features Implemented

### 1. **Search API** (`/api/search`)
- **Route**: `app/api/search/route.ts`
- **Query Parameters**:
  - `q` - Search query string
  - `type` - Filter by content type (all, prompt, workflow, tool)
  - `difficulty` - Filter by difficulty (BEGINNER, INTERMEDIATE, ADVANCED)
  - `tags` - Comma-separated list of tags
  
- **Response Structure**:
```json
{
  "prompts": Prompt[],
  "workflows": Workflow[],
  "tools": Tool[],
  "query": string,
  "totalResults": number
}
```

- **Search Logic**:
  - Searches across `title`, `description`, and `content` fields
  - Case-insensitive search using Prisma's `contains` with `mode: 'insensitive'`
  - Only returns APPROVED content
  - Limits to 20 results per type
  - Orders by most recent

### 2. **Global Search Component** (`<GlobalSearch />`)
- **Location**: `components/search/global-search.tsx`
- **Features**:
  - Large, centered search bar
  - Animated focus state with glow effect and scale
  - Auto-navigation to `/search` page on submit
  - Clear button when query is entered
  - Popular tag suggestions below search bar
  - Responsive design

- **Animations**:
  - Border color transition on focus (sky-500)
  - Shadow glow effect: `shadow-[0_0_30px_rgba(56,189,248,0.3)]`
  - Scale transform: `scale-[1.02]` on focus
  - Animated gradient underline

### 3. **Search Page** (`/search`)
- **Location**: `app/(public)/search/page.tsx`
- **Features**:
  - Real-time client-side filtering
  - Server-side search with query parameters for SEO
  - Advanced filters:
    - Type filter (All, Prompt, Workflow, Tool)
    - Difficulty filter (All, Beginner, Intermediate, Advanced)
  - Mobile-responsive filter toggle
  - Empty state handling
  - Loading state with spinner

### 4. **Results Display**
- **Layout**: 3 sections (Prompts, Workflows, Tools)
- **Grid**: Responsive grid (1 col mobile → 3 cols desktop)
- **Cards**: Uses existing card components:
  - `<PromptCard />`
  - `<WorkflowCard />`
  - `<ToolCard />`

### 5. **Keyboard Navigation**
- **↑ / ↓ Arrow Keys**: Navigate through all results
- **Enter**: Open selected result
- **Visual Indicator**: Ring around selected card (`ring-2 ring-sky-500`)
- **Hint**: Keyboard shortcuts displayed at bottom of results

### 6. **Homepage Integration**
- **Location**: `app/page.tsx`
- **Placement**: Hero section, below title and description
- **Spacing**: Integrated with 12px margin bottom
- **Popular tags**: Quick access to common searches

### 7. **Navigation**
- **Header Link**: Added "Search" link to main navigation
- **Position**: First item in navigation menu
- **Mobile**: Included in mobile menu

### 8. **SEO & Metadata**
- **Layout**: `app/(public)/search/layout.tsx`
- **Title**: "Search – CopilotHub"
- **Description**: "Search through curated AI prompts, workflows, and tools for GitHub Copilot"
- **Open Graph**: Configured for social sharing
- **URL Parameters**: Support for server-side rendering with query params

## Usage Examples

### Basic Search
```
/search?q=typescript
```

### Filtered Search
```
/search?q=api&type=prompt&difficulty=ADVANCED
```

### Tag Search
```
/search?tags=react,typescript
```

## Component Hierarchy

```
HomePage
  └─ GlobalSearch (search bar with popular tags)

SearchPage
  ├─ Search Input (with filters)
  ├─ Type Filters (all, prompt, workflow, tool)
  ├─ Difficulty Filters (all, beginner, intermediate, advanced)
  └─ Results Grid
      ├─ Prompts Section
      │   └─ PromptCard (for each result)
      ├─ Workflows Section
      │   └─ WorkflowCard (for each result)
      └─ Tools Section
          └─ ToolCard (for each result)
```

## Styling & Design

### Search Bar (GlobalSearch)
- **Container**: `max-w-3xl` centered
- **Border**: Rounded 2xl with transition
- **Background**: `bg-slate-900/40` with backdrop blur
- **Focus State**: 
  - Border: `border-sky-500/60`
  - Shadow: `shadow-[0_0_30px_rgba(56,189,248,0.3)]`
  - Scale: `scale-[1.02]`
- **Icon**: Search icon that changes color on focus

### Search Page
- **Filters**: Pill-style buttons with active state
- **Active State**: Sky blue background with border
- **Mobile**: Collapsible filters with toggle button
- **Results**: Clean card grid with hover effects

### Keyboard Navigation
- **Selected Card**: Blue ring (`ring-2 ring-sky-500`)
- **Hint**: Subtle gray text with kbd styling

## Performance Optimizations

1. **Client-Side Filtering**: Instant results without API calls
2. **Debounced URL Updates**: Prevents excessive navigation
3. **Memoized Results**: `useMemo` for efficient re-renders
4. **Limited Results**: Max 20 per type to keep response fast
5. **Index Fields**: Prisma searches on indexed fields

## Mobile Responsiveness

- Search bar scales appropriately
- Filters collapse behind toggle button
- Grid adapts: 1 col → 2 col → 3 col
- Popular tags wrap gracefully
- Touch-friendly button sizes

## Future Enhancements

### Potential Additions
- [ ] Search suggestions/autocomplete
- [ ] Recent searches
- [ ] Save searches (for authenticated users)
- [ ] Advanced filters (date range, author)
- [ ] Search analytics
- [ ] Fuzzy search / typo tolerance
- [ ] Highlighted search terms in results
- [ ] Infinite scroll / pagination
- [ ] Filter by multiple tags
- [ ] Sort options (relevance, date, popularity)

## File Structure

```
app/
├── api/
│   └── search/
│       └── route.ts          # Search API endpoint
├── (public)/
│   └── search/
│       ├── page.tsx          # Main search page
│       └── layout.tsx        # SEO metadata
└── page.tsx                  # Homepage (with GlobalSearch)

components/
├── search/
│   └── global-search.tsx     # Search component
├── layout/
│   └── site-header.tsx       # Updated with Search link
├── prompt/
│   └── prompt-card.tsx       # Used in results
├── workflow/
│   └── workflow-card.tsx     # Used in results
└── tool/
    └── tool-card.tsx         # Used in results
```

## Testing Checklist

- [x] Search API returns correct results
- [x] Search bar navigates to search page
- [x] Filters work correctly
- [x] Keyboard navigation cycles results
- [x] Enter key opens selected result
- [x] Mobile filters toggle
- [x] Empty state displays
- [x] Loading state works
- [x] Popular tags navigate correctly
- [x] URL parameters update
- [x] SEO metadata present
- [x] No linter errors

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

**Created**: November 18, 2025  
**Status**: ✅ Complete

