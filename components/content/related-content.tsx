import Link from 'next/link';
import { PromptCard } from '@/components/prompt/prompt-card';
import { InstructionCard } from '@/components/instructions/instruction-card';
import { AgentCard } from '@/components/agents/agent-card';
import { ToolCard } from '@/components/tool/tool-card';
import { McpCard } from '@/components/mcp/mcp-card';
import type { PromptWithAuthor, InstructionWithAuthor, AgentWithAuthor, ToolWithAuthor, McpWithAuthor } from '@/lib/types';

interface RelatedContentProps {
  type: 'prompt' | 'instruction' | 'agent' | 'tool' | 'mcp';
  items: PromptWithAuthor[] | InstructionWithAuthor[] | AgentWithAuthor[] | ToolWithAuthor[] | McpWithAuthor[];
  title?: string;
}

export function RelatedContent({ type, items, title }: RelatedContentProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const typeLabels: Record<string, string> = {
    prompt: 'Prompts',
    instruction: 'Instructions',
    agent: 'Agents',
    tool: 'Tools',
    mcp: 'MCPs',
  };
  
  const sectionTitle = title || `Related ${typeLabels[type] || type}`;
  const basePaths: Record<string, string> = {
    prompt: '/prompts',
    instruction: '/instructions',
    agent: '/agents',
    tool: '/tools',
    mcp: '/mcps',
  };
  const basePath = basePaths[type] || `/${type}s`;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{sectionTitle}</h2>
        <Link
          href={basePath}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item: any) => {
          switch (type) {
            case 'prompt':
              return <PromptCard key={item.id} prompt={item as PromptWithAuthor} />;
            case 'instruction':
              return <InstructionCard key={item.id} instruction={item as InstructionWithAuthor} />;
            case 'agent':
              return <AgentCard key={item.id} agent={item as AgentWithAuthor} />;
            case 'tool':
              return <ToolCard key={item.id} tool={item as ToolWithAuthor} />;
            case 'mcp':
              return <McpCard key={item.id} mcp={item as McpWithAuthor} />;
            default:
              return null;
          }
        })}
      </div>
    </section>
  );
}

