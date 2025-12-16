import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './db';
import type { Adapter } from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Store GitHub username when user signs in
      if (account?.provider === 'github' && profile && 'login' in profile) {
        const githubUsername = profile.login as string;
        if (githubUsername && user.id) {
          try {
            await db.user.update({
              where: { id: user.id },
              data: { githubUsername: githubUsername.toLowerCase() },
            });
          } catch (error) {
            // Silently fail if update fails (e.g., user doesn't exist yet, will be handled by adapter)
            console.error('Error updating GitHub username:', error);
          }
        }
      }
      return true;
    },
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
        // @ts-ignore - adding custom property
        session.user.role = user.role;
        // @ts-ignore - adding custom property
        session.user.githubUsername = (user as any).githubUsername;
      }
      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      // If url is a relative URL, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If url is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Otherwise, redirect to baseUrl
      return baseUrl;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'database',
  },
};

