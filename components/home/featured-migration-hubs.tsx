'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wrench } from 'lucide-react';

export function FeaturedMigrationHubs() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="text-3xl font-bold">Migration Hubs</h2>
        </div>
        <p className="text-muted-foreground">
          Production-grade guides, playbooks, and Copilot workflows for upgrading real-world codebases
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Spring Boot Hub Card */}
        <Card className="group hover:border-primary/50 transition-all hover:shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              Spring Boot Migration Hub
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Playbooks, Copilot prompts, and workflows for Spring Boot 2→3, 3→4, Security, Hibernate, and Jakarta EE.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="group-hover:bg-primary group-hover:text-primary-foreground">
              <Link href="/spring-boot">
                Explore Spring Boot Hub
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for future hubs */}
        <Card className="border-dashed opacity-50">
          <CardHeader>
            <CardTitle className="text-xl text-muted-foreground">
              More Migration Hubs Coming Soon
            </CardTitle>
            <CardDescription className="text-base mt-2">
              React, Node.js, Python, and more production-grade migration guides.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
