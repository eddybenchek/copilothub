import { Prompt, Workflow, Tool, User, Vote } from '@prisma/client';

// Extended types with relations
export type PromptWithAuthor = Prompt & {
  author: User;
  votes: Vote[];
};

export type WorkflowWithAuthor = Workflow & {
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

// Form submission types
export type CreatePromptInput = {
  title: string;
  description: string;
  content: string;
  tags: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
};

export type CreateWorkflowInput = {
  title: string;
  description: string;
  content: string;
  steps: string[];
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
  targetType: 'PROMPT' | 'WORKFLOW' | 'TOOL';
  value: 1 | -1;
};

