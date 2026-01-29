'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt/prompt-card';
import type { PromptWithAuthor } from '@/lib/types';
import { getAllPromptPacks } from '@/lib/hub-indexes/spring-boot-index';
import { ArrowRight } from 'lucide-react';

interface PromptPacksProps {
  prompts: PromptWithAuthor[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

function getPromptCategories() {
  const packs = getAllPromptPacks();
  return [
    { id: 'all', label: 'All', key: 'all' },
    ...packs.map((pack) => ({
      id: pack.key,
      label: pack.title,
      key: pack.key,
    })),
  ];
}

export function PromptPacks({ prompts, activeTab: externalTab, onTabChange }: PromptPacksProps) {
  const [internalTab, setInternalTab] = useState('all');
  const activeTab = externalTab || internalTab;
  
  const handleTabChange = (newTab: string) => {
    if (onTabChange) {
      onTabChange(newTab);
    } else {
      setInternalTab(newTab);
    }
  };

  const filterPrompts = (category: string) => {
    if (category === 'all') return prompts;
    
    // Get prompt pack config from hub index
    const packConfig = getAllPromptPacks().find(p => p.key === category);
    if (!packConfig) return prompts;
    
    // Filter prompts based on category with strict matching
    const filtered = prompts.filter(p => {
      const tagsLower = p.tags.map(t => t.toLowerCase());
      const titleLower = p.title.toLowerCase();
      const descLower = p.description.toLowerCase();
      const contentLower = (p.content || '').toLowerCase();
      
      // Category-specific strict filtering
      if (category === 'jakarta-refactor') {
        // Must specifically mention jakarta/javax/namespace in title or description
        const hasJakartaKeywords = titleLower.includes('jakarta') || 
                                  titleLower.includes('javax') ||
                                  titleLower.includes('namespace') ||
                                  descLower.includes('jakarta') ||
                                  descLower.includes('javax') ||
                                  descLower.includes('namespace');
        
        // Exclude build, testing, security, hibernate prompts
        const isExcluded = titleLower.includes('maven') || 
                          titleLower.includes('gradle') ||
                          titleLower.includes('build') ||
                          titleLower.includes('test') ||
                          titleLower.includes('testing') ||
                          titleLower.includes('security') ||
                          titleLower.includes('hibernate') ||
                          titleLower.includes('jpa');
        
        return hasJakartaKeywords && !isExcluded;
      }
      
      if (category === 'hibernate-jpa') {
        // Must specifically mention hibernate/jpa/entity/persistence in title or description
        const hasHibernateKeywords = titleLower.includes('hibernate') || 
                                    titleLower.includes('jpa') ||
                                    titleLower.includes('entity') ||
                                    titleLower.includes('persistence') ||
                                    descLower.includes('hibernate') ||
                                    descLower.includes('jpa') ||
                                    descLower.includes('entity') ||
                                    descLower.includes('persistence');
        
        // Exclude build, testing, security, jakarta prompts
        const isExcluded = titleLower.includes('maven') || 
                          titleLower.includes('gradle') ||
                          titleLower.includes('build') ||
                          titleLower.includes('test') ||
                          titleLower.includes('testing') ||
                          titleLower.includes('security') ||
                          titleLower.includes('jakarta') ||
                          titleLower.includes('javax');
        
        return hasHibernateKeywords && !isExcluded;
      }
      
      if (category === 'build-maven-gradle') {
        // Must specifically mention maven/gradle/build in title or description
        const hasBuildKeywords = titleLower.includes('maven') || 
                                titleLower.includes('gradle') ||
                                titleLower.includes('build') ||
                                titleLower.includes('pom.xml') ||
                                titleLower.includes('build.gradle') ||
                                descLower.includes('maven') ||
                                descLower.includes('gradle') ||
                                descLower.includes('build') ||
                                descLower.includes('pom.xml') ||
                                descLower.includes('build.gradle');
        
        // Exclude testing/verification prompts
        const isExcluded = titleLower.includes('dependency compatibility') || 
                          titleLower.includes('dependency verification') ||
                          titleLower.includes('test') ||
                          titleLower.includes('testing') ||
                          titleLower.includes('verification');
        
        return hasBuildKeywords && !isExcluded;
      }
      
      if (category === 'security-migration') {
        // Must specifically mention security/authentication/authorization in title or description
        const hasSecurityKeywords = titleLower.includes('security') || 
                                   titleLower.includes('authentication') ||
                                   titleLower.includes('authorization') ||
                                   descLower.includes('security') ||
                                   descLower.includes('authentication') ||
                                   descLower.includes('authorization');
        
        // Exclude build, testing, jakarta, hibernate prompts
        const isExcluded = titleLower.includes('maven') || 
                          titleLower.includes('gradle') ||
                          titleLower.includes('build') ||
                          titleLower.includes('test') ||
                          titleLower.includes('testing') ||
                          titleLower.includes('jakarta') ||
                          titleLower.includes('javax') ||
                          titleLower.includes('hibernate') ||
                          titleLower.includes('jpa');
        
        return hasSecurityKeywords && !isExcluded;
      }
      
      if (category === 'testing-verification') {
        // Must specifically mention test/testing/verification in title or description
        const hasTestingKeywords = titleLower.includes('test') || 
                                  titleLower.includes('testing') ||
                                  titleLower.includes('verification') ||
                                  titleLower.includes('junit') ||
                                  descLower.includes('test') ||
                                  descLower.includes('testing') ||
                                  descLower.includes('verification') ||
                                  descLower.includes('junit');
        
        // Exclude build prompts
        const isExcluded = titleLower.includes('maven') || 
                          titleLower.includes('gradle') ||
                          titleLower.includes('build');
        
        return hasTestingKeywords && !isExcluded;
      }
      
      return false;
    });
    
    // Return only the first 2 prompts for each category
    return filtered.slice(0, 2);
  };

  const filteredPrompts = filterPrompts(activeTab);

  if (prompts.length === 0) {
    return null;
  }

  const promptCategories = getPromptCategories();

  return (
    <section id="prompt-packs" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
          Copilot Prompt Packs for Spring Boot
        </h2>
        <Button variant="outline" size="sm" className="text-xs" asChild>
          <Link href="/spring-boot/prompt-packs">
            View all packs
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
