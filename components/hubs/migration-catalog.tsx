'use client';

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface CatalogRow {
  migration: string;
  whyItMatters: string;
  whatBreaks: string;
  playbookHref: string;
}

const catalogData: CatalogRow[] = [
  {
    migration: '2→3 Jakarta',
    whyItMatters: 'Jakarta EE namespace change, Java 17 requirement',
    whatBreaks: 'javax.* imports, Java 8/11 compatibility',
    playbookHref: '/instructions/spring-boot-2-to-3-migration#jakarta-ee-namespace-migration',
  },
  {
    migration: '3→4 upgrade',
    whyItMatters: 'Framework improvements, new features',
    whatBreaks: 'Deprecated APIs, configuration changes',
    playbookHref: '/instructions/spring-boot-3x-to-40-migration-guide',
  },
  {
    migration: 'Spring Security config changes',
    whyItMatters: 'WebSecurityConfigurerAdapter removed',
    whatBreaks: 'Security filter chain configuration',
    playbookHref: '/instructions/spring-boot-2-to-3-migration#spring-security-6',
  },
  {
    migration: 'Hibernate upgrade notes',
    whyItMatters: 'Hibernate 6 stricter query parsing',
    whatBreaks: 'JPQL queries, pagination, joins',
    playbookHref: '/instructions/spring-boot-2-to-3-migration#hibernate-6',
  },
  {
    migration: 'Actuator endpoint changes',
    whyItMatters: 'Endpoint path and configuration updates',
    whatBreaks: 'Monitoring and health check endpoints',
    playbookHref: '/instructions/spring-boot-3x-to-40-migration-guide#actuator-changes',
  },
  {
    migration: 'Logging/tracing/observability changes',
    whyItMatters: 'Micrometer and observability improvements',
    whatBreaks: 'Metrics configuration, tracing setup',
    playbookHref: '/instructions/spring-boot-3x-to-40-migration-guide',
  },
];

export function MigrationCatalog() {
  return (
    <section id="catalog" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-semibold text-foreground">Migration Catalog</h2>
      
      <div className="overflow-x-auto rounded-lg border border-border -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Migration</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Why it matters</TableHead>
                <TableHead className="text-xs sm:text-sm hidden md:table-cell">What breaks</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Playbook</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalogData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <div className="sm:hidden">
                      <div className="font-semibold">{row.migration}</div>
                      <div className="text-muted-foreground text-xs mt-1">{row.whyItMatters}</div>
                      <div className="text-muted-foreground text-xs mt-1">{row.whatBreaks}</div>
                    </div>
                    <div className="hidden sm:block">{row.migration}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">{row.whyItMatters}</TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm hidden md:table-cell">{row.whatBreaks}</TableCell>
                  <TableCell className="text-right">
                    {row.playbookHref ? (
                      <Button variant="ghost" size="sm" className="text-xs" asChild>
                        <Link href={row.playbookHref}>
                          <span className="hidden sm:inline">View</span>
                          <span className="sm:hidden">→</span>
                          <ExternalLink className="ml-1 sm:ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">Soon</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
