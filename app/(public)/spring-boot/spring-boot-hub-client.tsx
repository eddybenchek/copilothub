'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SpringBootHero } from '@/components/hubs/spring-boot-hero';
import { PathSelectionCards } from '@/components/hubs/path-selection-cards';
import { HubSearchFilter } from '@/components/hubs/hub-search-filter';
import { PreFlightChecklist } from '@/components/hubs/pre-flight-checklist';
import { FeaturedPlaybooks } from '@/components/hubs/featured-playbooks';
import { MigrationCatalog } from '@/components/hubs/migration-catalog';
import { CommonErrorsGrid } from '@/components/hubs/common-errors-grid';
import { PromptPacks } from '@/components/hubs/prompt-packs';
import { WorkflowsSection } from '@/components/hubs/workflows-section';
import { ToolsReposSection } from '@/components/hubs/tools-repos-section';
import { FAQAccordion } from '@/components/hubs/faq-accordion';
import { CTAStrip } from '@/components/hubs/cta-strip';
import { RelatedMigrationHubs } from '@/components/hubs/related-migration-hubs';
import { StickyNav } from '@/components/hubs/sticky-nav';
import { SPRING_BOOT_SECTIONS } from '@/lib/hub-indexes/spring-boot-index';
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filteredContent, setFilteredContent] = useState(content);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read query params
  const tab = searchParams.get('tab');
  const pack = searchParams.get('pack');
  const error = searchParams.get('error');
  const migration = searchParams.get('migration');

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle anchor navigation with query params
  useEffect(() => {
    if (!isHydrated) return;

    const hash = window.location.hash.slice(1);
    if (hash) {
      // Wait for filters to apply, then scroll
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 300);
    }
  }, [isHydrated, searchParams]);

  // Update URL when filters change (for shareability)
  const updateFilters = (newTab?: string, newPack?: string, newError?: string, newMigration?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newTab) params.set('tab', newTab);
    else params.delete('tab');
    
    if (newPack) params.set('pack', newPack);
    else params.delete('pack');
    
    if (newError) params.set('error', newError);
    else params.delete('error');
    
    if (newMigration) params.set('migration', newMigration);
    else params.delete('migration');

    router.push(`/spring-boot?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <StickyNav />
      <div className="min-h-screen bg-background">
        <div id={SPRING_BOOT_SECTIONS.overview}>
          <SpringBootHero stats={stats} />
        </div>
        
        <PathSelectionCards />
        
        <PreFlightChecklist />
        
        <HubSearchFilter content={content} onFilteredChange={setFilteredContent} />
        
        <FeaturedPlaybooks playbooks={featuredPlaybooks} />
        
        <MigrationCatalog />
        
        <CommonErrorsGrid />
        
        <PromptPacks 
          prompts={filteredContent.prompts} 
          activeTab={tab || undefined}
          onTabChange={(newTab) => updateFilters(newTab)}
        />
        
        <WorkflowsSection workflows={filteredContent.instructions} />
        
        <ToolsReposSection tools={filteredContent.tools} />
        
        <FAQAccordion />
        
        <RelatedMigrationHubs />
        
        <CTAStrip />
      </div>
    </>
  );
}
