import Link from 'next/link';
import { Github } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">CopilotHub</h3>
            <p className="text-sm text-muted-foreground">
              A curated collection of prompts, instructions, agents, and tools for AI-powered development.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/prompts" className="text-muted-foreground hover:text-foreground transition-colors">
                  Prompts
                </Link>
              </li>
              <li>
                <Link href="/instructions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Instructions
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-muted-foreground hover:text-foreground transition-colors">
                  Agents
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tools
                </Link>
              </li>
              <li>
                <Link href="/mcps" className="text-muted-foreground hover:text-foreground transition-colors">
                  MCPs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/rules" className="text-muted-foreground hover:text-foreground transition-colors">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Community</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com/eddybenchek/copilothub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
            <div className="pt-2">
              <a 
                href="https://github.com/eddybenchek/copilothub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contribute on GitHub →
              </a>
            </div>
            <p className="text-xs text-muted-foreground pt-4">
              © {new Date().getFullYear()} CopilotHub.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
