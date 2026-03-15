export type RegexFlags = {
  g: boolean;
  i: boolean;
  m: boolean;
};

export type RegexMatch = {
  match: string;
  index: number;
  groups?: string[];
};

export type RegexRunResult =
  | { ok: true; matches: RegexMatch[] }
  | { ok: false; error: string };

/**
 * Build a RegExp flags string from toggles. Order: g, i, m.
 */
export function buildFlagsString(flags: RegexFlags): string {
  let s = '';
  if (flags.g) s += 'g';
  if (flags.i) s += 'i';
  if (flags.m) s += 'm';
  return s;
}

/**
 * Run a regex against text. Returns all matches with index (and capture groups when present).
 * Uses matchAll when global; otherwise exec once.
 */
export function runRegex(
  pattern: string,
  flagsString: string,
  text: string
): RegexRunResult {
  const trimmed = pattern.trim();
  if (!trimmed) {
    return { ok: false, error: 'Enter a regex pattern to test.' };
  }

  let re: RegExp;
  try {
    re = new RegExp(trimmed, flagsString);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Invalid regular expression.';
    return { ok: false, error: `Invalid regex: ${message}` };
  }

  const matches: RegexMatch[] = [];

  if (re.global) {
    try {
      const iter = text.matchAll(re);
      for (const m of iter) {
        matches.push({
          match: m[0],
          index: m.index ?? 0,
          groups:
            m.length > 1 ? m.slice(1).filter((g): g is string => g !== undefined) : undefined,
        });
      }
    } catch {
      return { ok: false, error: 'Pattern failed while matching. Check flags and pattern.' };
    }
  } else {
    const m = re.exec(text);
    if (m) {
      matches.push({
        match: m[0],
        index: m.index,
        groups:
          m.length > 1 ? m.slice(1).filter((g): g is string => g !== undefined) : undefined,
      });
    }
  }

  return { ok: true, matches };
}

export type RegexReplaceResult =
  | { ok: true; output: string }
  | { ok: false; error: string };

/**
 * Replace all matches of pattern in text with replacement string.
 * Uses JS replace with global flag; $&, $1, etc. are supported.
 */
export function runReplace(
  pattern: string,
  flagsString: string,
  text: string,
  replacement: string
): RegexReplaceResult {
  const trimmed = pattern.trim();
  if (!trimmed) {
    return { ok: false, error: 'Enter a regex pattern.' };
  }

  let re: RegExp;
  try {
    re = new RegExp(trimmed, flagsString);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Invalid regular expression.';
    return { ok: false, error: `Invalid regex: ${message}` };
  }

  try {
    const output = text.replace(re, replacement);
    return { ok: true, output };
  } catch {
    return { ok: false, error: 'Replace failed. Check replacement string (e.g. $1, $&).' };
  }
}

export type ExplainLine = { token: string; description: string };

/**
 * Simple regex explanation: break pattern into common tokens and describe each.
 * Covers \d, \D, \w, \W, \s, \S, \d+, \d{n,m}, character classes, etc.
 */
export function explainRegex(pattern: string): ExplainLine[] {
  const lines: ExplainLine[] = [];
  if (!pattern.trim()) return lines;

  const p = pattern;
  let i = 0;

  const backslashDesc: Record<string, string> = {
    d: 'digit (0-9)',
    D: 'non-digit',
    w: 'word character',
    W: 'non-word character',
    s: 'whitespace',
    S: 'non-whitespace',
  };

  while (i < p.length) {
    const rest = p.slice(i);

    // \d{3}, \d{2,4}
    const braceQuant = /^\\([dDwWsS])\{(\d+)(?:,(\d*))?\}/.exec(rest);
    if (braceQuant) {
      const token = braceQuant[0];
      const n = braceQuant[2];
      const m = braceQuant[3];
      const desc = m !== undefined ? `${n} to ${m || 'many'} ${backslashDesc[braceQuant[1]]}s` : `${n} ${backslashDesc[braceQuant[1]]}s`;
      lines.push({ token, description: desc });
      i += token.length;
      continue;
    }

    // \d+, \d*
    const starPlus = /^\\([dDwWsS])([\*\+])/.exec(rest);
    if (starPlus) {
      const desc = starPlus[2] === '+' ? `one or more ${backslashDesc[starPlus[1]]}s` : `zero or more ${backslashDesc[starPlus[1]]}s`;
      lines.push({ token: starPlus[0], description: desc });
      i += starPlus[0].length;
      continue;
    }

    // [...], [^...]
    const charClass = /^\[\^?[^\]]*\]/.exec(rest);
    if (charClass) {
      const raw = charClass[0];
      const desc = raw.startsWith('[^') ? 'any character not in set' : 'any character in set';
      lines.push({ token: raw, description: desc });
      i += raw.length;
      continue;
    }

    // . ^ $ ( ) | * + ? \ etc.
    const special: Record<string, string> = {
      '.': 'any character (except newline)',
      '^': 'start of string (or line with m)',
      $: 'end of string (or line with m)',
      '(': 'start capture group',
      ')': 'end capture group',
      '|': 'or (alternation)',
      '*': 'zero or more (quantifier)',
      '+': 'one or more (quantifier)',
      '?': 'zero or one (quantifier)',
      '\\': 'escape next character',
    };
    if (special[rest[0]]) {
      lines.push({ token: rest[0], description: special[rest[0]] });
      i += 1;
      continue;
    }

    // \d, \D, \w, \W, \s, \S (single)
    const singleBs = /^\\([dDwWsS])/.exec(rest);
    if (singleBs) {
      lines.push({ token: singleBs[0], description: `one ${backslashDesc[singleBs[1]]}` });
      i += 2;
      continue;
    }

    // \n, \t, other escape
    if (rest[0] === '\\' && rest.length >= 2) {
      lines.push({ token: rest.slice(0, 2), description: 'escape sequence' });
      i += 2;
      continue;
    }

    // literal
    const lit = rest[0];
    const litDesc = lit === ' ' ? 'space' : lit === '\t' ? 'tab' : 'literal character';
    lines.push({ token: lit, description: litDesc });
    i += 1;
  }

  return lines;
}
