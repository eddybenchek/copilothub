'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CopyButton } from '@/components/copy-button';
import { runPowerFx } from '@/lib/dev-tools/powerfx';
import { cn } from '@/lib/utils';

const SAMPLE_JSON = `[
  { "name": "Basic Plan", "price": 10, "active": true },
  { "name": "Pro Plan", "price": 20, "active": true },
  { "name": "Legacy Plan", "price": 5, "active": false }
]`;

const EXAMPLE_EXPRESSIONS = [
  'Sum(products, price)',
  'Average(products, price)',
  'CountRows(products)',
  'First(products)',
  'Last(products)',
];

interface PowerFxPlaygroundProps {
  initialExpression?: string;
  initialJson?: string;
}

export function PowerFxPlayground({
  initialExpression,
  initialJson,
}: PowerFxPlaygroundProps) {
  const [expression, setExpression] = useState<string>(
    initialExpression?.trim() || 'Sum(products, price)'
  );
  const [jsonInput, setJsonInput] = useState<string>(
    initialJson?.trim() || SAMPLE_JSON
  );
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [expressionError, setExpressionError] = useState<string | null>(null);
  const expressionInputRef = useRef<HTMLInputElement | null>(null);

  const handleRun = () => {
    setHasRun(true);
    setExpressionError(null);
    setIsRunning(true);

    try {
      if (!expression.trim()) {
        setExpressionError('Please enter a Power Fx-style expression.');
        setIsRunning(false);
        return;
      }

      const evaluation = runPowerFx(expression, jsonInput);

      if (!evaluation.ok) {
        setError(evaluation.error);
        setResult(null);
      } else {
        setError(null);
        const value = evaluation.value;
        if (typeof value === 'string') {
          setResult(value);
        } else {
          setResult(JSON.stringify(value, null, 2));
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleLoadSample = () => {
    setJsonInput(SAMPLE_JSON);
    if (!expression.trim()) {
      setExpression('Sum(products, price)');
    }
    setError(null);
    setResult(null);
    setHasRun(false);
  };

  const handleExampleClick = (example: string) => {
    setExpression(example);
    setExpressionError(null);
    if (expressionInputRef.current) {
      expressionInputRef.current.focus();
    }
  };

  return (
    <Card className="border border-border/80 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">Power Fx Playground</CardTitle>
        <CardDescription>
          Type a Power Fx-style expression, paste your JSON data, and evaluate the result in a safe,
          browser-based environment.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column: expression + JSON input */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Power Fx expression
              </label>
              <p className="text-xs text-muted-foreground">
                Examples: <code className="font-mono">Sum(products, price)</code>,{' '}
                <code className="font-mono">CountRows(products)</code>,{' '}
                <code className="font-mono">First(products)</code>
              </p>
              <Input
                ref={expressionInputRef}
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g. Sum(products, price)"
                className="font-mono text-sm"
                aria-invalid={!!expressionError}
                aria-describedby={expressionError ? 'expression-error' : undefined}
              />
              {expressionError && (
                <p id="expression-error" className="text-xs text-red-400">
                  {expressionError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                JSON data
              </label>
              <p className="text-xs text-muted-foreground">
                The top-level array is treated as <code className="font-mono">products</code>. You
                can also pass an object like{' '}
                <code className="font-mono">{'{ \"products\": [ ... ] }'}</code>.
              </p>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={12}
                className="font-mono text-xs leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
              >
                Load sample data
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? 'Running…' : 'Run'}
              </Button>
            </div>
          </div>

          {/* Right column: result + examples/help */}
          <div className="space-y-4">
            <Card className="border border-border/80 bg-background/60">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                <div>
                  <CardTitle className="text-base">Result</CardTitle>
                  <CardDescription>View the evaluated output for your formula.</CardDescription>
                </div>
                <CopyButton
                  text={result ?? ''}
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                >
                  Copy result
                </CopyButton>
              </CardHeader>
              <CardContent className="pt-3">
                {error && (
                  <div className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                    {error}
                  </div>
                )}
                {!error && hasRun && result && (
                  <pre className="mt-2 max-h-80 overflow-auto rounded-md border border-border/60 bg-black/40 p-3 text-xs text-muted-foreground whitespace-pre-wrap font-mono">
{result}
                  </pre>
                )}
                {!error && (!hasRun || !result) && (
                  <p className="text-xs text-muted-foreground">
                    Run a formula to see the evaluated result here. The output will be pretty-printed
                    JSON when possible.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/80 bg-background/40">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Example formulas</CardTitle>
                <CardDescription>
                  Click an example to load it into the expression input.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_EXPRESSIONS.map((example) => {
                    const isSelected = expression.trim() === example;
                    return (
                      <Button
                        key={example}
                        type="button"
                        size="sm"
                        variant={isSelected ? 'outline' : 'ghost'}
                        className={cn(
                          'font-mono text-[11px]',
                          isSelected && 'border-primary bg-primary/10 text-primary'
                        )}
                        onClick={() => handleExampleClick(example)}
                      >
                        {example}
                      </Button>
                    );
                  })}
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    Supported functions in this MVP playground:
                    <span className="ml-1 font-mono">
                      Sum, Average, CountRows, First, Last
                    </span>
                    .
                  </p>
                  <p>
                    The <code className="font-mono">products</code> collection is resolved from your
                    JSON input. Unsupported functions or invalid expressions will show a clear error
                    message instead of throwing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

