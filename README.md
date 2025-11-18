# Copilot Directory

A curated collection of prompts, workflows, and tools for AI-powered development. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

- **Curated Prompts**: Browse and submit AI prompts for code review, documentation, debugging, and more
- **Complete Workflows**: Step-by-step guides for building features, APIs, and components
- **Essential Tools**: Discover tools and extensions that enhance your AI-powered workflow
- **GitHub Authentication**: Secure login with NextAuth and GitHub OAuth
- **Community Voting**: Upvote and downvote content to surface the best resources
- **Dark Theme**: Beautiful UI inspired by GitHub Copilot

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js with GitHub OAuth
- **Icons**: Lucide React
- **Validation**: Zod

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- GitHub OAuth App (for authentication)

### Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd copilot-directory
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

## 🗂️ Project Structure

```
copilot-directory/
├── app/                      # Next.js app directory
│   ├── (marketing)/          # Marketing pages
│   ├── (public)/             # Public content pages
│   │   ├── prompts/          # Prompts list and detail
│   │   ├── workflows/        # Workflows list and detail
│   │   ├── tools/            # Tools list and detail
│   │   └── submit/           # Content submission form
│   ├── (user)/               # Authenticated user pages
│   │   └── dashboard/        # User dashboard
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth routes
│   │   ├── prompts/          # Prompt CRUD
│   │   ├── workflows/        # Workflow CRUD
│   │   ├── tools/            # Tool CRUD
│   │   └── votes/            # Voting system
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
│
├── components/               # React components
│   ├── layout/               # Layout components
│   ├── prompt/               # Prompt components
│   ├── workflow/             # Workflow components
│   ├── tool/                 # Tool components
│   ├── ui/                   # UI primitives
│   └── copy-button.tsx       # Copy to clipboard
│
├── lib/                      # Utilities and helpers
│   ├── db.ts                 # Prisma client
│   ├── auth.ts               # NextAuth config
│   ├── prisma-helpers.ts     # Database queries
│   ├── slug.ts               # Slug generation
│   ├── types.ts              # TypeScript types
│   └── validation.ts         # Zod schemas
│
├── prisma/                   # Database schema
│   └── schema.prisma         # Prisma schema
│
└── scripts/                  # Utility scripts
    └── seed.ts               # Database seeding
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

- Submit new content (prompts, workflows, tools)
- Vote on content
- Access their dashboard

## 📊 Database Schema

The database includes the following main models:

- **User**: User accounts from GitHub OAuth
- **Prompt**: AI prompts for various tasks
- **Workflow**: Step-by-step development workflows
- **Tool**: Development tools and extensions
- **Vote**: User votes on content
- **Account/Session**: NextAuth session management

See `prisma/schema.prisma` for the complete schema.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by [cursor.directory](https://cursor.directory)
- Design inspired by GitHub Copilot
- Built with amazing open-source tools

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Built with ❤️ and AI
