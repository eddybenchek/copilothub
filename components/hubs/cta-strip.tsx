'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Copy } from 'lucide-react';
import { CopyButton } from '@/components/copy-button';

const promptPack = `# Spring Boot Migration Copilot Prompt Pack

## Quick Start Prompts

### 1. Jakarta Namespace Migration
"Convert all javax.* imports to jakarta.* imports in this Spring Boot project. Update javax.persistence, javax.validation, javax.servlet to their jakarta equivalents."

### 2. Spring Security Migration
"Migrate this Spring Security configuration from WebSecurityConfigurerAdapter to SecurityFilterChain bean configuration for Spring Security 6."

### 3. Hibernate Query Fixes
"Review and fix Hibernate 6 compatibility issues in these JPQL queries. Ensure proper pagination and join syntax."

### 4. Dependency Updates
"Update Spring Boot dependencies from version 2.x to 3.x, ensuring all transitive dependencies are compatible."

## Full Guides
- Spring Boot 2→3: https://copilothub.directory/instructions/spring-boot-2-to-3-migration
- Spring Boot 3→4: https://copilothub.directory/instructions/spring-boot-3x-to-40-migration-guide
`;

export function CTAStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-primary/10 p-6 sm:p-8 text-center">
        <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-semibold text-foreground">
          Start the migration today
        </h2>
        <p className="mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground">
          Choose your migration path or copy our ready-to-use Copilot prompt pack
        </p>
        
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button size="lg" className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap" asChild>
            <Link href="/instructions/spring-boot-2-to-3-migration" className="inline-flex items-center justify-center sm:justify-start">
              Spring Boot 2 → 3 playbook
              <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap" asChild>
            <Link href="/instructions/spring-boot-3x-to-40-migration-guide" className="inline-flex items-center justify-center sm:justify-start">
              Spring Boot 3 → 4 playbook
              <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
            </Link>
          </Button>
          <CopyButton 
            text={promptPack} 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto sm:flex-shrink-0 whitespace-nowrap"
          >
            <Copy className="mr-2 h-4 w-4 flex-shrink-0" />
            Copy prompt pack
          </CopyButton>
        </div>
      </div>
    </section>
  );
}
