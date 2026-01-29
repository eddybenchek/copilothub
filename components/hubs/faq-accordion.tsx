'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Should I migrate 2→3 before 3→4?',
    answer: 'Yes, you should migrate from Spring Boot 2 to 3 first, then to 4. Spring Boot 3 requires Java 17 and Jakarta EE, which are prerequisites for Spring Boot 4. Skipping versions can lead to compatibility issues and make troubleshooting more difficult.',
  },
  {
    question: 'Do I need Java 17?',
    answer: 'Yes, Spring Boot 3 requires Java 17 as the minimum version. Spring Boot 4 may require Java 21 or later. Make sure to upgrade your Java runtime before starting the migration.',
  },
  {
    question: "What's the biggest breaking change?",
    answer: 'The Jakarta EE namespace migration (javax.* → jakarta.*) is the most widespread breaking change, affecting imports across your entire codebase. Spring Security 6 also removes WebSecurityConfigurerAdapter, requiring a rewrite of security configuration.',
  },
  {
    question: 'How do I verify the migration safely?',
    answer: 'Run comprehensive tests, especially integration tests. Use Testcontainers for database testing. Verify all endpoints, check actuator health endpoints, and monitor logs for deprecation warnings. Consider a phased rollout in production.',
  },
  {
    question: 'Maven vs Gradle differences?',
    answer: 'Both build tools are supported, but the migration steps are similar. Maven users need to update parent POM versions, while Gradle users update plugin versions. The dependency management changes are consistent across both.',
  },
  {
    question: 'How long does a migration take?',
    answer: 'A typical Spring Boot 2→3 migration takes 2-6 hours for a medium-sized application, depending on complexity. Spring Boot 3→4 migrations are usually faster (1-3 hours) as they involve fewer breaking changes.',
  },
  {
    question: 'Can I use Copilot to help with the migration?',
    answer: 'Yes! CopilotHub provides specialized prompts and workflows designed for GitHub Copilot. These prompts can help automate the mechanical refactoring tasks like namespace changes, making the migration faster and more reliable.',
  },
];

import { SectionHeader } from './section-header';
import { HelpCircle } from 'lucide-react';

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <SectionHeader 
        id="faq" 
        title="Frequently Asked Questions" 
        icon={<HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
      />
      
      <div className="space-y-2">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card"
          >
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between p-3 sm:p-4 text-left transition-colors hover:bg-accent"
            >
              <span className="font-medium text-foreground text-sm sm:text-base pr-2">{faq.question}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform flex-shrink-0',
                  openIndex === index && 'rotate-180'
                )}
              />
            </button>
            {openIndex === index && (
              <div className="border-t border-border p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
