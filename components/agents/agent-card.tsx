"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Download, Plug, Star } from "lucide-react";

type AgentCardProps = {
  agent: {
    id: string;
    title: string;
    slug: string;
    description: string;
    category?: string | null;
    mcpServers: string[];
    languages: string[];
    frameworks: string[];
    tags: string[];
    difficulty: string;
    featured?: boolean;
    downloads?: number;
  };
};

export function AgentCard({ agent }: AgentCardProps) {
  const mcpCount = agent.mcpServers?.length || 0;
  
  return (
    <Link href={`/agents/${agent.slug}`} className="animate-fadeUp">
      <Card className="h-full transition duration-150 hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(168,85,247,0.25)] hover:border-purple-500/40 cursor-pointer">
        <CardHeader className="p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Bot className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg line-clamp-1">{agent.title}</CardTitle>
                {agent.category && (
                  <p className="text-xs text-slate-500 capitalize mt-0.5">{agent.category}</p>
                )}
              </div>
            </div>
            {agent.featured && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
            )}
          </div>
          <CardDescription className="line-clamp-2 mt-2">
            {agent.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {/* MCP Requirements */}
          {mcpCount > 0 && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-teal-400">
              <Plug className="h-3.5 w-3.5" />
              <span>Requires {mcpCount} MCP{mcpCount > 1 ? 's' : ''}</span>
            </div>
          )}
          
          {/* Tags and Languages */}
          <div className="flex flex-wrap gap-1.5">
            {agent.languages.slice(0, 2).map((lang) => (
              <Badge key={lang} variant="outline" className="capitalize text-xs">
                {lang}
              </Badge>
            ))}
            {agent.frameworks.slice(0, 1).map((framework) => (
              <Badge key={framework} variant="outline" className="capitalize text-xs">
                {framework}
              </Badge>
            ))}
            {agent.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="capitalize text-xs">
                {tag}
              </Badge>
            ))}
            {(agent.languages.length + agent.frameworks.length + agent.tags.length) > 5 && (
              <Badge variant="outline" className="text-xs">
                +{(agent.languages.length + agent.frameworks.length + agent.tags.length) - 5}
              </Badge>
            )}
          </div>
          
          {/* Downloads */}
          {agent.downloads !== undefined && agent.downloads > 0 && (
            <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
              <Download className="h-3.5 w-3.5" />
              <span>{agent.downloads} installs</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

