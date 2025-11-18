import Link from 'next/link';
import { Github } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Copilot Directory</h3>
            <p className="text-sm text-muted-foreground">
              A curated collection of prompts, workflows, and tools for AI-powered development.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/prompts" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Prompts
                </Link>
              </li>
              <li>
                <Link href="/workflows" className="text-muted-foreground hover:text-foreground transition-colors">
                  Workflows
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tools
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-muted-foreground hover:text-foreground transition-colors">
                  Submit Content
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Community</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
            <p className="text-xs text-muted-foreground pt-4">
              © {new Date().getFullYear()} Copilot Directory. Built with Next.js.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
