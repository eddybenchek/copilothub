# Quick Start Guide

Get your Copilot Directory up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub account (for OAuth)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/copilot_directory?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
GITHUB_CLIENT_ID="get-from-github"
GITHUB_CLIENT_SECRET="get-from-github"
```

### Getting GitHub OAuth Credentials

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Copilot Directory Local
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID**
6. Generate a **Client Secret** and copy it
7. Add both to your `.env` file

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in your `.env` file.

## Step 3: Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed with example data
npm run db:seed
```

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 5: Sign In

1. Click "Sign in with GitHub" in the header
2. Authorize the application
3. You're ready to go!

## What's Next?

- Browse prompts at `/prompts`
- Check out workflows at `/workflows`
- Discover tools at `/tools`
- Submit your own content at `/submit`
- View your dashboard at `/dashboard`

## Common Issues

### Database Connection Error

- Make sure PostgreSQL is running
- Verify your `DATABASE_URL` is correct
- Check that the database exists

### OAuth Error

- Verify your GitHub OAuth credentials
- Make sure callback URL matches exactly
- Check that `NEXTAUTH_URL` is correct

### Build Errors

- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Make sure you're using Node.js 18+

## Production Deployment

For production deployment (Vercel, Railway, etc.):

1. Add environment variables in your hosting platform
2. Update `NEXTAUTH_URL` to your production URL
3. Update GitHub OAuth callback URL to production URL
4. Run `npm run build` to verify build works
5. Deploy!

## Need Help?

Check the main [README.md](./README.md) for more detailed documentation or open an issue on GitHub.

