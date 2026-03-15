'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CopyButton } from '@/components/copy-button';
import {
  buildFlagsString,
  runRegex,
  runReplace,
  explainRegex,
  type RegexFlags,
  type RegexRunResult,
} from '@/lib/dev-tools/regex';

type Mode = 'test' | 'replace';

const EXAMPLES: { label: string; pattern: string; sampleText: string }[] = [
  {
    label: 'Email',
    pattern: String.raw`\S+@\S+\.\S+`,
    sampleText: 'Contact us at contact@example.com or support@site.co.uk today.',
  },
  {
    label: 'URL',
    pattern: String.raw`https?://[^\s]+`,
    sampleText: 'See https://example.com/path and http://test.dev?q=1 for more.',
  },
  {
    label: 'Phone',
    pattern: String.raw`\d{3}[-.]?\d{3}[-.]?\d{4}`,
    sampleText: 'Call 555-123-4567 or 800.555.0199.',
  },
  {
    label: 'Digits',
    pattern: String.raw`\d+`,
    sampleText: 'Order #42 items and line 7 ref 99.',
  },
  {
    label: 'Whitespace',
    pattern: String.raw`\s+`,
    sampleText: 'a  b \t c',
  },
];

function buildHighlightedSegments(
  text: string,
  matches: { match: string; index: number }[]
): { key: string; text: string; highlight: boolean }[] {
  if (!matches.length) return [{ key: '0', text, highlight: false }];
  const sorted = [...matches].sort((a, b) => a.index - b.index);
  const segments: { key: string; text: string; highlight: boolean }[] = [];
  let pos = 0;
  sorted.forEach((m, i) => {
    if (m.index > pos) {
      segments.push({ key: `g-${i}-${pos}`, text: text.slice(pos, m.index), highlight: false });
    }
    segments.push({ key: `m-${i}-${m.index}`, text: m.match, highlight: true });
    pos = m.index + m.match.length;
  });
  if (pos < text.length) {
    segments.push({ key: `tail-${pos}`, text: text.slice(pos), highlight: false });
  }
  return segments;
}

function parseFlags(flagsStr: string): RegexFlags {
  const s = flagsStr.toLowerCase();
  return {
    g: s.includes('g'),
    i: s.includes('i'),
    m: s.includes('m'),
  };
}

interface RegexTesterPlaygroundProps {
  initialPattern?: string;
  initialFlags?: string;
  initialText?: string;
  initialReplacement?: string;
  initialMode?: Mode;
}

export function RegexTesterPlayground({
  initialPattern = '',
  initialFlags = 'g',
  initialText = '',
  initialReplacement = '',
  initialMode = 'test',
}: RegexTesterPlaygroundProps) {
  const router = useRouter();

  const [pattern, setPattern] = useState(initialPattern);
  const [testText, setTestText] = useState(initialText);
  const [replacement, setReplacement] = useState(initialReplacement);
  const [flags, setFlags] = useState<RegexFlags>(() => parseFlags(initialFlags));
  const [mode, setMode] = useState<Mode>(initialMode);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [result, setResult] = useState<RegexRunResult | null>(null);
  const [replaceOutput, setReplaceOutput] = useState<string | null>(null);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const flagsString = useMemo(() => buildFlagsString(flags), [flags]);

  const updateUrl = (opts: { pattern: string; flags: string; text: string; replacement?: string; mode?: Mode }) => {
    const params = new URLSearchParams();
    if (opts.pattern) params.set('pattern', opts.pattern);
    if (opts.flags) params.set('flags', opts.flags);
    if (opts.text) params.set('text', opts.text);
    if (opts.replacement) params.set('replacement', opts.replacement);
    if (opts.mode === 'replace') params.set('mode', 'replace');
    const q = params.toString();
    router.replace(q ? `/dev-tools/regex-tester?${q}` : '/dev-tools/regex-tester', { scroll: false });
  };

  const handleRun = () => {
    setHasRun(true);
    if (mode === 'replace') {
      setResult(null);
      const replaceResult = runReplace(pattern, flagsString, testText, replacement);
      if (replaceResult.ok) {
        setReplaceOutput(replaceResult.output);
        setReplaceError(null);
      } else {
        setReplaceError(replaceResult.error);
        setReplaceOutput(null);
      }
    } else {
      setReplaceOutput(null);
      setReplaceError(null);
      setResult(runRegex(pattern, flagsString, testText));
    }
    updateUrl({ pattern, flags: flagsString, text: testText, replacement, mode });
  };

  const handleLoadExample = (ex: (typeof EXAMPLES)[0]) => {
    setPattern(ex.pattern);
    setTestText(ex.sampleText);
    setSelectedExample(ex.label);
    setResult(null);
    setReplaceOutput(null);
    setReplaceError(null);
    setHasRun(false);
  };

  const toggleFlag = (key: keyof RegexFlags) => {
    setFlags((f) => ({ ...f, [key]: !f[key] }));
    setResult(null);
    setReplaceError(null);
  };

  const copyRegexLiteral = pattern.trim()
    ? `/${pattern.replace(/\//g, '\\/')}/${flagsString}`
    : '';

  const copyMatchesText =
    result?.ok && result.matches.length > 0
      ? result.matches.map((m) => m.match).join('\n')
      : '';

  const segments =
    result?.ok && result.matches.length > 0
      ? buildHighlightedSegments(testText, result.matches)
      : null;

  const explanation = useMemo(() => explainRegex(pattern), [pattern]);

  return (
    <Card className="border border-border/80 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl">Regex Tester</CardTitle>
            <CardDescription>
              Test or replace with a pattern. Set flags and run. Invalid patterns show a clear error.
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={mode === 'test' ? 'primary' : 'outline'}
              onClick={() => { setMode('test'); setReplaceOutput(null); setReplaceError(null); }}
            >
              Test
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'replace' ? 'primary' : 'outline'}
              onClick={() => { setMode('replace'); setResult(null); }}
            >
              Replace
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Pattern</label>
              <Input
                value={pattern}
                onChange={(e) => {
                  setPattern(e.target.value);
                  setSelectedExample(null);
                }}
                placeholder={String.raw`\d+`}
                className="font-mono text-sm"
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            {mode === 'replace' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Replacement</label>
                <Input
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="$1 or # or text"
                  className="font-mono text-sm"
                  spellCheck={false}
                />
                <p className="text-xs text-muted-foreground">
                  Use $& for full match, $1, $2 for capture groups.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <span className="block text-sm font-medium text-foreground">Flags</span>
              <div className="flex flex-wrap gap-2">
                {(['g', 'i', 'm'] as const).map((key) => (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={flags[key] ? 'primary' : 'outline'}
                    onClick={() => toggleFlag(key)}
                    className="font-mono"
                  >
                    {key}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                g = global, i = ignore case, m = multiline (^/$ per line)
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                {mode === 'replace' ? 'Input text' : 'Test string'}
              </label>
              <Textarea
                value={testText}
                onChange={(e) => {
                  setTestText(e.target.value);
                  setSelectedExample(null);
                }}
                placeholder={
                  mode === 'replace'
                    ? 'Order 123 shipped on 2024-01-01'
                    : 'Paste or type text to match against...'
                }
                rows={8}
                className="font-mono text-xs leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <Button
                  key={ex.label}
                  type="button"
                  size="sm"
                  variant={selectedExample === ex.label ? 'primary' : 'outline'}
                  onClick={() => handleLoadExample(ex)}
                >
                  {ex.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="primary" onClick={handleRun}>
                Run
              </Button>
              {copyRegexLiteral && (
                <CopyButton text={copyRegexLiteral} size="sm" variant="outline">
                  Copy regex
                </CopyButton>
              )}
            </div>

            {explanation.length > 0 && (
              <div className="space-y-1.5 rounded-md border border-border/60 bg-black/20 p-3">
                <p className="text-xs font-medium text-foreground">Explanation</p>
                <ul className="space-y-0.5 font-mono text-xs text-muted-foreground">
                  {explanation.map((line, idx) => (
                    <li key={idx}>
                      <span className="text-foreground">{line.token}</span>
                      {' → '}
                      {line.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Card className="border border-border/80 bg-background/60">
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-base">
                {mode === 'replace' ? 'Output' : 'Results'}
              </CardTitle>
              <CardDescription>
                {mode === 'replace'
                  ? 'Replaced text. Use Run to update.'
                  : 'Matches with index and groups. Enable g for all occurrences.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              {mode === 'replace' && (
                <>
                  {replaceError && (
                    <div className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                      {replaceError}
                    </div>
                  )}
                  {replaceOutput !== null && !replaceError && (
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border/60 bg-black/40 p-3 text-xs font-mono text-muted-foreground">
                      {replaceOutput}
                    </pre>
                  )}
                  {!hasRun && mode === 'replace' && (
                    <p className="text-xs text-muted-foreground">
                      Enter pattern, replacement, and input, then click Run.
                    </p>
                  )}
                </>
              )}

              {mode === 'test' && (
                <>
                  {result && !result.ok && (
                    <div className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                      {result.error}
                    </div>
                  )}

                  {result?.ok && result.matches.length === 0 && hasRun && (
                    <p className="text-xs text-muted-foreground">No matches.</p>
                  )}

                  {result?.ok && result.matches.length > 0 && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {copyMatchesText && (
                          <CopyButton text={copyMatchesText} size="sm" variant="outline">
                            Copy matches
                          </CopyButton>
                        )}
                      </div>
                      <ul className="max-h-48 space-y-2 overflow-auto rounded-md border border-border/60 bg-black/20 p-2 text-xs font-mono">
                        {result.matches.map((m, i) => (
                          <li key={`${m.index}-${i}`} className="rounded border border-border/40 p-2">
                            <span className="font-medium text-foreground">Match {i + 1}:</span>
                            <div className="mt-1 text-muted-foreground">
                              <div>Full match: {m.match}</div>
                              <div className="text-muted-foreground/80">Index: {m.index}</div>
                              {m.groups && m.groups.length > 0 && (
                                <div className="mt-1">
                                  {m.groups.map((g, j) => (
                                    <div key={j}>Group {j + 1}: {g}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {segments && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-foreground">Highlighted</p>
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border/60 bg-black/40 p-3 text-xs font-mono text-muted-foreground">
                        {segments.map((seg) =>
                          seg.highlight ? (
                            <mark
                              key={seg.key}
                              className="rounded-sm bg-primary/25 text-foreground"
                            >
                              {seg.text}
                            </mark>
                          ) : (
                            <span key={seg.key}>{seg.text}</span>
                          )
                        )}
                      </pre>
                    </div>
                  )}

                  {!hasRun && mode === 'test' && (
                    <p className="text-xs text-muted-foreground">
                      Enter a pattern and test string, then click Run.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
