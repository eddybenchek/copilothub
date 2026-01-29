'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SectionHeader } from './section-header';

const checklistItems = [
  {
    id: 'java-version',
    label: 'Java 17+ installed',
    description: 'Spring Boot 3 requires Java 17 minimum',
  },
  {
    id: 'backup',
    label: 'Code backup created',
    description: 'Create a Git branch or full backup before starting',
  },
  {
    id: 'dependencies',
    label: 'Dependency audit completed',
    description: 'Check all third-party libraries for Spring Boot 3 compatibility',
  },
  {
    id: 'tests',
    label: 'Test suite ready',
    description: 'Ensure you have comprehensive tests to verify migration',
  },
];

export function PreFlightChecklist() {
  return (
    <section id="pre-flight" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <SectionHeader 
        id="pre-flight" 
        title="Pre-flight Checklist" 
      />
      
      <Card className="border-primary/20 bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Before you start migrating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
