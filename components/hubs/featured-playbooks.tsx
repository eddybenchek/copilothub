'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/copy-button';
import { BookOpen, Sparkles } from 'lucide-react';
import type { InstructionWithAuthor } from '@/lib/types';

interface FeaturedPlaybooksProps {
  playbooks: InstructionWithAuthor[];
}

export function FeaturedPlaybooks({ playbooks }: FeaturedPlaybooksProps) {
  const createPromptPack = (playbook: InstructionWithAuthor) => {
    return `# Spring Boot Migration Prompt Pack: ${playbook.title}

${playbook.description}

## Migration Steps:
${playbook.content.split('\n').slice(0, 10).join('\n')}

## Full Guide:
Visit: https://copilothub.directory/instructions/${playbook.slug}
`;
  };

  if (playbooks.length === 0) {
    return null;
  }

  return (
    <section id="featured" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-4 sm:mb-6 flex items-center gap-2">
        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Featured Playbooks</h2>
      </div>
      
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {playbooks.map((playbook) => {
          const voteCount = playbook.votes?.reduce((sum, vote) => sum + (vote.value || 0), 0) || 0;
          const summary = playbook.description.split('.').slice(0, 2).join('.') + '.';
          
          return (
            <Card
              key={playbook.id}
              className="relative border-2 border-primary/20 bg-gradient-to-br from-card to-card shadow-lg transition-all hover:border-primary/40 hover:shadow-xl"
            >
              <div className="absolute right-4 top-4">
                <Badge className="bg-primary/10 text-primary">Recommended</Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl pr-16">{playbook.title}</CardTitle>
                <CardDescription className="mt-2 line-clamp-2 text-sm">{summary}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {playbook.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="w-full sm:flex-1">
                  <Link href={`/instructions/${playbook.slug}`} className="justify-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Open playbook
                  </Link>
                </Button>
                <CopyButton
                  text={createPromptPack(playbook)}
                  variant="outline"
                  size="md"
                  className="w-full sm:flex-1"
                >
                  Copy prompt pack
                </CopyButton>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
