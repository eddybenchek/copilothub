import { z } from 'zod';

// Prompt validation
export const createPromptSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  content: z.string().min(20).max(10000),
  tags: z.array(z.string()).min(1).max(10),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
});

// Workflow validation
export const createWorkflowSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  content: z.string().min(20).max(10000),
  steps: z.array(z.string()).min(1).max(20),
  tags: z.array(z.string()).min(1).max(10),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
});

// Tool validation
export const createToolSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  content: z.string().min(20).max(10000),
  url: z.string().url().optional(),
  tags: z.array(z.string()).min(1).max(10),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
});

// Vote validation
export const voteSchema = z.object({
  targetId: z.string().cuid(),
  targetType: z.enum(['PROMPT', 'TOOL', 'MCP', 'INSTRUCTION', 'AGENT']),
  value: z.union([z.literal(1), z.literal(-1)]),
});

