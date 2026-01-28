'use client';

import { useState } from 'react';
import { SpringBootHero } from '@/components/hubs/spring-boot-hero';
import { PathSelectionCards } from '@/components/hubs/path-selection-cards';
import { HubSearchFilter } from '@/components/hubs/hub-search-filter';
import { FeaturedPlaybooks } from '@/components/hubs/featured-playbooks';
import { MigrationCatalog } from '@/components/hubs/migration-catalog';
import { CommonErrorsGrid } from '@/components/hubs/common-errors-grid';
import { PromptPacks } from '@/components/hubs/prompt-packs';
import { WorkflowsSection } from '@/components/hubs/workflows-section';
import { ToolsReposSection } from '@/components/hubs/tools-repos-section';
import { FAQAccordion } from '@/components/hubs/faq-accordion';
import { CTAStrip } from '@/components/hubs/cta-strip';
import { StickyNav } from '@/components/hubs/sticky-nav';
import type { SpringBootContent } from '@/lib/hub-helpers';

interface SpringBootHubClientProps {
  content: SpringBootContent;
  stats: {
    playbooks: number;
    prompts: number;
    workflows: number;
    lastUpdated: Date | null;
  };
  featuredPlaybooks: any[];
}

export function SpringBootHubClient({ content, stats, featuredPlaybooks }: SpringBootHubClientProps) {
  const [filteredContent, setFilteredContent] = useState(content);

  return (
    <>
      <StickyNav />
      <div className="min-h-screen bg-background">
        <div id="overview">
          <SpringBootHero stats={stats} />
        </div>
        
        <PathSelectionCards />
        
        <HubSearchFilter content={content} onFilteredChange={setFilteredContent} />
        
        <FeaturedPlaybooks playbooks={featuredPlaybooks} />
        
        <MigrationCatalog />
        
        <CommonErrorsGrid />
        
        <PromptPacks prompts={filteredContent.prompts} />
        
        <WorkflowsSection workflows={filteredContent.instructions} />
        
        <ToolsReposSection tools={filteredContent.tools} />
        
        <FAQAccordion />
        
        <CTAStrip />
      </div>
    </>
  );
}
