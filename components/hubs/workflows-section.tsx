'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCode, ArrowRight } from 'lucide-react';
import type { InstructionWithAuthor } from '@/lib/types';

interface WorkflowsSectionProps {
  workflows: InstructionWithAuthor[];
}

export function WorkflowsSection({ workflows }: WorkflowsSectionProps) {
  // Filter workflows from instructions
  const workflowInstructions = workflows.filter(i => 
    i.tags.includes('workflow') || 
    i.tags.includes('migration') ||
    i.slug.includes('migration')
  );

  // Create default workflows if none exist
  const defaultWorkflows = [
    {
      id: '2-3-sequence',
      title: '2→3 migration sequence (safe order)',
      description: 'Step-by-step guide for migrating Spring Boot 2 to 3 in the correct order',
      steps: 6,
      difficulty: 'ADVANCED' as const,
      href: '/instructions/spring-boot-2-to-3-migration',
    },
    {
      id: 'security-6',
      title: 'Security 6 migration workflow',
      description: 'Migrate from WebSecurityConfigurerAdapter to SecurityFilterChain',
      steps: 4,
      difficulty: 'INTERMEDIATE' as const,
      href: '/instructions/spring-boot-2-to-3-migration#security',
    },
    {
      id: 'hibernate-verification',
      title: 'Hibernate verification workflow',
      description: 'Verify and fix Hibernate 6 query issues after migration',
      steps: 5,
      difficulty: 'ADVANCED' as const,
      href: '/instructions/spring-boot-2-to-3-migration#hibernate',
    },
    {
      id: 'regression-test',
      title: 'Regression test plan workflow',
      description: 'Comprehensive testing strategy for migration validation',
      steps: 7,
      difficulty: 'INTERMEDIATE' as const,
      href: '/instructions/spring-boot-2-to-3-migration#testing',
    },
  ];

  const displayWorkflows = workflowInstructions.length > 0 
    ? workflowInstructions.slice(0, 4)
    : defaultWorkflows;

  return (
    <section id="workflows" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-semibold text-foreground">Step-by-step Workflows</h2>
      
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {displayWorkflows.map((workflow) => {
          const isInstruction = 'slug' in workflow;
          const steps = isInstruction ? 6 : ('steps' in workflow ? workflow.steps : 0);
          const difficulty = isInstruction ? workflow.difficulty : workflow.difficulty;
          const href = isInstruction ? `/instructions/${workflow.slug}` : workflow.href;
          
          return (
            <Card key={workflow.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">{workflow.title}</CardTitle>
                <CardDescription className="mt-2 line-clamp-2 text-sm">
                  {workflow.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {steps} steps
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {difficulty}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full text-sm" asChild>
                  <Link href={href} className="justify-center">
                    <FileCode className="mr-2 h-4 w-4" />
                    Open workflow
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
