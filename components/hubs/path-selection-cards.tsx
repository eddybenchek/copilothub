'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PathSelectionCards() {
  const paths = [
    {
      title: 'Migrate Spring Boot 2 → 3',
      description: 'Jakarta, Java 17, Spring Security 6, Hibernate 6',
      href: '/instructions/spring-boot-2-to-3-migration',
      color: 'border-blue-500/50 bg-blue-500/5',
    },
    {
      title: 'Upgrade Spring Boot 3 → 4',
      description: 'Framework upgrades + config changes + validation',
      href: '/instructions/spring-boot-3x-to-40-migration-guide',
      color: 'border-emerald-500/50 bg-emerald-500/5',
    },
    {
      title: 'Hard mode topics',
      description: 'Security, Hibernate, tests, actuator, build tools',
      href: '#common-errors',
      color: 'border-orange-500/50 bg-orange-500/5',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-semibold text-foreground">Choose your path</h2>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {paths.map((path) => (
          <Card
            key={path.title}
            className={`group cursor-pointer transition-all hover:shadow-lg ${path.color}`}
          >
            <Link href={path.href} className="block">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{path.title}</CardTitle>
                <CardDescription className="mt-2 text-sm">{path.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="group-hover:text-primary">
                  Explore
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
