'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CopyButton } from '@/components/copy-button';

const EXAMPLES: { label: string; json: string }[] = [
  {
    label: 'Product list',
    json: `{
  "id": 1,
  "name": "Laptop",
  "price": 1200,
  "tags": ["electronics"]
}`,
  },
  {
    label: 'User object',
    json: `{
  "id": "usr_1",
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:00:00Z"
}`,
  },
  {
    label: 'API response',
    json: `{
  "success": true,
  "data": { "count": 42, "items": [] },
  "message": "OK"
}`,
  },
  {
    label: 'Nested JSON',
    json: `{
  "user": {
    "id": 1,
    "name": "John"
  },
  "roles": ["admin", "editor"]
}`,
  },
];

export function JsonToTypeScriptPlayground() {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [tsOutput, setTsOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setHasGenerated(true);
    setError(null);
    setTsOutput(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/dev-tools/json-to-typescript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: jsonInput }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result?.error ?? 'Request failed');
        setTsOutput(null);
        return;
      }
      if (result.ok) {
        setTsOutput(result.ts);
        setError(null);
      } else {
        setError(result.error);
        setTsOutput(null);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadExample = (example: { label: string; json: string }) => {
    setJsonInput(example.json);
    setSelectedExample(example.label);
    setError(null);
    setTsOutput(null);
    setHasGenerated(false);
  };

  return (
    <Card className="border border-border/80 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">JSON to TypeScript</CardTitle>
        <CardDescription>
          Paste JSON and generate TypeScript interfaces. Invalid JSON will show a clear error.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">JSON input</label>
              <p className="text-xs text-muted-foreground">
                Paste or type valid JSON. Objects and arrays are supported.
              </p>
              <Textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setSelectedExample(null);
                }}
                placeholder='{"id": 1, "name": "Example", "price": 99.99}'
                rows={12}
                className="font-mono text-xs leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="sr-only">Quick examples:</span>
              {EXAMPLES.map((example) => (
                <Button
                  key={example.label}
                  type="button"
                  variant={selectedExample === example.label ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleLoadExample(example)}
                  className={
                    selectedExample === example.label
                      ? 'border-primary/50 bg-primary/10 text-primary font-medium'
                      : ''
                  }
                >
                  {example.label}
                </Button>
              ))}
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating…' : 'Generate'}
              </Button>
            </div>
          </div>

          <Card className="border border-border/80 bg-background/60">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="text-base">TypeScript output</CardTitle>
                <CardDescription>
                  Generated interfaces from your JSON. The top-level type is named Root—rename it to match your data (e.g. User, ApiResponse).
                </CardDescription>
              </div>
              <CopyButton
                text={tsOutput ?? ''}
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
              {!error && hasGenerated && tsOutput && (
                <pre className="mt-2 max-h-80 overflow-auto rounded-md border border-border/60 bg-black/40 p-3 text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                  {tsOutput}
                </pre>
              )}
              {!error && (!hasGenerated || !tsOutput) && (
                <p className="text-xs text-muted-foreground">
                  Enter JSON and click Generate to see the TypeScript output here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
