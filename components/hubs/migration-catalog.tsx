'use client';

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { getAllMigrations } from '@/lib/hub-indexes/spring-boot-index';

function getCatalogData() {
  const migrations = getAllMigrations();
  return migrations.map((migration) => {
    const playbookHref = migration.anchor
      ? `/instructions/${migration.primaryInstructionSlug}#${migration.anchor}`
      : `/instructions/${migration.primaryInstructionSlug}`;
    
    return {
      migration: migration.title,
      whyItMatters: migration.description,
      whatBreaks: migration.tags.join(', '),
      playbookHref,
      migrationKey: migration.key,
    };
  });
}

export function MigrationCatalog() {
  const catalogData = getCatalogData();

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Migration Catalog</h2>
        <Button variant="outline" size="sm" className="text-xs" asChild>
          <Link href="/spring-boot/migrations">
            View all migrations
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
      
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
                <TableRow key={row.migrationKey || index}>
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
