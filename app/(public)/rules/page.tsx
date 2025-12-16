import { Metadata } from 'next';
import { FileText, CheckCircle, XCircle, AlertCircle, Github, Code, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Contribution Guidelines - CopilotHub',
  description: 'Learn how to contribute prompts, instructions, agents, and tools to CopilotHub via GitHub.',
};

export default function RulesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-lg bg-sky-500/20 p-3">
              <FileText className="h-8 w-8 text-sky-400" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-50">Contribution Guidelines</h1>
          <p className="text-lg text-slate-400">
            Everything you need to know about contributing to CopilotHub
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-8 border-sky-500/30 bg-sky-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5 text-sky-400" />
              GitHub-Based Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              CopilotHub uses a GitHub-based contribution model. All content submissions are made through 
              pull requests to our{' '}
              <Link href="https://github.com/eddybenchek/copilothub" className="text-sky-400 hover:text-sky-300">
                repository
              </Link>
              . This ensures quality, transparency, and proper attribution.
            </p>
          </CardContent>
        </Card>

        {/* Content Types */}
        <div className="mb-8">
          <h2 className="mb-6 text-3xl font-bold text-slate-50">What You Can Contribute</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-lg">Prompts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300">
                  High-quality prompts for code review, debugging, documentation, refactoring, and more.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Code className="h-5 w-5 text-sky-400" />
                  <CardTitle className="text-lg">Instructions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300">
                  Coding standards and best practices that apply to specific file patterns or languages.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-400" />
                  <CardTitle className="text-lg">Agents</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300">
                  Specialized AI agents for specific development tasks or domains.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Code className="h-5 w-5 text-green-400" />
                  <CardTitle className="text-lg">Tools & MCPs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300">
                  Development tools, extensions, and MCP servers that enhance AI-powered workflows.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quality Standards */}
        <div className="mb-8">
          <h2 className="mb-6 text-3xl font-bold text-slate-50">Quality Standards</h2>
          
          <div className="mb-6 space-y-4">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  What We Accept
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>Well-documented and tested content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>Clear, descriptive titles and descriptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>Proper categorization and tagging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>Original or properly attributed content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>Follows best practices and coding standards</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <XCircle className="h-5 w-5" />
                  What We Don&apos;t Accept
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <span>Low-quality or untested content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <span>Spam, promotional, or off-topic submissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <span>Copyrighted material without permission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <span>Content that violates ethical guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <span>Duplicate or near-duplicate submissions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contribution Process */}
        <div className="mb-8">
          <h2 className="mb-6 text-3xl font-bold text-slate-50">How to Contribute</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                    1
                  </div>
                  <CardTitle>Fork the Repository</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Start by forking the{' '}
                  <Link href="https://github.com/eddybenchek/copilothub" className="text-sky-400 hover:text-sky-300">
                    CopilotHub repository
                  </Link>{' '}
                  on GitHub.
                </p>
                <div className="rounded-lg bg-slate-800 p-4 font-mono text-sm text-slate-300">
                  git clone https://github.com/YOUR_USERNAME/copilothub.git
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                    2
                  </div>
                  <CardTitle>Create a Branch</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Create a new branch for your contribution with a descriptive name.
                </p>
                <div className="rounded-lg bg-slate-800 p-4 font-mono text-sm text-slate-300">
                  git checkout -b add-my-prompt
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                    3
                  </div>
                  <CardTitle>Add Your Content</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Add your content following the repository structure and format guidelines. Make sure to:
                </p>
                <ul className="mb-4 space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>Use clear, descriptive filenames</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>Include proper metadata (title, description, tags)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>Test your content before submitting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>Follow the existing code style and format</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                    4
                  </div>
                  <CardTitle>Submit a Pull Request</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Commit your changes and push to your fork, then create a pull request with:
                </p>
                <ul className="mb-4 space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                    <span>A clear, descriptive title</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                    <span>Detailed description of what you&apos;re adding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                    <span>Any relevant context or testing notes</span>
                  </li>
                </ul>
                <div className="rounded-lg bg-slate-800 p-4 font-mono text-sm text-slate-300">
                  git commit -m &quot;Add: My awesome prompt&quot;<br />
                  git push origin add-my-prompt
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                    5
                  </div>
                  <CardTitle>Review & Merge</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Our team will review your pull request. We may request changes or ask questions. 
                  Once approved, your contribution will be merged and appear on CopilotHub!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Code of Conduct */}
        <Card className="mb-8 border-purple-500/30 bg-purple-500/5">
          <CardHeader>
            <CardTitle>Code of Conduct</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-300">
              We are committed to providing a welcoming and inclusive environment for all contributors. 
              Please be respectful, constructive, and professional in all interactions.
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span>Be respectful and considerate of others</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span>Provide constructive feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span>Focus on what is best for the community</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span>Show empathy towards other community members</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="rounded-lg border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-purple-500/10 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-50">Ready to Contribute?</h2>
          <p className="mb-6 text-slate-300">
            Join our community and help build the best directory for AI-powered development resources
          </p>
          <Button asChild size="lg">
            <Link href="https://github.com/eddybenchek/copilothub" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              Start Contributing
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

