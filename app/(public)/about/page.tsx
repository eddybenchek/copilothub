import { Metadata } from 'next';
import { Bot, Github, Users, Sparkles, Code, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About CopilotHub',
  description: 'Learn about CopilotHub - A curated directory of prompts, instructions, agents, and tools for AI-powered development.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-sky-500/20 p-6">
              <Bot className="h-16 w-16 text-purple-400" />
            </div>
          </div>
          <h1 className="mb-4 text-5xl font-bold text-foreground">Why We Built CopilotHub</h1>
          <p className="text-xl text-muted-foreground">
            A curated directory for the AI-powered development community
          </p>
        </div>

        {/* Main Story */}
        <div className="mb-12">
          <div className="prose prose-invert dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-foreground/90 mb-6">
              Our journey with AI-powered development tools like GitHub Copilot and Cursor has been transformative. 
              As developers, we&apos;ve experienced firsthand how these tools significantly accelerate our development process. 
              This efficiency boost gave us the opportunity to explore, experiment, and discover the best practices for 
              working with AI assistants.
            </p>
            <p className="text-lg leading-relaxed text-foreground/90 mb-6">
              However, we noticed a challenge: finding high-quality prompts, instructions, agents, and tools was scattered 
              across GitHub repositories, forums, and various documentation sites. There wasn&apos;t a centralized place where 
              developers could discover, share, and learn from the best AI-powered development resources.
            </p>
            <p className="text-lg leading-relaxed text-foreground/90 mb-6">
              That&apos;s why we built <strong className="text-primary">CopilotHub</strong> — a curated directory that brings 
              together the best prompts, instructions, agents, MCP servers, and tools for AI-powered development. 
              Our mission is to help developers discover, learn, and contribute to the growing ecosystem of AI development tools.
            </p>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <CardTitle>Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-card-foreground/90">
                To create the most comprehensive and accessible directory of AI-powered development resources, 
                making it easier for developers to discover, learn, and contribute to the future of software development.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 dark:text-red-400" />
                <CardTitle>Our Values</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-card-foreground/90">
                <li>Open source and community-driven</li>
                <li>Quality over quantity</li>
                <li>Accessibility for all developers</li>
                <li>Continuous improvement</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* What We Offer */}
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-foreground">What We Offer</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Code className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Curated prompts for code review, debugging, documentation, and more
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="mb-2 h-6 w-6 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Coding standards and best practices for specific file patterns
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="mb-2 h-6 w-6 text-teal-600 dark:text-teal-400" />
                <CardTitle className="text-lg">Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Specialized AI agents for various development tasks
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code className="mb-2 h-6 w-6 text-green-600 dark:text-green-400" />
                <CardTitle className="text-lg">Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Essential tools and extensions for AI-powered workflows
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="mb-2 h-6 w-6 text-yellow-400" />
                <CardTitle className="text-lg">MCP Servers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  Model Context Protocol servers for enhanced AI capabilities
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="mb-2 h-6 w-6 text-pink-400" />
                <CardTitle className="text-lg">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  A vibrant community of developers sharing knowledge
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How to Contribute */}
        <div className="mb-12 rounded-lg border border-border bg-card p-8">
          <h2 className="mb-4 text-3xl font-bold text-foreground">How to Contribute</h2>
          <p className="mb-6 text-lg text-foreground/90">
            CopilotHub is built by the community, for the community. We welcome contributions through GitHub!
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                1
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Fork the Repository</h3>
                <p className="text-muted-foreground">
                  Start by forking our{' '}
                  <Link href="https://github.com/eddybenchek/copilothub" className="text-primary hover:text-primary/80">
                    GitHub repository
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                2
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Add Your Content</h3>
                <p className="text-muted-foreground">
                  Add your prompts, instructions, agents, or tools following our contribution guidelines
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                3
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Submit a Pull Request</h3>
                <p className="text-muted-foreground">
                  Create a pull request with a clear description of your contribution
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                4
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Review & Merge</h3>
                <p className="text-muted-foreground">
                  Our team will review your contribution and merge it if it meets our quality standards
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild>
              <Link href="https://github.com/eddybenchek/copilothub" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                Contribute on GitHub
              </Link>
            </Button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/10 dark:to-purple-500/10 p-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">Join the Community</h2>
          <p className="mb-6 text-lg text-foreground/90">
            Start exploring, contributing, and building the future of AI-powered development
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/prompts">Explore Prompts</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/agents">Browse Agents</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/rules">Read Guidelines</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

