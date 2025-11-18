# Project Structure

Complete overview of the Copilot Directory project structure.

## 📁 Root Level

```
copilot-directory/
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── next.config.mjs         # Next.js configuration
├── next-env.d.ts           # Next.js TypeScript definitions
├── package.json            # Dependencies and scripts
├── postcss.config.cjs      # PostCSS configuration
├── tailwind.config.cjs     # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
├── README.md               # Main documentation
├── QUICKSTART.md           # Quick start guide
└── PROJECT_STRUCTURE.md    # This file
```

## 🎨 App Directory (app/)

Next.js 14 App Router structure with route groups:

### Marketing Routes `(marketing)/`
- `page.tsx` - Home page (redirects to main page)

### Public Routes `(public)/`
Public-facing content that doesn't require authentication:

#### Prompts
- `prompts/page.tsx` - List all prompts
- `prompts/[slug]/page.tsx` - Individual prompt detail

#### Workflows
- `workflows/page.tsx` - List all workflows
- `workflows/[slug]/page.tsx` - Individual workflow detail

#### Tools
- `tools/page.tsx` - List all tools
- `tools/[slug]/page.tsx` - Individual tool detail

#### Submit
- `submit/page.tsx` - Content submission form

### User Routes `(user)/`
Authenticated user pages:

- `dashboard/page.tsx` - User dashboard

### API Routes `api/`
RESTful API endpoints:

- `auth/[...nextauth]/route.ts` - NextAuth authentication
- `prompts/route.ts` - Prompt CRUD operations
- `workflows/route.ts` - Workflow CRUD operations
- `tools/route.ts` - Tool CRUD operations
- `votes/route.ts` - Voting system

### Core App Files
- `layout.tsx` - Root layout with header/footer
- `page.tsx` - Home page
- `providers.tsx` - Client-side providers (SessionProvider)
- `globals.css` - Global styles and Tailwind directives

## 🧩 Components (components/)

### Layout Components `layout/`
- `site-header.tsx` - Navigation header with auth
- `site-footer.tsx` - Footer with links

### Content Cards
- `prompt/prompt-card.tsx` - Prompt preview card
- `workflow/workflow-card.tsx` - Workflow preview card
- `tool/tool-card.tsx` - Tool preview card

### Utility Components
- `copy-button.tsx` - Copy to clipboard button

### UI Primitives `ui/`
Reusable UI components:

- `button.tsx` - Button with variants (primary, outline, ghost)
- `card.tsx` - Card container with header/content/footer
- `input.tsx` - Text input field
- `textarea.tsx` - Textarea field
- `badge.tsx` - Badge/tag component
- `skeleton.tsx` - Loading skeleton
- `dropdown-menu.tsx` - Dropdown menu

## 📚 Library (lib/)

Utilities and helpers:

- `db.ts` - Prisma client singleton
- `auth.ts` - NextAuth configuration
- `prisma-helpers.ts` - Database query helpers
- `slug.ts` - Slug generation utilities
- `types.ts` - Shared TypeScript types
- `validation.ts` - Zod validation schemas

## 🗄️ Database (prisma/)

- `schema.prisma` - Database schema definition
- `migrations/` - Database migrations (generated)

### Models
- User - User accounts
- Prompt - AI prompts
- Workflow - Development workflows
- Tool - Development tools
- Vote - User votes
- Account/Session - NextAuth tables

## 🔧 Scripts (scripts/)

- `seed.ts` - Database seeding script

## 🎨 Public (public/)

Static assets:

- `logo.svg` - Site logo
- `og-image.png` - Open Graph image

## 🔤 Types (types/)

- `next-auth.d.ts` - NextAuth type extensions

## 📦 Key Dependencies

### Production
- `next` - React framework
- `react` & `react-dom` - React library
- `@prisma/client` - Prisma ORM
- `next-auth` - Authentication
- `@auth/prisma-adapter` - Prisma adapter for NextAuth
- `zod` - Schema validation
- `lucide-react` - Icons
- `classnames` - Conditional CSS classes

### Development
- `typescript` - Type safety
- `tailwindcss` - Styling
- `prisma` - Database toolkit
- `eslint` - Code linting
- `tsx` - TypeScript execution

## 🚀 Scripts

```json
{
  "dev": "Start development server",
  "build": "Build for production",
  "start": "Start production server",
  "lint": "Run ESLint",
  "db:push": "Push schema to database",
  "db:migrate": "Run migrations",
  "db:seed": "Seed database"
}
```

## 🎯 Key Features by Directory

### Authentication Flow
- `app/api/auth/[...nextauth]/route.ts` - Auth endpoints
- `lib/auth.ts` - Auth configuration
- `components/layout/site-header.tsx` - Login UI

### Content Submission
- `app/(public)/submit/page.tsx` - Submission form
- `app/api/prompts/route.ts` - Create prompt
- `lib/validation.ts` - Input validation

### Content Display
- `app/page.tsx` - Home with featured content
- `app/(public)/*/page.tsx` - List pages
- `app/(public)/*/[slug]/page.tsx` - Detail pages
- `components/*/card.tsx` - Preview cards

### Database Operations
- `lib/db.ts` - Prisma client
- `lib/prisma-helpers.ts` - Query helpers
- `prisma/schema.prisma` - Data models

## 🔒 Environment Variables

Required environment variables (create `.env`):

```
DATABASE_URL          # PostgreSQL connection string
NEXTAUTH_URL          # App URL (http://localhost:3000)
NEXTAUTH_SECRET       # Random secret key
GITHUB_CLIENT_ID      # GitHub OAuth ID
GITHUB_CLIENT_SECRET  # GitHub OAuth secret
```

## 🎨 Styling System

- **Framework**: TailwindCSS
- **Theme**: Dark mode (GitHub Copilot inspired)
- **Colors**: Defined in `tailwind.config.cjs`
- **Typography**: Inter font (loaded in layout)

## 📝 Notes

- All routes use Server Components by default
- Client Components marked with `'use client'`
- Route groups `()` don't affect URL structure
- API routes use App Router's new Route Handlers
- Database queries are async Server Components

