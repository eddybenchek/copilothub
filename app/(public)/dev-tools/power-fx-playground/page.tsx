import type { Metadata } from 'next';
import Link from 'next/link';
import { PowerFxPlayground } from '@/components/dev-tools/power-fx-playground';
import { createStructuredData, getBaseUrl } from '@/lib/metadata';

const baseUrl = getBaseUrl();
const canonicalUrl = `${baseUrl}/dev-tools/power-fx-playground`;

export const metadata: Metadata = {
  title: {
    absolute: 'Power Fx Playground – Test Power Apps Formulas Online | CopilotHub',
  },
  description:
    'Test Power Fx formulas instantly. Try Sum(), CountRows(), First(), Last(), and Average using JSON data. Free Power Apps formula playground.',
  alternates: {
    canonical: canonicalUrl,
  },
};

const faqStructuredData = createStructuredData('FAQPage', {
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Power Fx?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Power Fx is a low-code, Excel-inspired formula language used across the Microsoft Power Platform. It lets makers and developers express logic using familiar functions like Sum, Average, and CountRows instead of writing imperative code.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you use Sum() in Power Fx?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can use Sum() in Power Fx to aggregate a numeric field across a table. For example, Sum(products, price) adds up all numeric price values in the products collection.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is CountRows() in Power Apps?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CountRows() returns the number of records in a table. In this playground, CountRows(products) evaluates to the number of items in the products array from your JSON input.',
      },
    },
  ],
});

interface PowerFxPlaygroundPageProps {
  searchParams: Promise<{
    expr?: string;
    data?: string;
  }>;
}

export default async function PowerFxPlaygroundPage({
  searchParams,
}: PowerFxPlaygroundPageProps) {
  const params = await searchParams;
  const initialExpression = params.expr ?? undefined;
  const initialJson = params.data ?? undefined;

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <section className="mb-10 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Power Fx Playground
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Test Power Apps and Power Fx formulas instantly against JSON payloads. Validate Sum(),
              CountRows(), First(), Last(), and Average before you use them in production apps.
            </p>
          </section>
        </div>

        <section className="mx-auto max-w-5xl space-y-10">
          <PowerFxPlayground
            initialExpression={initialExpression}
            initialJson={initialJson}
          />

          <div className="space-y-8 text-sm text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                Test Power Apps formulas instantly
              </h2>
              <p className="max-w-3xl">
                When you are designing screens, data cards, or custom logic in Power Apps, it is
                often faster to validate formulas with real JSON payloads outside the studio. This
                playground gives you a focused environment where you can experiment without
                touching live apps or environments.
              </p>
              <p className="max-w-3xl">
                Paste a small sample of your data, tweak a formula, and see how Power Fx-style
                expressions behave. Once you are happy with the result, copy the formula or output
                back into your app, Copilot prompt, or documentation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">What is Power Fx?</h2>
              <p className="max-w-3xl">
                Power Fx is a low-code, Excel-inspired formula language used across the Microsoft
                Power Platform. It lets makers and developers express logic using familiar
                functions like <span className="font-mono">Sum</span>,{' '}
                <span className="font-mono">Average</span>, and{' '}
                <span className="font-mono">CountRows</span> instead of writing imperative code.
              </p>
              <p className="max-w-3xl">
                This playground is a lightweight approximation designed for learning and quick
                experiments. It focuses on a small, predictable subset of behavior rather than full
                Power Fx compatibility, so you can reason about the results with confidence.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                Common Power Fx formulas
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <span className="font-mono">Sum(products, price)</span> – Sum all numeric{' '}
                  <span className="font-mono">price</span> values in the{' '}
                  <span className="font-mono">products</span> collection.
                </li>
                <li>
                  <span className="font-mono">Average(products, price)</span> – Compute the average
                  price across all products.
                </li>
                <li>
                  <span className="font-mono">CountRows(products)</span> – Return the number of
                  items in the <span className="font-mono">products</span> array.
                </li>
                <li>
                  <span className="font-mono">First(products)</span> – Get the first item in the
                  collection (or <span className="font-mono">null</span> if empty).
                </li>
                <li>
                  <span className="font-mono">Last(products)</span> – Get the last item in the
                  collection (or <span className="font-mono">null</span> if empty).
                </li>
              </ul>
              <p className="max-w-3xl">
                These formulas cover a surprising number of real-world scenarios, from pricing
                summaries to row counts and quick inspections of data sets. The playground helps
                you see exactly what they return for a given JSON payload.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Power Fx examples</h2>
              <p className="max-w-3xl">
                Imagine you are modeling subscription tiers similar to the sample data in this
                playground. You might use <span className="font-mono">Sum(products, price)</span>{' '}
                to calculate the total monthly cost of all active plans, or{' '}
                <span className="font-mono">Average(products, price)</span> to understand your
                average price point.
              </p>
              <p className="max-w-3xl">
                You can also combine aggregation with filtering. For example, filter down to active
                products only and then compute an average, or look up a specific plan by name
                before wiring that formula into a Power Apps control. The playground lets you try
                these ideas safely before committing them to your app.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                Power Fx vs Excel formulas
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <span className="font-mono">Table-first</span>: Power Fx works with tables and
                  records (like the <span className="font-mono">products</span> collection), while
                  Excel works with cell ranges.
                </li>
                <li>
                  <span className="font-mono">Named fields</span>: Instead of column letters, you
                  reference fields like <span className="font-mono">price</span> or{' '}
                  <span className="font-mono">name</span>, which makes formulas more self-documenting.
                </li>
                <li>
                  <span className="font-mono">App context</span>: Power Fx formulas can read from
                  controls, data sources, and user actions at runtime, not just static cells.
                </li>
              </ul>
              <p className="max-w-3xl">
                If you are comfortable with Excel, most of the mental model transfers directly to
                Power Fx. This playground provides a gentle bridge by letting you test familiar
                patterns on JSON data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">FAQ</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground">What is Power Fx?</h3>
                  <p className="max-w-3xl">
                    Power Fx is a low-code formula language for the Microsoft Power Platform. It
                    borrows concepts from Excel and makes it easy to express logic for canvas apps,
                    automations, and more without writing imperative code.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">
                    How do you use Sum() in Power Fx?
                  </h3>
                  <p className="max-w-3xl">
                    Use <span className="font-mono">Sum()</span> with a table and a numeric field.
                    For example, <span className="font-mono">Sum(products, price)</span> adds up all
                    numeric <span className="font-mono">price</span> values across the{' '}
                    <span className="font-mono">products</span> collection.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">
                    What is CountRows() in Power Apps?
                  </h3>
                  <p className="max-w-3xl">
                    <span className="font-mono">CountRows()</span> returns the number of records in
                    a table. In this playground, <span className="font-mono">CountRows(products)</span>{' '}
                    evaluates to the number of items in the{' '}
                    <span className="font-mono">products</span> array from your JSON input.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">
                    Is this a full Power Fx engine?
                  </h3>
                  <p className="max-w-3xl">
                    No. This is an MVP evaluator focused on a handful of aggregation and collection
                    functions. It is meant for learning and quick checks, not as a drop-in
                    replacement for the full Power Fx runtime.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground">
                    What JSON shapes are supported?
                  </h3>
                  <p className="max-w-3xl">
                    The playground treats the top-level JSON array as{' '}
                    <span className="font-mono">products</span> by default. You can also pass an
                    object with a <span className="font-mono">products</span> array property. Other
                    shapes will return a readable error instead of throwing.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                Related developer tools
              </h2>
              <div className="space-y-2 max-w-3xl">
                <p>
                  Explore more CopilotHub utilities and directories to support your Power Apps and
                  AI-assisted development workflow.
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    Browse all native utilities in the{' '}
                    <Link
                      href="/dev-tools"
                      className="text-primary hover:underline"
                    >
                      Dev Tools section
                    </Link>
                    .
                  </li>
                  <li>
                    Need TypeScript types? Try the{' '}
                    <Link
                      href="/dev-tools/json-to-typescript"
                      className="text-primary hover:underline"
                    >
                      JSON → TypeScript generator
                    </Link>
                    .
                  </li>
                  <li>
                    Discover external JSON and API helpers in the{' '}
                    <Link
                      href="/tools?query=json"
                      className="text-primary hover:underline"
                    >
                      Tools directory
                    </Link>
                    .
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </section>
      </div>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </>
  );
}


