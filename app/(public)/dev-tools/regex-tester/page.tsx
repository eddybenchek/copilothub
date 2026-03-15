import type { Metadata } from 'next';
import Link from 'next/link';
import { RegexTesterPlayground } from '@/components/dev-tools/regex-tester-playground';
import { createStructuredData, getBaseUrl } from '@/lib/metadata';

const baseUrl = getBaseUrl();
const canonicalUrl = `${baseUrl}/dev-tools/regex-tester`;

export const metadata: Metadata = {
  title: {
    absolute: 'Regex Tester – Test Regular Expressions Online | CopilotHub',
  },
  description:
    'Test regular expressions online with live match highlighting. Free regex tester with flags, examples, and instant results for developers.',
  alternates: {
    canonical: canonicalUrl,
  },
};

const faqStructuredData = createStructuredData('FAQPage', {
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is regex?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Regular expressions (regex) are patterns used to match character combinations in strings. They are widely used for validation, search, and replace in code editors, linters, and APIs.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you test a regex pattern?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enter your pattern in the Regex Tester, set flags (g for global, i for case-insensitive, m for multiline), paste your test string, and click Run. You will see all matches with indexes and capture groups, plus a highlighted preview.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the g flag mean in regex?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The g (global) flag means find all matches in the string, not just the first. Without g, only the first match is returned.',
      },
    },
  ],
});

interface RegexTesterPageProps {
  searchParams: Promise<{ pattern?: string; flags?: string; text?: string; replacement?: string; mode?: string }>;
}

export default async function RegexTesterPage({ searchParams }: RegexTesterPageProps) {
  const params = await searchParams;
  const initialPattern = params.pattern ?? '';
  const initialFlags = params.flags ?? 'g';
  const initialText = params.text ?? '';
  const initialReplacement = params.replacement ?? '';
  const initialMode = params.mode === 'replace' ? 'replace' : 'test';

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <section className="mb-10 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Regex Tester – Test Regular Expressions Online
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Test regular expressions online with live match highlighting. Free regex tester with
              flags, examples, replace mode, and instant results for developers.
            </p>
          </section>
        </div>

        <section className="mx-auto max-w-5xl space-y-10">
          <RegexTesterPlayground
            initialPattern={initialPattern}
            initialFlags={initialFlags}
            initialText={initialText}
            initialReplacement={initialReplacement}
            initialMode={initialMode}
          />

        <div className="space-y-8 text-sm text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">What is regex?</h2>
            <p className="max-w-3xl">
              Regular expressions (regex) are patterns used to match character combinations in
              strings. They are widely used for validation, search, and replace in code editors,
              linters, and APIs. JavaScript uses the same regex syntax as many other languages via{' '}
              <code className="font-mono">RegExp</code>.
            </p>
            <p className="max-w-3xl">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                MDN: Regular expressions
              </a>{' '}
              is a solid reference for syntax and flags.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Common regex examples</h2>
            <ul className="max-w-3xl list-disc space-y-1 pl-5">
              <li>
                <span className="font-mono">\d+</span> – one or more digits
              </li>
              <li>
                <span className="font-mono">\S+@\S+\.\S+</span> – simple email-like pattern
              </li>
              <li>
                <span className="font-mono">https?://[^\s]+</span> – URLs starting with http or
                https
              </li>
              <li>
                <span className="font-mono">\d{'{'}3{'}'}[-.]?\d{'{'}3{'}'}[-.]?\d{'{'}4{'}'}</span> –
                common phone layout (US-style)
              </li>
              <li>
                <span className="font-mono">\s+</span> – runs of whitespace
              </li>
            </ul>
            <p className="max-w-3xl">
              Use the example buttons in the playground to load these patterns with sample text.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">How to test regex</h2>
            <ol className="max-w-3xl list-decimal space-y-1 pl-5">
              <li>Type or paste your pattern (no leading/trailing slashes required).</li>
              <li>Toggle flags: g for all matches, i for case-insensitive, m for multiline.</li>
              <li>Paste the string you want to test against.</li>
              <li>Click Run to see matches, indexes, and a highlighted preview when matches exist.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">FAQ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Why do I get an invalid regex error?</h3>
                <p className="max-w-3xl">
                  Unclosed brackets, invalid escapes, or unsupported constructs will throw. The
                  playground shows the engine error message so you can fix the pattern.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Why only one match without g?</h3>
                <p className="max-w-3xl">
                  Without the global flag, <code className="font-mono">exec</code> stops after the
                  first match. Turn on <span className="font-mono">g</span> to list every match in
                  the text.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">What does the m flag do?</h3>
                <p className="max-w-3xl">
                  Multiline mode makes <code className="font-mono">^</code> and{' '}
                  <code className="font-mono">$</code> match line starts and ends instead of only
                  the whole string.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Related developer tools</h2>
            <p className="max-w-3xl">
              Explore more CopilotHub utilities for your development workflow.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <Link
                  href="/dev-tools/json-to-typescript"
                  className="text-primary hover:underline"
                >
                  JSON to TypeScript Generator
                </Link>
                {' '}
                – Convert JSON into TypeScript interfaces.
              </li>
              <li>
                <Link
                  href="/dev-tools/power-fx-playground"
                  className="text-primary hover:underline"
                >
                  Power Fx Playground
                </Link>
                {' '}
                – Test Power Apps formulas instantly.
              </li>
              <li>
                <Link href="/dev-tools" className="text-primary hover:underline">
                  All developer tools
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </section>
    </div>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </>
  );
}
