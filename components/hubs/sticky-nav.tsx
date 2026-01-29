'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { SPRING_BOOT_SECTIONS } from '@/lib/hub-indexes/spring-boot-index';

const navItems = [
  { id: SPRING_BOOT_SECTIONS.overview, label: 'Overview', href: `#${SPRING_BOOT_SECTIONS.overview}` },
  { id: SPRING_BOOT_SECTIONS.featured, label: 'Featured', href: `#${SPRING_BOOT_SECTIONS.featured}` },
  { id: SPRING_BOOT_SECTIONS.catalog, label: 'Catalog', href: `#${SPRING_BOOT_SECTIONS.catalog}` },
  { id: SPRING_BOOT_SECTIONS['common-errors'], label: 'Errors', href: `#${SPRING_BOOT_SECTIONS['common-errors']}` },
  { id: SPRING_BOOT_SECTIONS['prompt-packs'], label: 'Prompt Packs', href: `#${SPRING_BOOT_SECTIONS['prompt-packs']}` },
  { id: SPRING_BOOT_SECTIONS.workflows, label: 'Workflows', href: `#${SPRING_BOOT_SECTIONS.workflows}` },
  { id: SPRING_BOOT_SECTIONS.tools, label: 'Tools', href: `#${SPRING_BOOT_SECTIONS.tools}` },
  { id: SPRING_BOOT_SECTIONS.faq, label: 'FAQ', href: `#${SPRING_BOOT_SECTIONS.faq}` },
];

export function StickyNav() {
  const [activeSection, setActiveSection] = useState<string>('overview');

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => {
        const element = document.getElementById(item.id);
        if (element) {
          return {
            id: item.id,
            top: element.getBoundingClientRect().top,
          };
        }
        return null;
      }).filter(Boolean) as { id: string; top: number }[];

      const current = sections.find(section => section.top <= 100 && section.top >= -200);
      if (current) {
        setActiveSection(current.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-10">
      <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-2 shadow-lg">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
