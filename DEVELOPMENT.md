# Development Guide

This guide is for developers who want to set up and contribute to CopilotHub's codebase.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js with GitHub OAuth
- **Icons**: Lucide React
- **Validation**: Zod
- **Analytics**: Vercel Analytics + PostHog

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- GitHub OAuth App (for authentication)

### Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd copilothub
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/copilot_directory?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Optional - GitHub API (for imports)
GITHUB_TOKEN="ghp_your_token_here"

# Optional - PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY="your_posthog_key"
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
```

To generate a `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

To create a GitHub OAuth App:
1. Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. Set Homepage URL to `http://localhost:3000`
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and generate a Client Secret

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database with example data
npm run db:seed
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with example data
- `npm run seed:instructions` - Seed instructions data
- `npm run seed:agents` - Seed agents data
- `npm run import:mcps` - Import MCPs from GitHub
- `npm run import:instructions` - Import instructions from awesome-copilot
- `npm run import:agents` - Import agents from awesome-copilot

## 🗂️ Project Structure

```
copilothub/
├── app/                      # Next.js app directory
│   ├── (marketing)/          # Marketing pages
│   ├── (public)/             # Public content pages
│   │   ├── prompts/          # Prompts list and detail
│   │   ├── instructions/     # Instructions list and detail
│   │   ├── agents/           # Agents list and detail
│   │   ├── tools/            # Tools list and detail
│   │   ├── mcps/             # MCPs list and detail
│   │   ├── search/           # Search page
│   │   └── submit/           # Content submission form
│   ├── (user)/               # Authenticated user pages
│   │   └── dashboard/        # User dashboard
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth routes
│   │   ├── prompts/          # Prompt CRUD
│   │   ├── instructions/     # Instruction CRUD
│   │   ├── agents/           # Agent CRUD
│   │   ├── tools/            # Tool CRUD
│   │   ├── mcps/             # MCP CRUD
│   │   ├── votes/            # Voting system
│   │   ├── favorites/        # Favorites system
│   │   └── collections/      # Collections system
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── robots.ts             # Robots.txt
│   └── sitemap.ts            # Sitemap generation
│
├── components/               # React components
│   ├── layout/               # Layout components
│   │   ├── site-header.tsx   # Site header/navigation
│   │   └── site-footer.tsx   # Site footer
│   ├── prompt/               # Prompt components
│   ├── instructions/         # Instruction components
│   ├── agents/               # Agent components
│   ├── tool/                 # Tool components
│   ├── mcp/                  # MCP components
│   ├── search/               # Search components
│   ├── analytics/            # Analytics components
│   ├── ui/                   # UI primitives
│   └── copy-button.tsx       # Copy to clipboard
│
├── lib/                      # Utilities and helpers
│   ├── db.ts                 # Prisma client
│   ├── auth.ts               # NextAuth config
│   ├── prisma-helpers.ts     # Database queries
│   ├── slug.ts               # Slug generation
│   ├── types.ts              # TypeScript types
│   ├── validation.ts         # Zod schemas
│   ├── search.ts             # Search functionality
│   ├── metadata.ts           # Metadata helpers
│   └── analytics.ts          # Analytics helpers
│
├── prisma/                   # Database schema
│   ├── schema.prisma         # Prisma schema
│   └── migrations/           # Database migrations
│
├── scripts/                  # Utility scripts
│   ├── seed.ts               # Database seeding
│   ├── seed-instructions.ts # Seed instructions
│   ├── seed-agents.ts        # Seed agents
│   ├── import-awesome-copilot.ts # Import from awesome-copilot
│   ├── import-agents.ts      # Import agents
│   └── import-mcps-simple.ts # Import MCPs
│
└── hooks/                    # React hooks
    └── use-debounced-value.ts # Debounced value hook
```

## 🎨 Design System

The project uses a dark theme inspired by GitHub Copilot with:

- Background: `#0d1117`
- Foreground: `#c9d1d9`
- Primary: `#58a6ff`
- Borders: `#30363d`
- Cards: `#161b22`

All colors are defined in `tailwind.config.cjs` and can be customized.

## 🔒 Authentication

The project uses NextAuth.js with GitHub OAuth for authentication. Users must sign in to:

- Submit new content (prompts, instructions, agents, tools, MCPs)
- Vote on content
- Add favorites
- Create collections
- Access their dashboard

### Authentication Flow

1. User clicks "Sign in with GitHub"
2. Redirected to GitHub OAuth
3. User authorizes the application
4. GitHub redirects back with authorization code
5. NextAuth exchanges code for access token
6. User session is created and stored in database
7. GitHub username is automatically synced to user profile

## 📊 Database Schema

The database includes the following main models:

- **User**: User accounts from GitHub OAuth
- **Prompt**: AI prompts for various tasks
- **Instruction**: Coding standards and best practices
- **Agent**: Specialized AI agents
- **Tool**: Development tools and extensions
- **McpServer**: MCP servers
- **Vote**: User votes on content
- **Favorite**: User favorites
- **Collection**: User collections of content
- **Account/Session**: NextAuth session management

See `prisma/schema.prisma` for the complete schema.

## 🔍 Search System

CopilotHub includes a comprehensive search system that searches across:

- Titles
- Descriptions
- Content (full text)
- Tags
- Language/Framework
- File patterns (for instructions)

Search is available via:
- Header dropdown (Cmd+K / Ctrl+K)
- Full search page at `/search`
- Type-specific filters

## 📈 Analytics

The project uses two analytics systems:

1. **Vercel Analytics**: Built-in performance and usage metrics
2. **PostHog**: Custom event tracking for user behavior

See `docs/ANALYTICS.md` for detailed analytics documentation.

## 🧪 Testing

Before submitting code:

1. Run the linter: `npm run lint`
2. Test the build: `npm run build`
3. Test all functionality locally
4. Ensure TypeScript compiles without errors

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Configure PostgreSQL database (Vercel Postgres or external)
4. Run migrations: `npx prisma migrate deploy`
5. Deploy!

### Required Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Production URL
- `NEXTAUTH_SECRET` - Random secret key
- `GITHUB_CLIENT_ID` - GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth Client Secret
- `GITHUB_TOKEN` - Optional, for GitHub API imports
- `NEXT_PUBLIC_POSTHOG_KEY` - Optional, for PostHog analytics
- `NEXT_PUBLIC_POSTHOG_HOST` - Optional, PostHog host URL

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

For contribution guidelines, see [README.md](./README.md#-contributing).

