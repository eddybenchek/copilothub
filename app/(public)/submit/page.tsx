'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ContentType = 'prompt' | 'workflow' | 'tool';

export default function SubmitPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType>('prompt');
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold">Submit Content</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Please sign in to submit prompts, workflows, or tools.
          </p>
          <Button onClick={() => router.push('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      content: formData.get('content'),
      tags: (formData.get('tags') as string).split(',').map((t) => t.trim()),
      difficulty: formData.get('difficulty'),
      ...(contentType === 'workflow' && {
        steps: (formData.get('steps') as string).split('\n').filter((s) => s.trim()),
      }),
      ...(contentType === 'tool' && {
        url: formData.get('url'),
      }),
    };

    try {
      const response = await fetch(`/api/${contentType}s`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push(`/${contentType}s`);
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Submit Content</h1>
          <p className="text-lg text-muted-foreground">
            Share your prompts, workflows, or tools with the community.
          </p>
        </div>

        {/* Content Type Selector */}
        <div className="mb-8 flex gap-2">
          <Button
            variant={contentType === 'prompt' ? 'primary' : 'outline'}
            onClick={() => setContentType('prompt')}
          >
            Prompt
          </Button>
          <Button
            variant={contentType === 'workflow' ? 'primary' : 'outline'}
            onClick={() => setContentType('workflow')}
          >
            Workflow
          </Button>
          <Button
            variant={contentType === 'tool' ? 'primary' : 'outline'}
            onClick={() => setContentType('tool')}
          >
            Tool
          </Button>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit a {contentType}</CardTitle>
            <CardDescription>
              Fill in the details below. Your submission will be reviewed before being published.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium">
                  Title *
                </label>
                <Input id="title" name="title" required placeholder="Enter a descriptive title" />
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium">
                  Description *
                </label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  placeholder="Brief description of what this does"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="content" className="mb-2 block text-sm font-medium">
                  {contentType === 'prompt' ? 'Prompt Content' : 'Content'} *
                </label>
                <Textarea
                  id="content"
                  name="content"
                  required
                  placeholder={
                    contentType === 'prompt'
                      ? 'Enter your prompt here...'
                      : 'Enter detailed content...'
                  }
                  rows={10}
                />
              </div>

              {contentType === 'workflow' && (
                <div>
                  <label htmlFor="steps" className="mb-2 block text-sm font-medium">
                    Steps (one per line) *
                  </label>
                  <Textarea
                    id="steps"
                    name="steps"
                    required
                    placeholder="Step 1&#10;Step 2&#10;Step 3"
                    rows={6}
                  />
                </div>
              )}

              {contentType === 'tool' && (
                <div>
                  <label htmlFor="url" className="mb-2 block text-sm font-medium">
                    Tool URL
                  </label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    placeholder="https://example.com"
                  />
                </div>
              )}

              <div>
                <label htmlFor="tags" className="mb-2 block text-sm font-medium">
                  Tags (comma-separated) *
                </label>
                <Input
                  id="tags"
                  name="tags"
                  required
                  placeholder="react, typescript, api"
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="mb-2 block text-sm font-medium">
                  Difficulty *
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Submitting...' : `Submit ${contentType}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

