import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'CopilotHub - AI Prompts, Agents, Tools & MCP Servers',
    template: '%s | CopilotHub',
  },
  description: 'A curated collection of AI prompts, agents, tools, MCP servers, and instructions for GitHub Copilot. Enhance your development workflow with community-driven resources.',
  keywords: ['GitHub Copilot', 'AI prompts', 'AI agents', 'MCP servers', 'development tools', 'coding assistance', 'AI development'],
  authors: [{ name: 'CopilotHub' }],
  creator: 'CopilotHub',
  publisher: 'CopilotHub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'CopilotHub',
    title: 'CopilotHub - AI Prompts, Agents, Tools & MCP Servers',
    description: 'A curated collection of AI prompts, agents, tools, MCP servers, and instructions for GitHub Copilot.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CopilotHub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CopilotHub - AI Prompts, Agents, Tools & MCP Servers',
    description: 'A curated collection of AI prompts, agents, tools, MCP servers, and instructions for GitHub Copilot.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
