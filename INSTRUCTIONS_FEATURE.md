# 📋 Instructions Feature

A comprehensive implementation of GitHub Copilot Instructions for CopilotHub.

## Overview

**Instructions** are coding standards and best practices that automatically apply to specific file patterns. Unlike one-time prompts, instructions are persistent rules that guide GitHub Copilot's behavior across your entire codebase.

## Features

### 🎯 Core Functionality
- ✅ Browse instructions by language, framework, and scope
- ✅ Preview rendered markdown with tabs (Preview / Raw / How to Use / Examples)
- ✅ Download formatted `.md` files ready for `.github/copilot-instructions.md`
- ✅ Copy to clipboard functionality
- ✅ Track views and downloads
- ✅ Vote and feature system
- ✅ Full-text search integration
- ✅ Featured instructions on homepage

### 📄 Detail Page Tabs

1. **Preview** - Beautifully rendered markdown content
2. **Raw Markdown** - Syntax-highlighted markdown source
3. **How to Use** - Step-by-step installation guide
4. **Examples** - Before/after code comparisons (when available)

### 🔍 Search Integration

Instructions are fully integrated into:
- Global search dropdown (📋 icon)
- `/search` page with filter pills
- Keyboard navigation
- Highlighting of search terms

## Database Schema

```prisma
model Instruction {
  id              String        @id @default(cuid())
  title           String
  slug            String        @unique
  description     String
  content         String        @db.Text
  filePattern     String?       // e.g., "*.tsx", "**/*.test.ts"
  language        String?       // e.g., "typescript", "python"
  framework       String?       // e.g., "react", "vue", "django"
  scope           String?       // "file", "project", "workspace"
  exampleBefore   String?       @db.Text
  exampleAfter    String?       @db.Text
  tags            String[]
  difficulty      Difficulty
  status          ContentStatus
  featured        Boolean       @default(false)
  downloads       Int           @default(0)
  views           Int           @default(0)
  authorId        String
  author          User          @relation(fields: [authorId], references: [id])
  votes           Vote[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

## Routes

### Pages
- `/instructions` - List all instructions
- `/instructions/[slug]` - Instruction detail with tabs

### API
- `/api/instructions/download` - Track downloads (POST)

## Import from awesome-copilot

### Option 1: Quick Seed (Recommended for Testing)

```bash
npm run seed:instructions
```

This creates 4 sample instructions instantly:
- React Component Best Practices
- TypeScript Error Handling
- API Route Security
- Python Docstring Standards

### Option 2: Full Import from GitHub

**⚠️ Rate Limits:**
- Unauthenticated: 60 requests/hour
- Authenticated: 5000 requests/hour

**Setup GitHub Token (Recommended):**

1. Go to https://github.com/settings/tokens
2. Create a Personal Access Token (classic)
3. Select scope: `public_repo` (read access to public repositories)
4. Copy the token

5. Add to your `.env` file:
```env
GITHUB_TOKEN="ghp_your_token_here"
```

6. Run the import:
```bash
npm run import:instructions
```

This will import ~59 instructions from [github/awesome-copilot](https://github.com/github/awesome-copilot).

### Import Features

- ✅ Auto-detects file patterns, languages, frameworks
- ✅ Extracts tags based on content analysis
- ✅ Handles updates for existing instructions
- ✅ Creates admin user if needed
- ✅ Delays between requests to avoid rate limiting

## Usage Examples

### For Users

1. Browse instructions at `/instructions`
2. Click an instruction to view details
3. Use tabs to:
   - Preview the rendered content
   - Copy raw markdown
   - Read installation guide
   - See before/after examples
4. Click "Download .md" to get formatted file
5. Add to `.github/copilot-instructions.md` in your repo

### For Developers

**Query instructions:**
```typescript
import { db } from '@/lib/db';

// Get featured instructions
const featured = await db.instruction.findMany({
  where: { featured: true, status: 'APPROVED' },
  include: { author: true, votes: true },
});

// Get by language
const tsInstructions = await db.instruction.findMany({
  where: { language: 'typescript' },
});

// Search
const results = await db.instruction.findMany({
  where: {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { has: query.toLowerCase() } },
    ],
  },
});
```

**Track downloads:**
```typescript
await db.instruction.update({
  where: { id },
  data: { downloads: { increment: 1 } },
});
```

## Components

### InstructionCard
```tsx
<InstructionCard instruction={instruction} />
```

Displays:
- Title with FileCode icon
- File pattern (if available)
- Description
- Language, framework, and tag badges
- Downloads, views, and vote count
- Featured star indicator

### DownloadButton
```tsx
<DownloadButton instruction={instruction} />
```

Downloads formatted markdown with metadata header and tracks download count.

### Tabs Component
```tsx
<Tabs defaultValue="preview">
  <TabsList>
    <TabsTrigger value="preview">Preview</TabsTrigger>
    <TabsTrigger value="raw">Raw</TabsTrigger>
  </TabsList>
  <TabsContent value="preview">...</TabsContent>
  <TabsContent value="raw">...</TabsContent>
</Tabs>
```

## Navigation Structure

Instructions is positioned strategically in the nav between **Prompts** and **Workflows**:

```
Search → Prompts → Instructions → Workflows → Tools → MCPs → Recipes → Migrations → Paths → Submit
```

## Homepage Section

Featured instructions appear in the "Coding Standards & Instructions" section:
- Only shows if there are featured instructions
- Displays up to 6 featured instructions
- "View all" button links to `/instructions`
- Consistent styling with other homepage sections

## Search Configuration

**Search dropdown:**
- Shows max 5 instruction results
- 📋 icon for Instructions section
- Positioned after Prompts, before Workflows
- Keyboard navigation supported

**Search page:**
- Filter pill for "Instructions"
- Dedicated section when filtered
- Full-text search across title, description, content, tags

## Performance

- Instructions list: 2.17 kB
- Instruction detail: 2.84 kB
- Lazy-loaded markdown rendering
- Optimized database queries with indexes

## Future Enhancements

### Potential Premium Features
- 🔒 Private instructions (team-only)
- 📊 Usage analytics
- 🤝 Team collaboration
- 📦 Instruction bundles
- 🔄 Auto-sync with GitHub repos
- 🎨 Custom branding for downloads

### Community Features
- Comments and discussions
- Instruction collections
- Version history
- Fork and remix
- Contribution guidelines

## Troubleshooting

**GitHub API Rate Limit:**
```
Error: API rate limit exceeded
```

**Solution:** Add `GITHUB_TOKEN` to your `.env` file.

**Import fails:**
```
Default author not found
```

**Solution:** Run `npm run seed:instructions` first to create admin user.

**Build errors:**
Make sure `react-markdown` is installed:
```bash
npm install react-markdown
```

## Related Documentation

- [Model Context Protocol (MCPs)](./MCP_IMPLEMENTATION.md)
- [GitHub Copilot Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)
- [awesome-copilot Repository](https://github.com/github/awesome-copilot)

