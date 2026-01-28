'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PromptCard } from '@/components/prompt/prompt-card';
import type { PromptWithAuthor } from '@/lib/types';

interface PromptPacksProps {
  prompts: PromptWithAuthor[];
}

const promptCategories = [
  { id: 'all', label: 'All' },
  { id: 'jakarta', label: 'Jakarta refactor' },
  { id: 'security', label: 'Security migration' },
  { id: 'hibernate', label: 'Hibernate/JPA' },
  { id: 'testing', label: 'Testing & verification' },
  { id: 'build', label: 'Build (Maven/Gradle)' },
];

export function PromptPacks({ prompts }: PromptPacksProps) {
  const [activeTab, setActiveTab] = useState('all');

  const filterPrompts = (category: string) => {
    if (category === 'all') return prompts;
    
    // Strict category mapping - each category has specific tags/keywords
    const categoryMap: Record<string, { requiredTags: string[]; titleKeywords: string[]; excludeTags?: string[] }> = {
      jakarta: {
        requiredTags: ['jakarta', 'javax', 'jakarta-ee', 'namespace'],
        titleKeywords: ['jakarta', 'javax', 'namespace'],
        excludeTags: ['security', 'hibernate', 'jpa', 'testing', 'maven', 'gradle'],
      },
      security: {
        requiredTags: ['spring-security', 'security'],
        titleKeywords: ['security', 'spring-security', 'filter chain', 'configurer adapter', 'websecurity'],
        excludeTags: ['jakarta', 'javax', 'hibernate', 'jpa', 'testing', 'maven', 'gradle'],
      },
      hibernate: {
        requiredTags: ['hibernate', 'jpa'],
        titleKeywords: ['hibernate', 'jpa', 'jpql', 'entity mapping', 'query parsing'],
        excludeTags: ['jakarta', 'javax', 'security', 'testing', 'maven', 'gradle'],
      },
      testing: {
        requiredTags: ['testing', 'test', 'verification'],
        titleKeywords: ['test suite', 'migration test', 'verification', 'dependency compatibility'],
        // Don't exclude maven/gradle for testing - dependency verification can mention build tools
      },
      build: {
        requiredTags: ['maven', 'gradle'],
        titleKeywords: ['maven', 'gradle', 'pom.xml', 'build.gradle', 'build for spring boot'],
        excludeTags: ['testing', 'verification'], // Exclude testing prompts
      },
    };

    const categoryConfig = categoryMap[category];
    if (!categoryConfig) return prompts;

    return prompts.filter(p => {
      const tagsLower = p.tags.map(t => t.toLowerCase());
      const titleLower = p.title.toLowerCase();
      const descLower = p.description.toLowerCase();
      
      // Exclude if it has exclude tags (unless it also has required tags)
      if (categoryConfig.excludeTags) {
        const hasExcludeTag = categoryConfig.excludeTags.some(excludeTag =>
          tagsLower.includes(excludeTag.toLowerCase())
        );
        
        // If it has exclude tag, check if it also has required tag
        if (hasExcludeTag) {
          const hasRequiredTag = categoryConfig.requiredTags.some(reqTag =>
            tagsLower.includes(reqTag.toLowerCase())
          );
          // If no required tag, exclude it
          if (!hasRequiredTag) {
            return false;
          }
        }
      }
      
      // Check if it has required tags
      const hasRequiredTag = categoryConfig.requiredTags.some(tag => 
        tagsLower.includes(tag.toLowerCase())
      );
      
      if (hasRequiredTag) {
        // For build category, make sure it's specifically about build configuration
        if (category === 'build') {
          // Must have maven OR gradle tag, AND title should mention build/maven/gradle/pom.xml/build.gradle
          const hasBuildTag = tagsLower.includes('maven') || tagsLower.includes('gradle');
          const titleMatchesBuild = titleLower.includes('maven') || 
                                   titleLower.includes('gradle') || 
                                   titleLower.includes('build') ||
                                   titleLower.includes('pom.xml') ||
                                   titleLower.includes('build.gradle');
          
          // Exclude dependency verification prompts (they belong in testing)
          if (titleLower.includes('dependency compatibility') || 
              titleLower.includes('dependency verification')) {
            return false;
          }
          
          return hasBuildTag && titleMatchesBuild;
        }
        
        // For testing category, include verification prompts
        if (category === 'testing') {
          // Include test suite and verification prompts
          return true;
        }
        
        return true;
      }
      
      // If no required tag, check title keywords
      const matchesTitle = categoryConfig.titleKeywords.some(keyword => 
        titleLower.includes(keyword.toLowerCase())
      );
      
      return matchesTitle;
    });
  };

  const filteredPrompts = filterPrompts(activeTab);

  if (prompts.length === 0) {
    return null;
  }

  return (
    <section id="prompt-packs" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-semibold text-foreground">
        Copilot Prompt Packs for Spring Boot
      </h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 sm:mb-6 grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto">
          {promptCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm py-2">
              <span className="truncate">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {promptCategories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filterPrompts(category.id).map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
            {filterPrompts(category.id).length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No prompts found in this category.
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
