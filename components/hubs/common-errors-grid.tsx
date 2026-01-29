'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { getAllErrors } from '@/lib/hub-indexes/spring-boot-index';
import { SectionHeader } from './section-header';

function getCommonErrors() {
  const errors = getAllErrors();
  return errors.map((error) => ({
    title: error.title,
    description: error.description,
    href: `/instructions/${error.instructionSlug}#${error.anchor}`,
    errorKey: error.key,
  }));
}

export function CommonErrorsGrid() {
  const commonErrors = getCommonErrors();

  return (
    <section id="common-errors" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Common Errors</h2>
        </div>
        <Button variant="outline" size="sm" className="text-xs" asChild>
          <Link href="/spring-boot/errors">
            View all errors
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {commonErrors.map((error) => (
          <Card key={error.errorKey} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">{error.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">{error.description}</p>
              <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs" asChild>
                <Link href={error.href} scroll={true}>
                  View solution
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
