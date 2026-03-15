import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonToTypeScriptPlayground } from '@/components/dev-tools/json-to-typescript-playground';
import { getBaseUrl } from '@/lib/metadata';

const baseUrl = getBaseUrl();
const canonicalUrl = `${baseUrl}/dev-tools/json-to-typescript`;

export const metadata: Metadata = {
  title: {
    absolute: 'JSON to TypeScript Generator – Convert JSON to TS Interfaces',
  },
  description:
    'Convert JSON to TypeScript interfaces instantly. Paste JSON and generate TypeScript types online. Free JSON → TS generator for developers.',
  alternates: {
    canonical: canonicalUrl,
  },
};

export default function JsonToTypeScriptPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <section className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            JSON to TypeScript Generator
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Paste JSON and generate TypeScript interfaces instantly. Free tool for developers.
          </p>
        </section>
      </div>

      <section className="mx-auto max-w-5xl space-y-10">
        <JsonToTypeScriptPlayground />

        <div className="space-y-8 text-sm text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">What is this tool?</h2>
            <p className="max-w-3xl">
              This generator converts JSON input into TypeScript interfaces. Use it when you
              receive API responses, config files, or sample data and need type-safe interfaces
              for your codebase.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">How to use</h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Paste or type JSON into the input area.</li>
              <li>Click Generate to convert it to TypeScript.</li>
              <li>Copy the output and paste it into your project.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Example</h2>
            <p className="max-w-3xl">
              Input: <code className="font-mono">{'{"id": 1, "name": "Laptop", "price": 1200}'}</code>
            </p>
            <p className="max-w-3xl">
              Output: <code className="font-mono">interface Root {'{ id: number; name: string; price: number; }'}</code>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">FAQ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Does it support nested objects?</h3>
                <p className="max-w-3xl">
                  Yes. JSON with nested objects and arrays will produce corresponding TypeScript
                  interfaces and types.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Can I use arrays?</h3>
                <p className="max-w-3xl">
                  Yes. Arrays of objects produce types like <code className="font-mono">Root[]</code>. Rename the top-level type to match your domain (e.g. User, ApiResponse).
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Related developer tools
            </h2>
            <p className="max-w-3xl">
              Explore more CopilotHub utilities for your development workflow.
            </p>
            <ul className="list-disc space-y-1 pl-5">
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
                <Link
                  href="/dev-tools/regex-tester"
                  className="text-primary hover:underline"
                >
                  Regex Tester
                </Link>
                {' '}
                – Test regular expressions with live matches.
              </li>
              <li>
                <Link
                  href="/dev-tools"
                  className="text-primary hover:underline"
                >
                  All developer tools
                </Link>
                {' '}
                – Browse more generators and playgrounds.
              </li>
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
