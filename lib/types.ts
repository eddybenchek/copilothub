import { Prompt, Tool, User, Vote, McpServer, Instruction, Agent } from '@prisma/client';

// Extended types with relations
export type PromptWithAuthor = Prompt & {
  author: User;
  votes: Vote[];
};

export type ToolWithAuthor = Tool & {
  author: User;
  votes: Vote[];
  name?: string | null;
  shortDescription?: string | null;
  websiteUrl?: string | null;
  logo?: string | null;
  authorName?: string | null;
};

export type McpWithAuthor = McpServer & {
  author: User;
  votes: Vote[];
  name?: string | null;
  shortDescription?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  logo?: string | null;
  authorName?: string | null;
};

export type InstructionWithAuthor = Instruction & {
  author: User;
  votes: Vote[];
};

export type AgentWithAuthor = Agent & {
  author: User;
  votes: Vote[];
};

// Form submission types
export type CreatePromptInput = {
  title: string;
  description: string;
  content: string;
  tags: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
};

export type CreateToolInput = {
  title: string;
  description: string;
  content: string;
  url?: string;
  tags: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
};

// Vote types
export type VoteInput = {
  targetId: string;
  targetType: 'PROMPT' | 'TOOL' | 'MCP' | 'INSTRUCTION' | 'AGENT';
  value: 1 | -1;
};

