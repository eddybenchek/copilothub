// lib/search-types.ts

export type SearchType = "all" | "prompt" | "tool" | "mcp" | "instruction" | "agent";

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type SearchResultBase = {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  type: "prompt" | "tool" | "mcp" | "instruction" | "agent";
};

export type SearchResults = {
  prompts: SearchResultBase[];
  tools: SearchResultBase[];
  mcps: SearchResultBase[];
  instructions: SearchResultBase[];
  agents: SearchResultBase[];
};

export function highlightMatch(text: string, query: string): {
  parts: { text: string; match: boolean }[];
} {
  if (!query.trim()) return { parts: [{ text, match: false }] };

  const q = query.trim();
  const regex = new RegExp(`(${escapeRegExp(q)})`, "ig");
  const parts: { text: string; match: boolean }[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), match: false });
    }
    parts.push({ text: match[0], match: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), match: false });
  }

  return { parts };
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

