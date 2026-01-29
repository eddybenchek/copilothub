'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Star } from 'lucide-react';
import { ToolCard } from '@/components/tool/tool-card';
import type { ToolWithAuthor } from '@/lib/types';

interface ToolsReposSectionProps {
  tools: ToolWithAuthor[];
}

const recommendedRepos = [
  {
    name: 'Spring Boot 2 → 3 Migration',
    description: 'Complete migration playbook with Copilot prompts',
    url: 'https://github.com/eddybenchek/copilothub',
    repo: 'copilot-migration-playbooks/java/spring-boot-2-to-3',
  },
  {
    name: 'Spring Boot 3 → 4 Upgrade',
    description: 'Upgrade guide and validation workflows',
    url: 'https://github.com/eddybenchek/copilothub',
    repo: 'copilot-migration-playbooks/java/spring-boot-3-to-4',
  },
];

const recommendedTools = [
  {
    name: 'OpenRewrite',
    description: 'Automated code refactoring for Spring Boot migrations',
    url: 'https://docs.openrewrite.org/',
  },
  {
    name: 'Spring Boot Migrator',
    description: 'Official Spring Boot migration tool',
    url: 'https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide',
  },
  {
    name: 'Testcontainers',
    description: 'Integration testing for Spring Boot applications',
    url: 'https://java.testcontainers.org/',
  },
];

import { SectionHeader } from './section-header';
import { Wrench } from 'lucide-react';

export function ToolsReposSection({ tools }: ToolsReposSectionProps) {
  return (
    <section id="tools" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <SectionHeader 
        id="tools" 
        title="Tools & Repositories" 
        icon={<Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
      />
      
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {/* Left: Recommended Tools */}
        <div>
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-foreground">Recommended Tools</h3>
          <div className="space-y-3 sm:space-y-4">
            {recommendedTools.map((tool) => (
              <Card key={tool.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base">{tool.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm" asChild>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      Visit
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {/* Show actual tools if available */}
            {tools.slice(0, 2).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>

        {/* Right: GitHub Playbooks */}
        <div>
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-foreground">GitHub Playbooks</h3>
          <div className="space-y-3 sm:space-y-4">
            {recommendedRepos.map((repo) => (
              <Card key={repo.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 sm:h-5 sm:w-5 text-foreground flex-shrink-0" />
                    <CardTitle className="text-sm sm:text-base">{repo.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">{repo.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                  <Button variant="primary" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="justify-center">
                      <Star className="mr-2 h-4 w-4" />
                      Star repo
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" asChild>
                    <a href={`${repo.url}/pulls`} target="_blank" rel="noopener noreferrer" className="justify-center">
                      Open PR
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
