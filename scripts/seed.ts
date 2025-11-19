import { PrismaClient, Difficulty, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@copilotdirectory.com' },
    update: {},
    create: {
      email: 'demo@copilotdirectory.com',
      name: 'Demo User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create example prompts
  const prompts = getPromptsSeed(demoUser.id);


  for (const prompt of prompts) {
    await prisma.prompt.upsert({
      where: { slug: prompt.slug },
      update: {},
      create: prompt,
    });
  }

  function getPromptsSeed(authorId: string) {
    return [
      // 1. CODE GENERATION
      {
        title: "Generate a Clean, Typed Utility Function",
        slug: "generate-clean-typed-utility-function",
        description:
          "Ask Copilot to create a reusable, well-typed utility function with edge cases handled.",
        content: `You are a senior engineer. Generate a clean, reusable utility function that does the following:
  
  [describe the behaviour, inputs, and expected output here]
  
  Requirements:
  - Use TypeScript.
  - Strongly type all parameters and return values.
  - Handle null/undefined and common edge cases.
  - Add a short JSDoc comment explaining the function.
  - Keep the implementation small and focused.
  
  After writing the function, add 2–3 usage examples as inline comments.`,
        tags: [
          "category:code-generation",
          "typescript",
          "utilities",
          "clean-code",
        ],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Generate a Full CRUD Module",
        slug: "generate-full-crud-module",
        description:
          "Use Copilot to scaffold a complete CRUD module for a resource, with routes, validation, and service logic.",
        content: `Generate a complete CRUD module for the resource: [RESOURCE_NAME].
  
  Stack:
  - [language/framework, e.g. TypeScript + Node.js + Express]
  
  Requirements:
  - Define a data model/interface for the resource.
  - Implement controller functions: list, get by id, create, update, delete.
  - Add basic input validation for create and update.
  - Use clear error handling and HTTP status codes.
  - Put route definitions in a separate file, wired to the controller.
  
  Keep the code idiomatic and easy to extend.`,
        tags: [
          "category:code-generation",
          "backend",
          "crud",
          "rest",
          "node",
          "typescript",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Generate a Reusable React Component from Requirements",
        slug: "generate-reusable-react-component-from-requirements",
        description:
          "Turn a natural language UI description into a reusable React + Tailwind component.",
        content: `You are a front-end expert.
  
  From this description, build a reusable React component using modern best practices:
  
  [Paste UI / behaviour description here]
  
  Requirements:
  - Use React with functional components and hooks.
  - Use Tailwind CSS utility classes for styling.
  - Add a typed props interface (TypeScript).
  - Support loading/empty/error states if relevant.
  - Keep the JSX clean and avoid deeply nested markup.
  - Add a short comment at the top explaining the component's purpose.`,
        tags: [
          "category:code-generation",
          "frontend",
          "react",
          "tailwind",
          "typescript",
          "ui",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 2. DEBUGGING & FIXING
      {
        title: "Explain and Fix a Buggy Function",
        slug: "explain-and-fix-buggy-function",
        description:
          "Have Copilot explain what’s wrong with a function and propose a concrete fix.",
        content: `You are a debugging assistant.
  
  1. Read the following function carefully.
  2. Explain in plain language what it is trying to do.
  3. Identify the exact bug(s) or logical issues.
  4. Propose a fixed version of the function.
  5. Briefly explain why your fix works.
  
  Here is the function:
  
  [Paste function here]`,
        tags: ["category:debugging", "bugfix", "explanation", "analysis"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Instrument and Diagnose a Silent Failure",
        slug: "instrument-and-diagnose-silent-failure",
        description:
          "Help Copilot add logging and guards to diagnose code that fails silently.",
        content: `The following code sometimes fails silently or behaves incorrectly.
  
  1. Add structured logging or console output at key decision points.
  2. Add error handling where appropriate (try/catch or result types).
  3. Add guards for invalid input or unexpected states.
  4. Suggest how to reproduce or narrow down the bug.
  
  Code:
  
  [Paste code here]`,
        tags: [
          "category:debugging",
          "logging",
          "observability",
          "error-handling",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Optimize a Hot Path for Performance",
        slug: "optimize-hot-path-for-performance",
        description:
          "Ask Copilot to find and optimize bottlenecks in a performance-critical function.",
        content: `You are a performance engineer.
  
  We have this performance-critical function:
  
  [Paste function or block of code here]
  
  Tasks:
  - Identify likely performance bottlenecks or wasteful operations.
  - Suggest micro-optimizations as well as simpler algorithmic improvements.
  - Provide an optimized version of the code.
  - Explain the tradeoffs of your changes.`,
        tags: ["category:debugging", "performance", "optimization"],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 3. DOCUMENTATION
      {
        title: "Generate Clear Documentation for a Module",
        slug: "generate-clear-documentation-for-module",
        description:
          "Turn a code module into human-readable documentation with purpose, usage, and examples.",
        content: `Generate documentation for the following module:
  
  [Paste module / file here]
  
  Include:
  - A high-level description of what the module does.
  - A list of exported functions/classes with 1–2 sentence explanations.
  - Parameters and return values for each public function.
  - At least one usage example for key functions.
  - Notes about assumptions or important edge cases.`,
        tags: ["category:documentation", "docs", "developer-experience"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Add JSDoc / Docstrings to Public Functions",
        slug: "add-jsdoc-or-docstrings-to-public-functions",
        description:
          "Ask Copilot to add documentation comments to all public functions in a file.",
        content: `Add high-quality documentation comments to all public functions in this file.
  
  Requirements:
  - If JavaScript/TypeScript, use JSDoc.
  - If Python, use standard docstring style.
  - Document parameters, return values, and side effects.
  - Mention thrown errors or important edge cases.
  
  File:
  
  [Paste file here]`,
        tags: ["category:documentation", "jsdoc", "docstrings"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Summarize a Large File in Plain Language",
        slug: "summarize-large-file-in-plain-language",
        description:
          "Use Copilot to summarize the purpose of a complex file in a short human-readable description.",
        content: `Summarize the following file in 3–5 sentences aimed at a developer seeing it for the first time.
  
  Focus on:
  - What the code is responsible for.
  - How it fits into a larger system.
  - Any important side effects or external dependencies.
  
  File:
  
  [Paste file here]`,
        tags: ["category:documentation", "summarization", "onboarding"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 4. REFACTORING
      {
        title: "Refactor for Readability and Maintainability",
        slug: "refactor-for-readability-and-maintainability",
        description:
          "Get Copilot to refactor code for clarity without changing behavior.",
        content: `Refactor the following code to improve readability and maintainability, without changing behaviour.
  
  Goals:
  - Use clearer naming for variables and functions.
  - Reduce nesting and deeply indented blocks.
  - Extract small, reusable helper functions where it makes sense.
  - Remove dead code and obvious duplication.
  
  Code:
  
  [Paste code here]`,
        tags: ["category:refactoring", "clean-code", "readability"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Split a Large Function into Smaller Units",
        slug: "split-large-function-into-smaller-units",
        description:
          "Break a large function into smaller, focused functions with clear responsibilities.",
        content: `This function is too large and does too many things.
  
  Refactor it by:
  - Identifying logical sub-steps.
  - Extracting them into small, pure functions with good names.
  - Keeping the original function as an orchestrator that calls the smaller ones.
  - Avoiding duplication and side effects where possible.
  
  Function:
  
  [Paste function here]`,
        tags: ["category:refactoring", "modularization", "clean-code"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Convert Callbacks to Async/Await",
        slug: "convert-callbacks-to-async-await",
        description:
          "Use Copilot to update legacy callback-style code to async/await.",
        content: `Convert the following callback-based asynchronous code to use async/await.
  
  Requirements:
  - Preserve error handling behaviour.
  - Make sure all asynchronous functions are properly awaited.
  - Clean up nested callbacks or "callback hell" into linear async/await flow.
  
  Code:
  
  [Paste callback-based code here]`,
        tags: ["category:refactoring", "async-await", "javascript", "node"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 5. TESTING
      {
        title: "Generate Jest Unit Tests for a Pure Function",
        slug: "generate-jest-unit-tests-for-pure-function",
        description:
          "Ask Copilot to create Jest tests covering normal and edge cases for a pure function.",
        content: `Write Jest unit tests for the following pure function.
  
  Requirements:
  - Cover common cases and edge cases.
  - Include tests for invalid input or error scenarios if relevant.
  - Use clear test names that describe behaviour.
  
  Function:
  
  [Paste function here]`,
        tags: ["category:testing", "jest", "unit-tests", "javascript"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Integration Tests for an API Endpoint",
        slug: "integration-tests-for-api-endpoint",
        description:
          "Create integration tests for an API endpoint, including success and failure paths.",
        content: `Write integration tests for this API endpoint.
  
  Requirements:
  - Use [testing framework, e.g. Jest + supertest].
  - Test success case(s) with valid input.
  - Test validation errors and authentication/authorization failures if relevant.
  - Assert on both HTTP status codes and response bodies.
  
  Endpoint details:
  
  [Paste route and handler here]`,
        tags: ["category:testing", "integration-tests", "api", "backend"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "React Component Tests with React Testing Library",
        slug: "react-component-tests-with-react-testing-library",
        description:
          "Use Copilot to write RTL tests for rendering and interactions of a React component.",
        content: `Write tests for the following React component using React Testing Library.
  
  Requirements:
  - Test initial render.
  - Test key user interactions (clicks, typing, etc.).
  - Test asynchronous behaviour if the component fetches data or updates later.
  - Avoid testing implementation details; focus on user-visible behaviour.
  
  Component:
  
  [Paste component here]`,
        tags: [
          "category:testing",
          "react",
          "react-testing-library",
          "frontend-tests",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 6. ARCHITECTURE & DESIGN
      {
        title: "Design a REST API for a Feature",
        slug: "design-rest-api-for-feature",
        description:
          "Prompt Copilot to propose a REST API design for a given feature, including endpoints and errors.",
        content: `Propose a REST API design for the following feature:
  
  [Describe the feature / domain]
  
  Include:
  - Endpoints and HTTP methods.
  - Path and query parameters.
  - Request and response body shapes.
  - Common error cases and status codes.
  - Any authentication/authorization considerations.
  
  Use a concise but clear format.`,
        tags: ["category:architecture", "api-design", "rest"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Suggest a Project Folder Structure",
        slug: "suggest-project-folder-structure",
        description:
          "Get Copilot to recommend a folder structure for a project based on tech stack and requirements.",
        content: `Given this stack and context:
  
  [Describe the stack, e.g. Next.js + Prisma + tRPC, plus general app type]
  
  Propose a sensible project folder structure that:
  - Separates domain logic from framework glue.
  - Keeps tests close to the code they cover.
  - Scales as the project grows.
  
  Explain the rationale briefly.`,
        tags: [
          "category:architecture",
          "project-structure",
          "best-practices",
        ],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Describe High-Level System Architecture",
        slug: "describe-high-level-system-architecture",
        description:
          "Use Copilot to describe a system’s architecture including services and data flow.",
        content: `Describe the high-level system architecture for this application:
  
  [Describe the use case / product briefly]
  
  Include:
  - Main services or components.
  - Data stores and how data flows between them.
  - External integrations (APIs, queues, third-party services).
  - Where business logic lives.
  - Any important scaling or reliability considerations.
  
  Format the answer as a structured text outline.`,
        tags: ["category:architecture", "system-design", "diagrams"],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 7. DEVOPS & SCRIPTS
      {
        title: "Generate a GitHub Actions CI Workflow",
        slug: "generate-github-actions-ci-workflow",
        description:
          "Ask Copilot to create a GitHub Actions workflow for testing and building a project.",
        content: `Create a GitHub Actions workflow for this project.
  
  Stack:
  [Node version / language / framework]
  
  Requirements:
  - Trigger on pull requests and pushes to main.
  - Install dependencies with caching.
  - Run tests and linting.
  - Build the project on main.
  
  Return a single YAML file under .github/workflows/ci.yml.`,
        tags: ["category:devops", "github-actions", "ci", "automation"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Write a Shell Script to Automate a Routine Task",
        slug: "write-shell-script-to-automate-routine-task",
        description:
          "Use Copilot to generate a safe shell script that automates a repetitive developer task.",
        content: `Write a shell script that automates the following task:
  
  [Describe the task, inputs, and expected outcome]
  
  Requirements:
  - Check for required tools/binaries and print a helpful message if missing.
  - Use clear variable names.
  - Handle common errors gracefully.
  - Echo progress messages so the user knows what's happening.`,
        tags: ["category:devops", "shell", "automation", "scripting"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Create a Production-Ready Dockerfile",
        slug: "create-production-ready-dockerfile",
        description:
          "Prompt Copilot to write a small, production-focused Dockerfile for your app.",
        content: `Create a production-ready Dockerfile for this application.
  
  Stack:
  [Describe the stack: language, framework, package manager, build command]
  
  Requirements:
  - Use a multi-stage build if feasible (build + runtime).
  - Optimize for small image size.
  - Set the working directory and non-root user where appropriate.
  - Expose the correct port.
  - Use environment variables for configuration, not hard-coded secrets.`,
        tags: ["category:devops", "docker", "containers", "deployment"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 8. LEARNING & EXPLANATION
      {
        title: "Explain Code Like I’m New to the Project",
        slug: "explain-code-like-im-new-to-the-project",
        description:
          "Let Copilot explain unfamiliar code in simple language for onboarding.",
        content: `Explain the following code to a developer who just joined the project and has not seen this file before.
  
  Focus on:
  - What the code is responsible for.
  - Key functions and their roles.
  - How data flows through the code.
  - Any non-obvious decisions or tradeoffs.
  
  Code:
  
  [Paste code here]`,
        tags: ["category:learning", "explanation", "onboarding"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Compare Two Implementation Approaches",
        slug: "compare-two-implementation-approaches",
        description:
          "Use Copilot to compare two different approaches for solving the same problem.",
        content: `We have two different implementations for the same feature:
  
  Approach A:
  [Paste code or description]
  
  Approach B:
  [Paste code or description]
  
  Compare them in terms of:
  - Readability.
  - Performance.
  - Maintainability.
  - Flexibility/extensibility.
  
  Recommend one, and explain why.`,
        tags: ["category:learning", "tradeoffs", "design-review"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Teach Me a Concept with Examples",
        slug: "teach-me-concept-with-examples",
        description:
          "Ask Copilot to explain a CS concept using examples, not just theory.",
        content: `Explain the concept of [concept name, e.g. "immutability", "pure functions", "idempotency", "event sourcing"].
  
  Requirements:
  - Use plain, intuitive language.
  - Include at least 2–3 small code examples.
  - Show both a "wrong" and "better" way if applicable.
  - Keep the explanation focused and practical.`,
        tags: ["category:learning", "education", "examples"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 9. API & BACKEND HELPERS
      {
        title: "Generate a Typed API Client",
        slug: "generate-typed-api-client",
        description:
          "Use Copilot to generate a strongly typed client for a REST API.",
        content: `Create a typed API client for the following REST API.
  
  Input:
  - Base URL: [base URL]
  - Endpoint list / OpenAPI snippet: [paste here]
  
  Requirements:
  - Use TypeScript.
  - Expose functions for each endpoint with typed parameters and return types.
  - Support abort signals/cancellation if appropriate.
  - Handle errors in a consistent way (e.g. custom error type).`,
        tags: ["category:api-backend", "api-client", "typescript", "rest"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Define Zod Schemas for Incoming Data",
        slug: "define-zod-schemas-for-incoming-data",
        description:
          "Ask Copilot to generate Zod validation schemas from an object shape or API payload.",
        content: `Generate Zod schemas for the following data shapes:
  
  [Paste example JSON or TypeScript interfaces for request/response bodies]
  
  Requirements:
  - Use z.object, z.string, z.number, etc., with appropriate constraints.
  - Mark optional fields correctly.
  - Derive TypeScript types from the schemas where useful (e.g. z.infer).`,
        tags: ["category:api-backend", "validation", "zod", "typescript"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Create Prisma Models from a Domain Description",
        slug: "create-prisma-models-from-domain-description",
        description:
          "Turn a human-readable domain description into Prisma models and relationships.",
        content: `Convert this domain description into Prisma models.
  
  Domain description:
  [Describe entities and relationships]
  
  Requirements:
  - Use appropriate scalar types.
  - Model one-to-many and many-to-many relationships explicitly.
  - Add indexes for fields that will be queried often.
  - Include createdAt / updatedAt fields where appropriate.`,
        tags: ["category:api-backend", "prisma", "database", "orm"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 10. FRONTEND & UI HELPERS
      {
        title: "Build a Responsive Layout from a Brief",
        slug: "build-responsive-layout-from-brief",
        description:
          "Use Copilot to generate a responsive layout in React + Tailwind from a textual brief.",
        content: `Create a responsive page layout in React + Tailwind CSS based on this brief:
  
  [Describe sections, hero, sidebar, cards, etc.]
  
  Requirements:
  - Use semantic HTML structure.
  - Use Tailwind utility classes for spacing, typography, and colors.
  - Ensure it looks good on mobile and desktop (responsive).`,
        tags: ["category:frontend", "react", "tailwind", "ui-layout"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Generate a Form with Validation",
        slug: "generate-form-with-validation",
        description:
          "Prompt Copilot to build a form with React Hook Form and schema validation.",
        content: `Generate a form for the following fields:
  
  [Describe fields, types, and constraints]
  
  Stack:
  - React
  - React Hook Form
  - Zod for validation
  
  Requirements:
  - Show inline validation messages.
  - Disable the submit button while submitting.
  - Handle submission success and error states.`,
        tags: [
          "category:frontend",
          "forms",
          "react-hook-form",
          "validation",
          "zod",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Create a Small UI State Machine",
        slug: "create-small-ui-state-machine",
        description:
          "Have Copilot model UI states as a simple state machine, instead of scattered booleans.",
        content: `Model the following UI behaviour as a small state machine.
  
  Describe the states and transitions first, then implement:
  
  [Describe the UI flow: idle, loading, error, success, etc.]
  
  Use:
  - A TypeScript discriminated union for state.
  - A reducer or state machine-style handler for transitions.
  
  Explain how this is better than multiple boolean flags.`,
        tags: ["category:frontend", "state-machine", "typescript", "ux"],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 11. DATABASE & SQL
      {
        title: "Write a SQL Query from Requirements",
        slug: "write-sql-query-from-requirements",
        description:
          "Ask Copilot to translate a human requirement into a SQL SELECT query.",
        content: `Write a SQL query for this requirement:
  
  [Describe the tables, relationships, and what you want to retrieve]
  
  Requirements:
  - Use explicit JOINs instead of implicit joins.
  - Alias tables to keep the query readable.
  - Order and limit results if appropriate.
  
  After the query, add a brief explanation.`,
        tags: ["category:database", "sql", "queries", "postgres"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Optimize a Slow SQL Query",
        slug: "optimize-slow-sql-query",
        description:
          "Use Copilot to diagnose and optimize a slow SQL query, including index suggestions.",
        content: `Analyze and optimize this slow SQL query:
  
  [Paste query here]
  
  Tasks:
  - Identify likely bottlenecks.
  - Suggest better indexes or changes to existing ones.
  - Propose a more efficient version of the query if possible.
  - Explain the reasoning in plain language.`,
        tags: ["category:database", "sql", "performance", "indexes"],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Generate Database Migration Scripts",
        slug: "generate-database-migration-scripts",
        description:
          "Have Copilot generate migration scripts for schema changes based on a before/after view.",
        content: `Generate database migration steps for the following schema change.
  
  Current schema:
  [Describe or paste current table definitions]
  
  Desired schema:
  [Describe or paste desired table definitions]
  
  Provide:
  - SQL ALTER statements (or migration DSL for the chosen tool).
  - Notes about data backfills or transformations if needed.`,
        tags: ["category:database", "migrations", "schema"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
  
      // 12. CODE REVIEW & QUALITY
      {
        title: "Perform a Code Review on a PR Diff",
        slug: "perform-code-review-on-pr-diff",
        description:
          "Ask Copilot to review a diff and point out issues, smells, and improvements.",
        content: `Act as a senior engineer reviewing this pull request diff.
  
  Tasks:
  - Identify potential bugs or risky changes.
  - Point out code smells or anti-patterns.
  - Suggest improvements to naming, structure, or tests.
  - Be specific and actionable.
  
  Diff:
  
  [Paste diff or code changes here]`,
        tags: ["category:code-review", "quality", "best-practices"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Check Code for Security Issues",
        slug: "check-code-for-security-issues",
        description:
          "Use Copilot to look for common security pitfalls in a code snippet.",
        content: `Review the following code for security issues.
  
  Focus on:
  - Injection risks (SQL, command, etc.).
  - Insecure handling of secrets or tokens.
  - Broken authentication/authorization logic.
  - Insecure use of crypto or randomness.
  
  List each issue you find and suggest a fix.
  
  Code:
  
  [Paste code here]`,
        tags: ["category:code-review", "security", "security-review"],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Enforce Project Coding Conventions",
        slug: "enforce-project-coding-conventions",
        description:
          "Ask Copilot to rewrite code to follow your project's style and conventions.",
        content: `Rewrite this code to follow our project conventions.
  
  Our conventions:
  [Describe or paste a summary of your style guide / lint rules]
  
  Tasks:
  - Fix naming to match conventions.
  - Reformat code to match our style.
  - Update any patterns that violate our best practices.
  
  Code:
  
  [Paste code here]`,
        tags: ["category:code-review", "style", "linting", "consistency"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },

      // MODERNIZATION & MIGRATION
      {
        title: "Migrate SQL Query to ORM (Prisma/TypeORM)",
        slug: "migrate-sql-to-orm",
        description: "Convert raw SQL queries to type-safe ORM operations.",
        content: `You are a senior backend engineer. Rewrite this raw SQL query using a modern ORM (Prisma or TypeORM).

Requirements:
- Use parameterized inputs to prevent SQL injection
- Return strongly typed results
- Preserve WHERE/ORDER BY/LIMIT semantics
- Use relations instead of manual joins where possible
- Keep behavior identical

Show:
1) Original SQL
2) ORM model definitions (if needed)
3) Equivalent ORM query code.`,
        tags: [
          "category:modernization",
          "migration",
          "sql",
          "orm",
          "prisma",
          "backend",
        ],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Refactor Monolith to Modular Architecture",
        slug: "refactor-monolith-to-modules",
        description:
          "Break down a monolithic file into clean, maintainable modules.",
        content: `You are refactoring a legacy monolithic file.

Goal: split this file into a small set of cohesive modules.

Rules:
- Group code by responsibility (auth, data access, domain logic, helpers)
- Extract reusable functions from duplicated inline logic
- Create clear public interfaces (exported functions/types only)
- Avoid circular dependencies
- Add comments explaining module boundaries

Return:
- Proposed folder structure
- New module files (with code)
- Updated imports in the original entry point.`,
        tags: [
          "category:modernization",
          "refactor",
          "architecture",
          "modularization",
          "backend",
        ],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Convert JavaScript File to TypeScript",
        slug: "js-to-ts-full-conversion",
        description: "Upgrade JavaScript files to fully typed TypeScript.",
        content: `Convert this JavaScript file to TypeScript.

Do:
- Rename to .ts
- Add type annotations for parameters and returns
- Introduce interfaces/types for complex objects
- Use generics where useful
- Enable strict null checks (no implicit any)
- Fix any type errors that appear

Explain any important typing decisions in comments.`,
        tags: [
          "category:modernization",
          "typescript",
          "javascript",
          "migration",
          "types",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Upgrade React Class Component to Hooks",
        slug: "react-class-to-hooks",
        description:
          "Modernize a React class component by converting it to a functional one using hooks.",
        content: `Convert this React class component to a modern functional component.

Use:
- useState for local state
- useEffect for lifecycle logic
- useMemo / useCallback for expensive computations and callbacks
- Extract reusable logic into custom hooks when it makes sense

Preserve:
- Existing props API
- Side effects
- Behavior and rendering output`,
        tags: ["category:modernization", "react", "hooks", "refactor", "frontend"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Upgrade Dependencies Safely (Breaking Change Aware)",
        slug: "upgrade-dependencies-safely",
        description:
          "Analyze dependency updates for breaking changes and suggest safe migration steps.",
        content: `Given this package.json and lockfile, generate a safe dependency upgrade plan.

Steps:
1) Group dependencies by risk (framework, runtime, tooling, minor libs)
2) For major versions, list key breaking changes
3) Propose upgrade order (low-risk first, core libs last)
4) Suggest code changes needed for each risky upgrade
5) Provide commands to run (npm/yarn/pnpm)
6) Recommend tests to run after each batch

Output:
- Upgrade checklist
- Notes for each important package`,
        tags: [
          "category:modernization",
          "dependencies",
          "upgrade",
          "breaking-changes",
          "tooling",
        ],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Modernize Legacy API to RESTful Standards",
        slug: "modernize-legacy-api",
        description: "Refactor legacy API endpoints to follow modern REST.",
        content: `Refactor this legacy HTTP handler into a RESTful endpoint.

Guidelines:
- Use nouns for resources (e.g. /users, /orders)
- Use correct HTTP verbs (GET, POST, PUT/PATCH, DELETE)
- Return appropriate status codes and error shapes
- Add pagination parameters where needed
- Separate validation, business logic, and persistence

Show the new handler and explain the REST improvements you've made.`,
        tags: [
          "category:modernization",
          "api",
          "rest",
          "backend",
          "refactor",
          "http",
        ],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Convert CSS to Tailwind CSS Utilities",
        slug: "css-to-tailwind",
        description:
          "Rewrite traditional CSS classes using Tailwind utility classes.",
        content: `Translate these CSS rules into Tailwind CSS.

Rules:
- Prefer existing Tailwind spacing, color, and typography tokens
- Use responsive prefixes (sm:, md:, lg:) instead of media queries
- Use state variants (hover:, focus:, active:) instead of separate classes
- Avoid inline styles unless absolutely necessary

Return:
- Example HTML markup using Tailwind classes
- Notes about any compromises or design changes.`,
        tags: [
          "category:modernization",
          "tailwind",
          "css",
          "frontend",
          "design-system",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Rewrite Callback-based Code to async/await",
        slug: "callbacks-to-async-await",
        description: "Modernize callback-based code to promises and async/await.",
        content: `Refactor this callback-based function to use Promises and async/await.

Requirements:
- Remove callback hell / nested callbacks
- Preserve error propagation
- Keep the same external API where reasonable
- Simplify branching logic
- Use try/catch instead of callback(err)

Return before/after versions and explain the migration.`,
        tags: [
          "category:modernization",
          "javascript",
          "async",
          "promises",
          "node",
        ],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Express to NestJS Controller Migration",
        slug: "express-to-nestjs",
        description:
          "Convert an Express route handler to a NestJS controller with decorators.",
        content: `Convert this Express route (or set of routes) to NestJS.

Do:
- Create a @Controller with appropriate @Get/@Post/etc decorators
- Inject services instead of requiring modules directly
- Move validation into DTOs with class-validator
- Use NestJS exception filters instead of manual res.status calls

Return:
- NestJS controller code
- Any new DTOs/services you've introduced.`,
        tags: [
          "category:modernization",
          "node",
          "nestjs",
          "migration",
          "backend",
        ],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Upgrade React Router v5 to v6",
        slug: "react-router-5-to-6",
        description:
          "Migrate React Router v5 code to React Router v6 route and navigation APIs.",
        content: `Convert this React Router v5 setup to v6.

Apply:
- Replace <Switch> with <Routes>
- Convert component/render props to element={...}
- Replace useHistory with useNavigate
- Update redirects to <Navigate />
- Fix nested routes

Return updated routing code and call out any breaking changes.`,
        tags: [
          "category:modernization",
          "react",
          "router",
          "migration",
          "frontend",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Convert CommonJS to ES Modules",
        slug: "commonjs-to-esm",
        description:
          "Modernize legacy Node.js modules from require/module.exports to ES module syntax.",
        content: `Refactor this file from CommonJS to ES Modules.

Steps:
- Replace require() with import statements
- Replace module.exports / exports.foo with export default / named exports
- Ensure file extensions are explicit when required by your bundler/runtime
- Move side-effect imports to the top of the file

Explain any runtime implications (e.g. __dirname, top-level await).`,
        tags: [
          "category:modernization",
          "node",
          "esm",
          "modules",
          "migration",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Refactor Redux to Redux Toolkit",
        slug: "redux-to-rtk",
        description: "Simplify Redux boilerplate using Redux Toolkit.",
        content: `Refactor this Redux logic to use Redux Toolkit.

Use:
- createSlice for reducers + actions
- createAsyncThunk for async flows
- Immer-powered immutable updates
- configureStore for middleware + devtools

Remove:
- Hand-written action creators
- Large switch statements

Provide before/after code for at least one slice.`,
        tags: [
          "category:modernization",
          "react",
          "redux",
          "redux-toolkit",
          "frontend",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Convert Fetch Calls to React Query",
        slug: "fetch-to-react-query",
        description:
          "Modernize data fetching in React using React Query with caching and retries.",
        content: `Convert these manual fetch calls + loading state to React Query.

Do:
- Wrap each fetch in useQuery/useMutation
- Remove duplicated loading/error state from components
- Configure sensible cache time and staleTime
- Add retry behavior only where safe

Return updated component code and suggested React Query config.`,
        tags: [
          "category:modernization",
          "react",
          "react-query",
          "data-fetching",
          "frontend",
        ],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Modernize Node EventEmitter Code",
        slug: "eventemitter-modernization",
        description:
          "Convert low-level EventEmitter patterns into clearer async flows.",
        content: `Refactor this EventEmitter-based flow into modern patterns.

Options:
- Replace one-off events with async function calls returning Promises
- Use observables or pub/sub only when there's a clear benefit
- Simplify error channels
- Remove fragile string event names where possible

Explain your design choices and how they improve maintainability.`,
        tags: [
          "category:modernization",
          "node",
          "eventemitter",
          "async",
          "backend",
        ],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Convert SCSS to Tailwind or CSS Modules",
        slug: "scss-to-tailwind",
        description:
          "Refactor nested SCSS rules to modern utility-first Tailwind or component-scoped CSS Modules.",
        content: `Convert this SCSS file to a more modern styling approach.

Choose:
- Tailwind utilities, or
- Component-scoped CSS Modules

Do:
- Flatten deeply nested selectors
- Avoid over-specific selectors
- Replace magic numbers with spacing scale
- Keep responsive breakpoints explicit

Return updated markup + styles, and explain the mapping.`,
        tags: [
          "category:modernization",
          "scss",
          "tailwind",
          "css-modules",
          "frontend",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Convert Kubernetes YAML to Terraform",
        slug: "k8s-to-terraform",
        description:
          "Translate raw Kubernetes YAML manifests into Terraform IaC modules.",
        content: `Translate these Kubernetes YAML manifests into Terraform resources.

Steps:
- Identify Deployments, Services, ConfigMaps, Secrets, etc.
- Use the kubernetes_* provider resources or Helm charts
- Map metadata, labels, and selectors correctly
- Parameterize replicas, resources, and image tags

Return Terraform code and a short README for how to apply it.`,
        tags: [
          "category:modernization",
          "kubernetes",
          "terraform",
          "iac",
          "devops",
        ],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Modernize Legacy Java API to Spring Boot",
        slug: "java-api-to-spring-boot",
        description:
          "Rewrite old Java HTTP handlers into modern Spring Boot REST controllers.",
        content: `Rewrite this legacy Java HTTP or servlet-based API into Spring Boot.

Use:
- @RestController and @RequestMapping/@GetMapping/etc
- DTOs for request/response bodies
- Validation annotations (e.g. @NotNull, @Size)
- Exception handlers via @ControllerAdvice

Keep behavior the same while improving structure.`,
        tags: [
          "category:modernization",
          "java",
          "spring-boot",
          "migration",
          "backend",
        ],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Convert Python 2 Code to Python 3",
        slug: "python2-to-python3",
        description:
          "Upgrade Python 2 code to Python 3, handling print, unicode, xrange, and integer division.",
        content: `Convert this Python 2 script to Python 3.

Checklist:
- Replace print statements with print() function
- Fix unicode/bytes handling
- Replace xrange with range
- Fix integer division using // where appropriate
- Update any deprecated stdlib usage

Explain any behavioral differences introduced by the migration.`,
        tags: [
          "category:modernization",
          "python",
          "migration",
          "syntax",
          "backend",
        ],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Migrate SQL Schema to Prisma Schema",
        slug: "sql-to-prisma-schema",
        description: "Convert CREATE TABLE SQL into a Prisma schema.prisma file.",
        content: `Convert these CREATE TABLE statements into Prisma schema models.

Do:
- Infer primary keys and use @id/@default
- Add @unique where appropriate
- Map foreign keys to relations
- Convert enums to Prisma enums
- Preserve not-null constraints

Return a schema.prisma snippet representing the same schema.`,
        tags: [
          "category:modernization",
          "prisma",
          "sql",
          "schema",
          "migration",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
      {
        title: "Migrate Webpack Build to Vite",
        slug: "webpack-to-vite",
        description:
          "Replace an existing Webpack setup with faster, modern Vite configuration.",
        content: `Migrate this Webpack-based build to Vite.

Steps:
- Create vite.config.(ts|js) with equivalent entry points
- Convert loaders to Vite plugins where needed
- Recreate aliases and environment variables
- Update npm scripts for dev/build/preview
- Call out any plugin gaps or behavior changes

Return the Vite config and updated package.json scripts.`,
        tags: [
          "category:modernization",
          "webpack",
          "vite",
          "build-system",
          "tooling",
          "migration",
        ],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
      },
    ];
  }
  

  console.log('✅ Created', prompts.length, 'example prompts');

  // Create example workflows
  const workflows = getWorkflowsSeed(demoUser.id);

  for (const workflow of workflows) {
    await prisma.workflow.upsert({
      where: { slug: workflow.slug },
      update: {},
      create: workflow,
    });
  }

  function getWorkflowsSeed(authorId: string) {
    return [
      // 1. PROJECT SETUP & SCAFFOLDING
      {
        title: "Scaffold a New Feature from a Ticket",
        slug: "scaffold-new-feature-from-ticket",
        description:
          "Turn a feature ticket into a structured plan, files, and implementation using Copilot.",
        content:
          "A repeatable workflow to turn a feature request into actionable tasks, file scaffolding, and initial implementation using GitHub Copilot.",
        steps: [
          "Paste your feature ticket or user story into a scratch file or comment.",
          `Ask Copilot: "Summarize this feature into 3–5 concrete tasks and list the files likely involved in this codebase."`,
          "Review Copilot’s task outline and adjust as needed.",
          "For each task, create/open the suggested file and write a small comment describing the expected change.",
          "Place the cursor below each comment and let Copilot generate the implementation.",
          `Ask Copilot: "Generate tests that confirm this feature works end-to-end."`,
          "Run tests, fix issues, and commit only when everything is passing."
        ],
        tags: ["category:setup", "feature-development", "planning"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      {
        title: "Bootstrap a New Service Module",
        slug: "bootstrap-new-service-module",
        description:
          "Create a new service module with interface, implementation, and tests using Copilot.",
        content:
          "Use Copilot to quickly scaffold a service-layer module that includes types, implementation, and unit tests.",
        steps: [
          "Create a file like `userService.ts` and add a comment describing the service responsibilities.",
          `Ask Copilot: "Generate an interface for this service including methods for [list of operations]."`,
          "Review and refine the generated interface.",
          `Ask Copilot: "Generate the implementation skeleton for this interface."`,
          "Create a test file referencing the interface methods.",
          `Ask Copilot: "Generate tests for these service methods using Jest or Vitest."`,
          "Run tests, fix errors, and refine logic."
        ],
        tags: ["category:setup", "service-layer", "typescript"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      // 2. REFACTORING
      {
        title: "Refactor a Legacy Function into Smaller Units",
        slug: "workflow-refactor-legacy-function",
        description:
          "Break a large legacy function into small, testable pieces using Copilot.",
        content:
          "A structured workflow for refactoring a massive function into smaller composable helpers without changing behavior.",
        steps: [
          "Open the large legacy function and add a comment noting that it must be broken down.",
          `Ask Copilot: "Identify logical sections in this function and propose names for helper functions."`,
          "Extract each section into a new pure function.",
          `Ask Copilot: "Generate unit tests for the new helper functions."`,
          "Run tests and ensure behavior is preserved.",
          "Remove dead code and unused variables.",
          "Document the new modular structure."
        ],
        tags: ["category:refactoring", "clean-code", "legacy-code"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      {
        title: "Convert Callback-Based Code to Async/Await",
        slug: "workflow-convert-callbacks-to-async-await",
        description:
          "Modernize legacy callback patterns into async/await using Copilot.",
        content:
          "A safe and structured way to update callback-based async code into modern async/await with error handling.",
        steps: [
          "Open the callback-based function.",
          `Add a comment: "Convert this callback chain to async/await."`,
          "Ask Copilot to generate an async/await version.",
          "Review and compare side-by-side.",
          "Add error handling (try/catch).",
          "Update call sites to await the new async function.",
          "Run tests and remove the old implementation."
        ],
        tags: ["category:refactoring", "async-await", "javascript"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      // 3. TESTING
      {
        title: "Generate Unit Tests for Existing Business Logic",
        slug: "workflow-generate-unit-tests",
        description:
          "Add missing unit tests to existing business logic using Copilot as a test generator.",
        content:
          "A workflow to create high-value unit tests for untested areas of logic using Copilot.",
        steps: [
          "Identify key logic without test coverage.",
          "Create a matching test file.",
          "Paste signatures or sample calls as comments.",
          `Ask Copilot: "Generate Jest tests covering typical and edge cases."`,
          "Review and refine test expectations.",
          "Run tests and fix issues.",
          "Add regression tests for recently fixed bugs."
        ],
        tags: ["category:testing", "unit-tests", "jest"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      {
        title: "Add Integration Tests Around a Critical API",
        slug: "workflow-add-integration-tests",
        description:
          "Use Copilot to write integration tests around your most important API endpoint.",
        content:
          "A workflow to ensure critical backend paths are fully covered using automated integration tests assisted by Copilot.",
        steps: [
          "Select a critical API endpoint.",
          "Create an integration test file for it.",
          `Ask Copilot: "Write integration tests for success, validation errors, and auth failures."`,
          "Provide example request payloads.",
          "Run tests and adjust setup code.",
          "Commit once coverage is satisfactory."
        ],
        tags: ["category:testing", "integration-tests", "api"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      // 4. BUGFIXING
      {
        title: "Reproduce and Fix a Bug with Guided Logging",
        slug: "workflow-bugfix-guided-logging",
        description:
          "Use Copilot to isolate bugs by adding targeted logging and diagnostic output.",
        content:
          "A workflow designed to quickly identify hidden bugs by adding structured logs and using Copilot to interpret them.",
        steps: [
          "Document the bug: expected vs actual result.",
          `Ask Copilot: "Suggest where to add logging to diagnose this bug."`,
          "Insert targeted logs.",
          "Reproduce the issue and capture logs.",
          `Ask Copilot: "Based on these logs, where is the bug located?"`,
          "Apply the fix.",
          `Ask Copilot: "Write a regression test for this bug."`,
          "Clean up logs after verifying the fix."
        ],
        tags: ["category:debugging", "logging", "bugfix"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      {
        title: "Analyze a Failing Test with Copilot",
        slug: "workflow-analyze-failing-test",
        description:
          "Let Copilot explain failing test output and propose fixes.",
        content:
          "A workflow that combines code, failing tests, and Copilot's analysis to quickly identify root causes.",
        steps: [
          "Run the test suite and capture the failing test output.",
          "Paste the failing test and full stack trace into a scratch file.",
          `Ask Copilot: "Explain why this test fails and show the likely faulty code."`,
          "Navigate to the suggested area.",
          `Ask Copilot: "Provide a fixed version of this function."`,
          "Apply the fix and re-run tests.",
          "Add regression tests if needed."
        ],
        tags: ["category:debugging", "analysis", "tests"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      // 5. DOCUMENTATION
      {
        title: "Document a Module for New Developers",
        slug: "workflow-document-module",
        description:
          "Use Copilot to generate onboarding-friendly documentation.",
        content:
          "A workflow tailored to turning code into approachable documentation for new team members.",
        steps: [
          "Open a frequently misunderstood module.",
          `Ask Copilot: "Summarize what this module does for a new developer."`,
          "Paste its summary into documentation.",
          `Ask Copilot: "Generate usage examples for the main exports."`,
          "Add the examples to the docs.",
          "Link this documentation from the README."
        ],
        tags: ["category:docs", "onboarding", "documentation"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      {
        title: "Create API Reference Docs from Types",
        slug: "workflow-api-docs-from-types",
        description:
          "Turn TypeScript types into API docs using Copilot.",
        content:
          "A workflow that leverages Copilot to convert types/interfaces into human-readable API documentation.",
        steps: [
          "Collect related TypeScript interfaces.",
          "Paste them into a markdown file.",
          `Ask Copilot: "Generate an API-style explanation for each type."`,
          "Review and refine.",
          `Ask Copilot: "Generate common pitfalls developers should avoid."`,
          "Save in your documentation site."
        ],
        tags: ["category:docs", "api-docs", "typescript"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      // 6. FRONTEND
      {
        title: "Build a Page Layout from a Text Brief",
        slug: "workflow-build-layout",
        description:
          "Convert a textual description into a responsive React + Tailwind page.",
        content:
          "A repeatable workflow for turning product requirements into UI layouts using Copilot.",
        steps: [
          "Create a new page file.",
          "Paste the UI brief as a comment.",
          `Ask Copilot: "Build a responsive layout implementing these sections."`,
          "Refine section structure.",
          "Improve accessibility with Copilot suggestions.",
          "Test on mobile and desktop."
        ],
        tags: ["category:frontend", "react", "layout"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      {
        title: "Implement a Validated Form",
        slug: "workflow-valid-form",
        description:
          "Create a form using React Hook Form + Zod with Copilot assisting validation and submission.",
        content:
          "A workflow to quickly generate a robust form with full validation and submission handling.",
        steps: [
          "Create a new form component.",
          "List fields and requirements in a comment.",
          `Ask Copilot: "Generate React Hook Form setup using Zod validation."`,
          "Add an onSubmit handler.",
          "Ask Copilot to add inline error messages.",
          "Test validation manually.",
          "Add extra schema cases if needed."
        ],
        tags: ["category:frontend", "forms", "zod"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      // 7. BACKEND
      {
        title: "Design & Implement a REST Endpoint",
        slug: "workflow-design-rest-endpoint",
        description:
          "Let Copilot help plan, structure, implement, and test a new REST endpoint.",
        content:
          "A structured backend workflow using Copilot to help with design, validation, and testing.",
        steps: [
          "Write endpoint requirements in a comment.",
          `Ask Copilot: "Propose a REST API design for these requirements."`,
          "Create the handler file.",
          "Add validation with Copilot’s help.",
          `Ask Copilot: "Write integration tests for success and error states."`,
          "Run tests and refine logic.",
          "Add documentation comments."
        ],
        tags: ["category:backend", "rest-api", "validation"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      {
        title: "Wrap an External API in a Typed Client",
        slug: "workflow-typed-api-client",
        description:
          "Use Copilot to build a typed wrapper for an external API with tests.",
        content:
          "A workflow to safely wrap external services into typed, tested client abstractions.",
        steps: [
          "Gather the API docs/OpenAPI spec.",
          "Create a client file.",
          `Ask Copilot: "Generate a TypeScript client for these endpoints."`,
          "Add consistent error handling.",
          "Mock responses and auto-generate tests.",
          "Integrate the new client.",
          "Document each method."
        ],
        tags: ["category:backend", "api-client", "typescript"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      // 8. DATABASE & PRISMA
      {
        title: "Add a New Prisma Entity",
        slug: "workflow-new-prisma-entity",
        description:
          "Use Copilot to define a new Prisma model, migrate, seed, and test it.",
        content:
          "A repeatable database workflow powered by Copilot for schema changes and model scaffolding.",
        steps: [
          "Describe the new entity in a comment.",
          `Ask Copilot: "Generate a Prisma model for this entity."`,
          "Refine fields and relations.",
          "Run prisma migrate.",
          "Generate CRUD functions using Copilot.",
          "Seed example data.",
          "Add at least one integration test."
        ],
        tags: ["category:database", "prisma", "schema"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      {
        title: "Investigate a Slow Database Query",
        slug: "workflow-analyze-slow-query",
        description:
          "Use Copilot to analyze and optimize slow SQL/Prisma queries.",
        content:
          "A structured workflow for diagnosing slow queries using logs, EXPLAIN plans, and Copilot’s analysis.",
        steps: [
          "Capture logs showing the slow behavior.",
          "Paste the Prisma or SQL query.",
          `Ask Copilot: "Explain what this query does and why it might be slow."`,
          "Ask Copilot to propose optimized indexes or query shapes.",
          "Apply proposed improvements.",
          "Paste the EXPLAIN output.",
          `Ask Copilot: "Interpret this EXPLAIN plan."`,
          "Re-run performance tests."
        ],
        tags: ["category:database", "performance", "sql"],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      // 9. CODE REVIEW & QUALITY
      {
        title: "Use Copilot for a First-Pass Code Review",
        slug: "workflow-first-pass-code-review",
        description:
          "A workflow to use Copilot as an automated reviewer before the human review.",
        content:
          "A repeatable workflow where Copilot identifies issues, missing tests, or improvements before opening a PR.",
        steps: [
          "Copy the diff or code changes.",
          `Ask Copilot: "Review this code for bugs, complexity, and missing tests."`,
          "Apply simple improvements (naming, duplication).",
          `Ask Copilot: "Show how you would implement improvements for the complex suggestions."`,
          "Update code.",
          "Re-run tests.",
          "Open the PR with a summary."
        ],
        tags: ["category:code-review", "quality", "pr-review"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId
      },
  
      {
        title: "Enforce Coding Conventions with Copilot",
        slug: "workflow-enforce-coding-conventions",
        description:
          "Codify your style guide and let Copilot enforce it across the codebase.",
        content:
          "A workflow to establish and maintain coding conventions using Copilot for consistency.",
        steps: [
          "Write a concise style guide.",
          "Add a comment at the top of a file linking to it.",
          `Ask Copilot: "Rewrite this file to follow our style guide."`,
          "Fix major issues manually.",
          `Ask Copilot: "Highlight style violations in this diff."`,
          "Turn recurring issues into lint rules.",
          "Update the style guide as conventions evolve."
        ],
        tags: ["category:code-review", "style", "linting"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId
      },

      // MODERNIZATION & MIGRATION WORKFLOWS
      {
        title: "Upgrade Node.js 12 to 18 Safely",
        slug: "upgrade-node-12-to-18",
        description:
          "A safe, step-by-step Node version upgrade workflow for production services.",
        tags: ["category:modernization", "node", "runtime", "upgrade"],
        difficulty: Difficulty.ADVANCED,
        steps: [
          "Audit current Node APIs used (fs, crypto, http, timers, etc.) and list potentially deprecated patterns.",
          "Update the engines field in package.json to require Node 18.",
          "Run the codebase under Node 18 locally and capture any runtime warnings or errors.",
          "Replace deprecated or legacy fs and crypto APIs with their modern equivalents.",
          "Run dependency checks to ensure core libraries support Node 18.",
          "Update CI pipelines and Docker base images to use Node 18.",
          "Run full test suite plus smoke tests against staging environment.",
          "Roll out to production with a monitored canary deployment.",
        ],
        content: `Use this workflow when upgrading a service from Node 12 to 18. Follow each step, verifying behavior with tests and canary deploys before rolling out globally.`,
        status: ContentStatus.APPROVED,
        authorId
      },

      {
        title: "Migrate REST API to GraphQL",
        slug: "rest-to-graphql",
        description:
          "Gradually transition an existing REST API surface to GraphQL without breaking clients.",
        tags: [
          "category:modernization",
          "graphql",
          "api",
          "migration",
          "backend",
        ],
        difficulty: Difficulty.ADVANCED,
        steps: [
          "Inventory the main REST endpoints and group them by resource.",
          "Design an initial GraphQL schema that covers the most-used endpoints.",
          "Implement resolvers that internally call the existing REST handlers.",
          "Introduce batching and dataloaders to avoid N+1 calls.",
          "Deploy GraphQL in parallel with existing REST endpoints.",
          "Document the migration path for clients and add deprecation headers on REST.",
          "Gradually move clients to GraphQL, monitoring performance and errors.",
          "Remove unused REST endpoints once clients are fully migrated.",
        ],
        content: `This workflow is intended for teams that want to introduce GraphQL while preserving REST compatibility during the transition.`,
        status: ContentStatus.APPROVED,
        authorId
      },

      {
        title: "Convert Entire JavaScript Codebase to TypeScript",
        slug: "migrate-js-to-ts",
        description:
          "Incrementally migrate a JavaScript repo to TypeScript with strict type checking.",
        tags: [
          "category:modernization",
          "typescript",
          "javascript",
          "migration",
        ],
        difficulty: Difficulty.ADVANCED,
        steps: [
          "Add TypeScript tooling and create a strict tsconfig.json.",
          "Enable allowJs and incremental migration in the config.",
          "Rename entry points and shared modules to .ts/.tsx one slice at a time.",
          "Fix the most critical implicit any/type errors in shared utilities.",
          "Introduce interfaces and types for core domain models.",
          "Gradually tighten compiler options (noImplicitAny, strictNullChecks).",
          "Add type-checking to CI as a required step.",
          "Remove allowJs once all critical files are migrated.",
        ],
        content: `Use this plan when a JS codebase needs stronger correctness guarantees and IDE support via TypeScript.`,
        status: ContentStatus.APPROVED,
        authorId
      },

      {
        title: "Upgrade React 17 to React 18",
        slug: "react-17-to-18",
        description:
          "Migrate a React application to v18 with the new root API and concurrency behavior.",
        tags: ["category:modernization", "react", "frontend", "upgrade"],
        difficulty: Difficulty.INTERMEDIATE,
        steps: [
          "Update react and react-dom to version 18 in package.json.",
          "Replace ReactDOM.render with createRoot in your entry file.",
          "Audit StrictMode behavior and resolve double-render side effects.",
          "Update Suspense boundaries and lazy-loaded components where needed.",
          "Test hydration for server-rendered routes and fix mismatches.",
          "Enable optional concurrent features on non-critical screens and measure impact.",
          "Run visual regression tests to ensure no unexpected UI changes.",
        ],
        content: `This workflow ensures you adopt React 18 safely, handling the new rendering semantics and strict mode quirks.`,
        status: ContentStatus.APPROVED,
        authorId
      },

      {
        title: "Migrate Next.js Pages Router to App Router",
        slug: "nextjs-pages-to-app-router",
        description:
          "Systematically migrate a Next.js application from the pages router to the app router.",
        tags: ["category:modernization", "nextjs", "react", "migration"],
        difficulty: Difficulty.ADVANCED,
        steps: [
          "Enable the app directory and create the initial app/layout.tsx and app/page.tsx.",
          "Identify top-level routes in pages/ and recreate them under app/ as segments.",
          "Convert getServerSideProps/getStaticProps into server components or route handlers.",
          "Move shared layout components and providers into app/layout.tsx and nested layouts.",
          "Define metadata using the new metadata API instead of next/head.",
          "Implement loading and error UI using loading.tsx and error.tsx files.",
          "Gradually deprecate pages/ routes once app/ equivalents are stable.",
        ],
        content: `Use this migration when upgrading a Next.js project to leverage the App Router, server components, and new routing primitives.`,
        status: ContentStatus.APPROVED,
        authorId
      },

      {
        title: "Full SQL to ORM Migration (Prisma/TypeORM)",
        slug: "sql-to-orm-migration",
        description:
          "Transform raw SQL queries across a codebase into ORM equivalents.",
        tags: ["category:modernization", "sql", "orm", "prisma", "migration"],
        difficulty: Difficulty.ADVANCED,
        steps: [
          "Search the codebase for direct SQL usage (query builders, driver calls).",
          "Define ORM models/entities that match the existing database schema.",
          "Replace read-only SELECT queries with ORM find/findMany equivalents.",
          "Refactor INSERT/UPDATE/DELETE operations to ORM create/update/delete.",
          "Introduce transactions for multi-step operations that must be atomic.",
          "Add integration tests verifying behavior for critical data flows.",
          "Remove obsolete SQL helper utilities once all usages are migrated.",
        ],
        content: `This playbook is ideal when gradually migrating from manual SQL to a type-safe ORM such as Prisma or TypeORM.`,
        status: ContentStatus.APPROVED,
        authorId
      },

      {
        title: "React Class to Hooks Transformation (Codebase-wide)",
        slug: "react-class-hooks-migration",
        description:
          "Incrementally modernize an entire React codebase from class components to hooks.",
        tags: ["category:modernization", "react", "hooks", "refactor"],
        difficulty: Difficulty.INTERMEDIATE,
        steps: [
          "Inventory all class components and categorize by complexity.",
          "Start with leaf components that have simple lifecycle logic.",
          "Convert lifecycle methods (componentDidMount, etc.) to useEffect hooks.",
          "Replace this.state and this.setState with useState or useReducer.",
          "Extract repeated lifecycle patterns into custom hooks.",
          "Run component-level tests or snapshots to verify behavior.",
          "Convert container components last, after shared hooks are stable.",
        ],
        content: `Use this workflow when you want to adopt hooks across a mature React codebase while reducing risk.`,
        status: ContentStatus.APPROVED,
        authorId
      },

      {
        title: "Global CSS to Tailwind Migration",
        slug: "css-to-tailwind-workflow",
        description:
          "Convert a large CSS codebase into a utility-first Tailwind design system.",
        tags: ["category:modernization", "css", "tailwind", "design-system"],
        difficulty: Difficulty.INTERMEDIATE,
        steps: [
          "Set up Tailwind with a config that encodes your color, spacing, and typography tokens.",
          "Audit existing CSS for common layout and spacing patterns.",
          "Replace global layout utilities (containers, grids, flex helpers) with Tailwind classes.",
          "Migrate component-specific styles into JSX using Tailwind utilities.",
          "Use @apply sparingly for complex reusable patterns.",
          "Enable and tune content-based purging to remove unused CSS.",
          "Document Tailwind patterns in a small internal style guide.",
        ],
        content: `This workflow is designed for teams moving from ad-hoc CSS to a consistent Tailwind-driven design system.`,
        status: ContentStatus.APPROVED,
        authorId
      },

      {
        title: "Database ORM Migration (e.g. Hibernate to JPA, TypeORM to Prisma)",
        slug: "orm-to-orm-migration",
        description: "Safely migrate from one ORM to another in production.",
        tags: ["category:modernization", "database", "orm", "migration"],
        difficulty: Difficulty.ADVANCED,
        steps: [
          "Identify ORM-specific annotations/decorators and configuration.",
          "Create equivalent models/entities in the new ORM, mapping relations and indexes.",
          "Introduce the new ORM in parallel, behind a feature flag or abstraction layer.",
          "Port the most critical read/write paths to use the new ORM.",
          "Run extensive integration tests, focusing on transactions and cascading behavior.",
          "Gradually switch the default code paths to the new ORM.",
          "Remove old ORM dependencies and configuration once fully migrated.",
        ],
        content: `Use this playbook when modernizing your persistence layer without rewriting the whole application at once.`,
        status: ContentStatus.APPROVED,
        authorId
      },

      {
        title: "Migrate Deployment Scripts to Terraform",
        slug: "bash-to-terraform",
        description:
          "Convert ad-hoc shell scripts into structured Terraform infrastructure-as-code.",
        tags: ["category:modernization", "terraform", "iac", "devops"],
        difficulty: Difficulty.ADVANCED,
        steps: [
          "Collect all existing deployment bash scripts and identify which cloud resources they create.",
          "Define Terraform providers and remote state configuration.",
          "Model each resource (VMs, databases, buckets, etc.) as Terraform resources/modules.",
          "Parameterize configuration via variables instead of hard-coded values.",
          "Create Terraform plans and compare them with current infrastructure.",
          "Run apply in a non-production environment and verify behavior.",
          "Gradually replace bash-based deployments with Terraform workflows in CI/CD.",
        ],
        content: `This workflow helps teams standardize infrastructure management by migrating to Terraform-based IaC.`,
        status: ContentStatus.APPROVED,
        authorId
      }
    ];
  }
  

  console.log('✅ Created', workflows.length, 'example workflows');

  // Create example tools
//   const tools = [
//     {
//       title: 'Prisma Studio',
//       name: 'Prisma Studio',
//       slug: 'prisma-studio',
//       description: 'Visual database browser for Prisma',
//       shortDescription: 'Visual database browser for exploring and editing your data',
//       content: `Prisma Studio is a visual editor for your database. Launch with \`npx prisma studio\` to:
// - View and edit database records
// - Filter and search data
// - Understand relationships
// - Test queries visually`,
//       url: 'https://www.prisma.io/studio',
//       websiteUrl: 'https://www.prisma.io/studio',
//       logo: '/logos/prisma.svg',
//       tags: ['database', 'prisma', 'tools', 'dev'],
//       difficulty: Difficulty.BEGINNER,
//       status: ContentStatus.APPROVED,
//       authorId: demoUser.id,
//       authorName: demoUser.name,
//     },
//     {
//       title: 'GitHub Copilot',
//       name: 'GitHub Copilot',
//       slug: 'github-copilot',
//       description: 'AI pair programmer that helps you write code faster',
//       shortDescription: 'AI-powered code completion that suggests entire lines and blocks of code',
//       content: `GitHub Copilot is an AI-powered code completion tool that suggests entire lines or blocks of code as you type. Works with VS Code, JetBrains IDEs, Neovim, and more.

// Best practices:
// - Write clear comments to guide suggestions
// - Review suggestions before accepting
// - Use it for boilerplate and repetitive code
// - Combine with your expertise and judgment`,
//       url: 'https://github.com/features/copilot',
//       websiteUrl: 'https://github.com/features/copilot',
//       logo: '/logos/github-copilot.svg',
//       tags: ['ai', 'productivity', 'vscode', 'coding'],
//       difficulty: Difficulty.BEGINNER,
//       status: ContentStatus.APPROVED,
//       authorId: demoUser.id,
//       authorName: demoUser.name,
//       featured: true,
//     },
//     {
//       title: 'VS Code',
//       name: 'Visual Studio Code',
//       slug: 'vscode',
//       description: 'Powerful, lightweight code editor from Microsoft',
//       shortDescription: 'Free, open-source code editor with IntelliSense and debugging',
//       content: `Visual Studio Code is a lightweight but powerful source code editor. Features include:
// - IntelliSense code completion
// - Built-in Git integration
// - Debugging support
// - Extensible marketplace
// - Integrated terminal`,
//       url: 'https://code.visualstudio.com',
//       websiteUrl: 'https://code.visualstudio.com',
//       logo: '/logos/vscode.svg',
//       tags: ['editor', 'ide', 'microsoft', 'development'],
//       difficulty: Difficulty.BEGINNER,
//       status: ContentStatus.APPROVED,
//       authorId: demoUser.id,
//       authorName: demoUser.name,
//     },
//     {
//       title: 'Cursor',
//       name: 'Cursor',
//       slug: 'cursor-ide',
//       description: 'AI-first code editor built for pair programming with AI',
//       shortDescription: 'The AI-first code editor designed for pair programming with AI',
//       content: `Cursor is a code editor built from the ground up for AI pair programming. Features:
// - Chat with your codebase
// - AI-powered edits
// - Generate code from prompts
// - Built on VS Code foundation
// - Natural language commands`,
//       url: 'https://cursor.sh',
//       websiteUrl: 'https://cursor.sh',
//       logo: '/logos/cursor.svg',
//       tags: ['ai', 'editor', 'ide', 'copilot'],
//       difficulty: Difficulty.INTERMEDIATE,
//       status: ContentStatus.APPROVED,
//       authorId: demoUser.id,
//       authorName: demoUser.name,
//     },
//   ];

const tools = getToolsSeed(demoUser.id);

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {},
      create: tool,
    });
  }

  function getToolsSeed(authorId: string) {
    return [
      // === EDITOR TOOLS ===
      {
        title: "Cursor",
        slug: "cursor",
        name: "Cursor",
        description:
          "Cursor is an AI-first code editor that brings copilots directly into your editing flow with inline completions, chat, and refactor tools tuned for real-world development.",
        shortDescription:
          "AI-first code editor designed for pair programming with AI.",
        content:
          "Cursor combines a familiar VS Code–style editing experience with deeply integrated AI features: inline completions, repo-aware chat, automated refactors, and context search. It’s especially strong for iterative feature work and refactoring.",
        url: "https://cursor.sh",
        websiteUrl: "https://cursor.sh",
        logo: "/logos/cursor.svg",
        tags: ["category:editor", "editor", "ai", "copilot", "productivity"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: true,
      },
      {
        title: "Visual Studio Code",
        slug: "visual-studio-code",
        name: "Visual Studio Code",
        description:
          "Visual Studio Code is a free, extensible code editor with an enormous ecosystem of extensions, themes, and language servers.",
        shortDescription:
          "Free, extensible editor with a huge ecosystem and AI integrations.",
        content:
          "VS Code is the de-facto editor for many Copilot users. Extensions like GitHub Copilot, GitLens, Docker, and Dev Containers make it a full development environment with integrated terminal, debugger, and source control.",
        url: "https://code.visualstudio.com",
        websiteUrl: "https://code.visualstudio.com",
        logo: "/logos/vscode.svg",
        tags: ["category:editor", "editor", "microsoft", "extensions"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: true,
      },
      {
        title: "JetBrains IntelliJ IDEA",
        slug: "intellij-idea",
        name: "IntelliJ IDEA",
        description:
          "IntelliJ IDEA is a powerful IDE for JVM and polyglot development with deep static analysis and refactoring tools.",
        shortDescription:
          "Full-featured IDE for Java, Kotlin, and JVM stacks with Copilot support.",
        content:
          "IntelliJ IDEA offers smart completion, inspections, and refactors out of the box. With the GitHub Copilot plugin it becomes a strong AI-assisted environment for backend and enterprise development.",
        url: "https://www.jetbrains.com/idea/",
        websiteUrl: "https://www.jetbrains.com/idea/",
        logo: "/logos/intellij.svg",
        tags: ["category:editor", "editor", "jetbrains", "java", "kotlin"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "WebStorm",
        slug: "webstorm",
        name: "WebStorm",
        description:
          "WebStorm is JetBrains’ IDE for JavaScript, TypeScript, and frontend frameworks with strong refactoring and debugging.",
        shortDescription:
          "JetBrains IDE for JS/TS and frontend with Copilot integration.",
        content:
          "WebStorm shines for React, Vue, Node, and full-stack JS apps. Combined with GitHub Copilot it makes an excellent environment for building complex SPAs and Node backends.",
        url: "https://www.jetbrains.com/webstorm/",
        websiteUrl: "https://www.jetbrains.com/webstorm/",
        logo: "/logos/webstorm.svg",
        tags: ["category:editor", "editor", "jetbrains", "javascript", "typescript"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "PyCharm",
        slug: "pycharm",
        name: "PyCharm",
        description:
          "PyCharm is a dedicated Python IDE with powerful debugging, refactoring, and data-science tooling.",
        shortDescription:
          "Python IDE with deep Django and data-science support.",
        content:
          "PyCharm includes powerful refactors, test runners, Jupyter support, and integrations for Django and FastAPI. With Copilot, it becomes a very productive environment for Python projects.",
        url: "https://www.jetbrains.com/pycharm/",
        websiteUrl: "https://www.jetbrains.com/pycharm/",
        logo: "/logos/pycharm.svg",
        tags: ["category:editor", "editor", "python", "jetbrains"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Neovim",
        slug: "neovim",
        name: "Neovim",
        description:
          "Neovim is a modern Vim-compatible editor with Lua scripting and strong plugin ecosystem.",
        shortDescription:
          "Terminal-first editor with powerful AI and LSP plugin setups.",
        content:
          "Neovim is a popular choice for highly customized, keyboard-driven workflows. With plugins like nvim-cmp and LSP, plus Copilot/Codeium integrations, it becomes a minimal but very efficient AI-assisted editor.",
        url: "https://neovim.io",
        websiteUrl: "https://neovim.io",
        logo: "/logos/neovim.svg",
        tags: ["category:editor", "editor", "terminal", "vim"],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Fleet",
        slug: "jetbrains-fleet",
        name: "JetBrains Fleet",
        description:
          "Fleet is JetBrains’ next-generation lightweight editor with smart features and remote development.",
        shortDescription:
          "Lightweight smart editor from JetBrains with remote dev.",
        content:
          "Fleet aims to combine the speed of a lightweight editor with the smarts of JetBrains IDEs. It’s well-suited to pair with AI tools and cloud dev environments.",
        url: "https://www.jetbrains.com/fleet/",
        websiteUrl: "https://www.jetbrains.com/fleet/",
        logo: "/logos/fleet.svg",
        tags: ["category:editor", "editor", "jetbrains", "remote-dev"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
  
      // === AI TOOLS ===
      {
        title: "GitHub Copilot",
        slug: "github-copilot",
        name: "GitHub Copilot",
        description:
          "GitHub Copilot is an AI pair programmer that suggests whole lines or blocks of code based on your context and comments.",
        shortDescription:
          "AI pair programmer that helps you write code faster.",
        content:
          "Copilot uses AI models trained on public code to suggest completions, tests, and refactors in your editor. It works best when you give it clear intent with comments, meaningful names, and small focused functions.",
        url: "https://github.com/features/copilot",
        websiteUrl: "https://github.com/features/copilot",
        logo: "/logos/github-copilot.svg",
        tags: ["category:ai", "ai", "copilot", "productivity", "vscode"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: true,
      },
      {
        title: "GitHub Copilot Chat",
        slug: "github-copilot-chat",
        name: "GitHub Copilot Chat",
        description:
          "Copilot Chat adds an AI assistant inside your editor for explaining code, fixing errors, and generating changes.",
        shortDescription:
          "Context-aware AI chat inside your editor.",
        content:
          "Copilot Chat lets you talk to an AI assistant that can see your open files and workspace. It’s ideal for debugging, refactoring, and exploring a new codebase without leaving the editor.",
        url: "https://github.com/features/copilot",
        websiteUrl: "https://github.com/features/copilot",
        logo: "/logos/github-copilot.svg",
        tags: ["category:ai", "ai", "chat", "assistant", "copilot"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Sourcegraph Cody",
        slug: "sourcegraph-cody",
        name: "Cody",
        description:
          "Cody is an AI coding assistant from Sourcegraph that understands your entire code graph for search and changes.",
        shortDescription:
          "Repo-aware AI assistant with deep code search.",
        content:
          "Cody combines semantic code search with AI chat and edit commands. It can answer questions across huge monorepos, generate migrations, and propose multi-file edits with strong context.",
        url: "https://about.sourcegraph.com/cody",
        websiteUrl: "https://about.sourcegraph.com/cody",
        logo: "/logos/cody.svg",
        tags: ["category:ai", "ai", "search", "assistant", "sourcegraph"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: true,
      },
      {
        title: "Codeium",
        slug: "codeium",
        name: "Codeium",
        description:
          "Codeium is an AI code completion and chat tool that supports many editors and languages with a generous free tier.",
        shortDescription:
          "AI completions and chat with multi-editor support.",
        content:
          "Codeium offers code completion, chat, and refactors across VS Code, JetBrains, Vim, and more. It’s a good Copilot alternative or supplement, especially if you want multi-IDE coverage.",
        url: "https://codeium.com",
        websiteUrl: "https://codeium.com",
        logo: "/logos/codeium.svg",
        tags: ["category:ai", "ai", "completion", "chat"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Tabnine",
        slug: "tabnine",
        name: "Tabnine",
        description:
          "Tabnine provides AI code completions with a focus on team-tunable models and privacy options.",
        shortDescription:
          "AI code completion with team-focused training options.",
        content:
          "Tabnine integrates with many IDEs and can be configured with on-prem or team-specific models, making it appealing to organizations with strict data requirements.",
        url: "https://www.tabnine.com",
        websiteUrl: "https://www.tabnine.com",
        logo: "/logos/tabnine.svg",
        tags: ["category:ai", "ai", "completion", "privacy"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Amazon CodeWhisperer",
        slug: "amazon-codewhisperer",
        name: "Amazon CodeWhisperer",
        description:
          "CodeWhisperer is Amazon’s AI coding companion with built-in security scanning and AWS awareness.",
        shortDescription:
          "AI coding assistant optimized for AWS stacks.",
        content:
          "CodeWhisperer integrates into IDEs and is particularly useful on AWS-heavy projects, offering context-aware suggestions and optional security scanning for vulnerabilities.",
        url: "https://aws.amazon.com/codewhisperer/",
        websiteUrl: "https://aws.amazon.com/codewhisperer/",
        logo: "/logos/codewhisperer.svg",
        tags: ["category:ai", "ai", "aws", "completion"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Continue.dev",
        slug: "continue-dev",
        name: "Continue",
        description:
          "Continue is an open-source VS Code and JetBrains extension that adds local or remote AI chat and completions.",
        shortDescription:
          "Open-source AI assistant you can self-host or point at any model.",
        content:
          "Continue.dev lets you connect your editor to local or hosted LLMs with flexible configuration. Great for teams experimenting with custom models or on-prem deployments.",
        url: "https://www.continue.dev",
        websiteUrl: "https://www.continue.dev",
        logo: "/logos/continue.svg",
        tags: ["category:ai", "ai", "open-source", "editor"],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
  
      // === CLI TOOLS ===
      {
        title: "Warp Terminal",
        slug: "warp-terminal",
        name: "Warp",
        description:
          "Warp is a modern, GPU-accelerated terminal with command blocks, search, and optional AI suggestions.",
        shortDescription:
          "Modern terminal with command blocks and AI assistance.",
        content:
          "Warp improves the terminal with rich command blocks, search, and built-in AI commands. It’s ideal for Copilot users who also want help in their shell workflows.",
        url: "https://www.warp.dev",
        websiteUrl: "https://www.warp.dev",
        logo: "/logos/warp.svg",
        tags: ["category:cli", "cli", "terminal", "ai"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "GitHub CLI",
        slug: "github-cli",
        name: "GitHub CLI",
        description:
          "GitHub CLI brings GitHub workflows—PRs, issues, releases, workflows—into your terminal.",
        shortDescription:
          "Manage PRs, issues, and workflows from the terminal.",
        content:
          "Use the `gh` CLI to create and review pull requests, manage issues, run workflows, and inspect logs, all from scripts or the terminal. It pairs well with Copilot-assisted Git workflows.",
        url: "https://cli.github.com",
        websiteUrl: "https://cli.github.com",
        logo: "/logos/gh-cli.svg",
        tags: ["category:cli", "cli", "github", "git", "automation"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "lazygit",
        slug: "lazygit",
        name: "lazygit",
        description:
          "lazygit is a simple terminal UI for Git that makes staging, committing, and resolving conflicts fast.",
        shortDescription:
          "TUI for Git that speeds up branching, staging, and fixes.",
        content:
          "lazygit gives you an ncurses-style interface for managing branches, commits, and conflicts. It’s perfect for developers who live in the terminal and want a faster Git workflow alongside Copilot.",
        url: "https://github.com/jesseduffield/lazygit",
        websiteUrl: "https://github.com/jesseduffield/lazygit",
        logo: "/logos/lazygit.svg",
        tags: ["category:cli", "cli", "git", "productivity"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "ripgrep",
        slug: "ripgrep",
        name: "ripgrep",
        description:
          "ripgrep is a line-oriented search tool that recursively searches directories using regex.",
        shortDescription:
          "Lightning-fast code search from the command line.",
        content:
          "ripgrep (`rg`) is a widely used CLI for searching codebases. Many Copilot users pair it with editor search and AI chat to quickly locate code to refactor or explain.",
        url: "https://github.com/BurntSushi/ripgrep",
        websiteUrl: "https://github.com/BurntSushi/ripgrep",
        logo: "/logos/ripgrep.svg",
        tags: ["category:cli", "cli", "search", "codebase"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "HTTPie CLI",
        slug: "httpie-cli",
        name: "HTTPie",
        description:
          "HTTPie is a user-friendly HTTP client for the command line, ideal for testing APIs.",
        shortDescription:
          "Human-friendly HTTP client for testing APIs from the terminal.",
        content:
          "HTTPie lets you craft and replay HTTP requests with simple syntax, JSON formatting, and colorized output. Great for quickly testing endpoints that Copilot helped you build.",
        url: "https://httpie.io",
        websiteUrl: "https://httpie.io",
        logo: "/logos/httpie.svg",
        tags: ["category:cli", "cli", "api", "http"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
  
      // === PRODUCTIVITY / PROJECT ===
      {
        title: "Raycast",
        slug: "raycast",
        name: "Raycast",
        description:
          "Raycast is a fast Mac launcher with extensions, scripts, and built-in AI for developers.",
        shortDescription:
          "Mac launcher with dev extensions and AI commands.",
        content:
          "Raycast gives you a Spotlight-style command palette with rich extensions for GitHub, Jira, VS Code, and custom scripts. Many developers use it alongside Copilot to speed up local workflows.",
        url: "https://www.raycast.com",
        websiteUrl: "https://www.raycast.com",
        logo: "/logos/raycast.svg",
        tags: ["category:productivity", "launcher", "macos", "ai"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Linear",
        slug: "linear",
        name: "Linear",
        description:
          "Linear is a fast issue-tracking and project-management tool popular with engineering teams.",
        shortDescription:
          "Opinionated issue tracker with keyboard-first UX.",
        content:
          "Linear helps teams manage issues, sprints, and roadmaps with a clean interface and strong keyboard support. It pairs nicely with Copilot-driven coding workflows by keeping planning friction low.",
        url: "https://linear.app",
        websiteUrl: "https://linear.app",
        logo: "/logos/linear.svg",
        tags: ["category:productivity", "issues", "planning", "sprints"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Jira Software",
        slug: "jira-software",
        name: "Jira",
        description:
          "Jira Software is Atlassian’s project-management platform for agile teams.",
        shortDescription:
          "Enterprise issue tracking and agile boards.",
        content:
          "Jira is widely used for managing large backlogs, sprints, and releases. Copilot integrates with the code side while Jira keeps the planning side structured.",
        url: "https://www.atlassian.com/software/jira",
        websiteUrl: "https://www.atlassian.com/software/jira",
        logo: "/logos/jira.svg",
        tags: ["category:productivity", "issues", "enterprise"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Slack",
        slug: "slack",
        name: "Slack",
        description:
          "Slack is a messaging platform for teams with channels, threads, and integrations.",
        shortDescription:
          "Team chat with rich integrations and bots.",
        content:
          "Slack is where many engineering teams discuss features, review logs, and share Copilot suggestions. Integrations with GitHub, CI, and incident tools make it central to dev workflows.",
        url: "https://slack.com",
        websiteUrl: "https://slack.com",
        logo: "/logos/slack.svg",
        tags: ["category:productivity", "chat", "team", "integrations"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Discord",
        slug: "discord",
        name: "Discord",
        description:
          "Discord is a community and team voice/chat platform heavily used by open-source and dev communities.",
        shortDescription:
          "Voice and text chat used by many dev communities.",
        content:
          "Discord servers are where many AI and Copilot-related communities live. It’s useful for getting help, sharing prompts, and collaborating on side projects.",
        url: "https://discord.com",
        websiteUrl: "https://discord.com",
        logo: "/logos/discord.svg",
        tags: ["category:productivity", "community", "chat"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Loom",
        slug: "loom",
        name: "Loom",
        description:
          "Loom lets you record quick screen-share videos with voiceover and share them instantly.",
        shortDescription:
          "Record quick walkthroughs for code reviews and demos.",
        content:
          "Loom is great for async code walkthroughs, bug reproductions, and feature demos. You can show how Copilot helped you implement something and share context with your team.",
        url: "https://www.loom.com",
        websiteUrl: "https://www.loom.com",
        logo: "/logos/loom.svg",
        tags: ["category:productivity", "video", "async"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Notion",
        slug: "notion",
        name: "Notion",
        description:
          "Notion is a workspace for notes, docs, tasks, and databases with optional AI features.",
        shortDescription:
          "Docs and project notes with AI summarization.",
        content:
          "Teams use Notion for specs, onboarding docs, and runbooks. Notion AI can summarize tickets or generate outlines that you later implement with Copilot in code.",
        url: "https://www.notion.so",
        websiteUrl: "https://www.notion.so",
        logo: "/logos/notion.svg",
        tags: ["category:productivity", "docs", "knowledge-base", "ai"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
  
      // === DATABASE TOOLS ===
      {
        title: "Prisma Studio",
        slug: "prisma-studio",
        name: "Prisma Studio",
        description:
          "Prisma Studio is a visual database browser for Prisma projects.",
        shortDescription:
          "Visual database browser for Prisma models.",
        content:
          "Prisma Studio lets you inspect and edit your database through the Prisma schema. It’s ideal for debugging data issues while building queries and models with Copilot.",
        url: "https://www.prisma.io/studio",
        websiteUrl: "https://www.prisma.io/studio",
        logo: "/logos/prisma.svg",
        tags: ["category:databases", "database", "prisma"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Supabase",
        slug: "supabase",
        name: "Supabase",
        description:
          "Supabase is an open source backend-as-a-service built on Postgres with auth, storage, and edge functions.",
        shortDescription:
          "Postgres-backed backend-as-a-service with auth and storage.",
        content:
          "Supabase gives you a Postgres database, auth, storage, and serverless functions. It’s a great playground for apps that you scaffold quickly with Copilot.",
        url: "https://supabase.com",
        websiteUrl: "https://supabase.com",
        logo: "/logos/supabase.svg",
        tags: ["category:databases", "database", "backend"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "TablePlus",
        slug: "tableplus",
        name: "TablePlus",
        description:
          "TablePlus is a modern GUI client for relational databases such as Postgres, MySQL, and SQLite.",
        shortDescription:
          "Native database client for Postgres, MySQL, and more.",
        content:
          "TablePlus offers a clean UI for editing schemas and data across many databases. Developers pair it with Copilot-generated SQL to quickly inspect results.",
        url: "https://tableplus.com",
        websiteUrl: "https://tableplus.com",
        logo: "/logos/tableplus.svg",
        tags: ["category:databases", "database", "gui"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "DBeaver",
        slug: "dbeaver",
        name: "DBeaver",
        description:
          "DBeaver is a universal database client that supports many SQL and NoSQL databases.",
        shortDescription:
          "Cross-platform database client with advanced features.",
        content:
          "DBeaver supports many relational and NoSQL databases. It’s useful when you work across mixed data stacks and want a single GUI to validate Copilot-generated queries.",
        url: "https://dbeaver.io",
        websiteUrl: "https://dbeaver.io",
        logo: "/logos/dbeaver.svg",
        tags: ["category:databases", "database", "multi-db"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "DataGrip",
        slug: "datagrip",
        name: "DataGrip",
        description:
          "DataGrip is JetBrains’ database IDE with smart completion, refactoring, and schema navigation.",
        shortDescription:
          "Database IDE from JetBrains with smart SQL tooling.",
        content:
          "DataGrip’s inspections and refactors help maintain complex schemas. You can combine Copilot-generated SQL with DataGrip’s analysis to keep queries correct and efficient.",
        url: "https://www.jetbrains.com/datagrip/",
        websiteUrl: "https://www.jetbrains.com/datagrip/",
        logo: "/logos/datagrip.svg",
        tags: ["category:databases", "database", "jetbrains", "sql"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
  
      // === BROWSER / API TOOLS ===
      {
        title: "Postman",
        slug: "postman",
        name: "Postman",
        description:
          "Postman is an API platform for exploring, testing, and documenting REST and GraphQL APIs.",
        shortDescription:
          "Explore, test, and document APIs with collections.",
        content:
          "Postman is widely used for manual API testing and automated collections. It pairs well with Copilot-generated endpoints and client code.",
        url: "https://www.postman.com",
        websiteUrl: "https://www.postman.com",
        logo: "/logos/postman.svg",
        tags: ["category:browser-tools", "api", "testing", "rest"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Insomnia",
        slug: "insomnia",
        name: "Insomnia",
        description:
          "Insomnia is an open-source API client for REST, GraphQL, and gRPC with workspace syncing.",
        shortDescription:
          "API client for REST, GraphQL, and gRPC.",
        content:
          "Insomnia focuses on a clean UI, environment management, and multi-protocol support. Many developers prefer it for testing APIs they build with Copilot’s help.",
        url: "https://insomnia.rest",
        websiteUrl: "https://insomnia.rest",
        logo: "/logos/insomnia.svg",
        tags: ["category:browser-tools", "api", "testing", "graphql"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Hoppscotch",
        slug: "hoppscotch",
        name: "Hoppscotch",
        description:
          "Hoppscotch is a fast, open-source API request builder running in the browser.",
        shortDescription:
          "Lightweight, open-source API tester in the browser.",
        content:
          "Hoppscotch is great for quickly testing endpoints without leaving your browser. It supports REST, GraphQL, and WebSocket testing.",
        url: "https://hoppscotch.io",
        websiteUrl: "https://hoppscotch.io",
        logo: "/logos/hoppscotch.svg",
        tags: ["category:browser-tools", "api", "open-source"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "React DevTools",
        slug: "react-devtools",
        name: "React DevTools",
        description:
          "React DevTools is a browser extension for inspecting React component trees and state.",
        shortDescription:
          "Inspect React component hierarchies and props.",
        content:
          "React DevTools helps debug React apps by showing component trees, props, and hooks. Use it with Copilot to understand generated components and optimize renders.",
        url: "https://react.dev/learn/react-developer-tools",
        websiteUrl: "https://react.dev/learn/react-developer-tools",
        logo: "/logos/react-devtools.svg",
        tags: ["category:browser-tools", "react", "debugging", "frontend"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Redux DevTools",
        slug: "redux-devtools",
        name: "Redux DevTools",
        description:
          "Redux DevTools is a set of tools to inspect Redux state, actions, and time-travel debugging.",
        shortDescription:
          "Time-travel debugger for Redux applications.",
        content:
          "Redux DevTools lets you inspect and replay actions, making it easier to debug complex state flows that AI-generated code interacts with.",
        url: "https://github.com/reduxjs/redux-devtools",
        websiteUrl: "https://github.com/reduxjs/redux-devtools",
        logo: "/logos/redux-devtools.svg",
        tags: ["category:browser-tools", "redux", "state", "debugging"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
  
      // === CLOUD DEV ENV TOOLS ===
      {
        title: "GitHub Codespaces",
        slug: "github-codespaces",
        name: "GitHub Codespaces",
        description:
          "GitHub Codespaces provides cloud-hosted dev environments with VS Code and Copilot built in.",
        shortDescription:
          "Cloud dev environments that run your repo in minutes.",
        content:
          "Codespaces lets you spin up a pre-configured dev environment in the cloud. It’s ideal for onboarding, experiments, and ensuring Copilot sees a consistent environment across machines.",
        url: "https://github.com/features/codespaces",
        websiteUrl: "https://github.com/features/codespaces",
        logo: "/logos/codespaces.svg",
        tags: ["category:productivity", "cloud-dev", "github"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: true,
      },
      {
        title: "Gitpod",
        slug: "gitpod",
        name: "Gitpod",
        description:
          "Gitpod is a cloud developer environment platform with automated prebuilds and workspace images.",
        shortDescription:
          "Spin up disposable cloud workspaces from any repo.",
        content:
          "Gitpod automates dev environments so contributors can start coding quickly. Pair it with Copilot inside VS Code or the browser for fully cloud-based development.",
        url: "https://www.gitpod.io",
        websiteUrl: "https://www.gitpod.io",
        logo: "/logos/gitpod.svg",
        tags: ["category:productivity", "cloud-dev", "remote"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "StackBlitz",
        slug: "stackblitz",
        name: "StackBlitz",
        description:
          "StackBlitz runs full-stack JavaScript projects in the browser with instant dev environments.",
        shortDescription:
          "Browser-based dev environment for JS/TS frameworks.",
        content:
          "StackBlitz is great for quick repros, sandboxes, and docs examples. You can prototype ideas Copilot suggests without touching your main repo.",
        url: "https://stackblitz.com",
        websiteUrl: "https://stackblitz.com",
        logo: "/logos/stackblitz.svg",
        tags: ["category:browser-tools", "sandbox", "frontend"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "CodeSandbox",
        slug: "codesandbox",
        name: "CodeSandbox",
        description:
          "CodeSandbox is an online code editor for rapid prototyping of web apps and components.",
        shortDescription:
          "Online sandboxes for quick React and frontend experiments.",
        content:
          "CodeSandbox is useful for sharing minimal repros and design prototypes. Copilot-generated components can be quickly tested here before integrating into your main app.",
        url: "https://codesandbox.io",
        websiteUrl: "https://codesandbox.io",
        logo: "/logos/codesandbox.svg",
        tags: ["category:browser-tools", "sandbox", "react"],
        difficulty: Difficulty.BEGINNER,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
  
      // === OBSERVABILITY / QUALITY ===
      {
        title: "Sentry",
        slug: "sentry",
        name: "Sentry",
        description:
          "Sentry is an error tracking and performance monitoring platform.",
        shortDescription:
          "Monitor and triage errors in production applications.",
        content:
          "Sentry links stack traces, releases, and performance data so you can see how AI-generated code behaves in production and quickly fix regressions.",
        url: "https://sentry.io",
        websiteUrl: "https://sentry.io",
        logo: "/logos/sentry.svg",
        tags: ["category:productivity", "observability", "errors"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Logtail",
        slug: "logtail",
        name: "Logtail",
        description:
          "Logtail is a structured log management tool with SQL-like querying.",
        shortDescription:
          "Query logs with a SQL-like language for debugging.",
        content:
          "Logtail makes it easy to filter logs and find patterns when debugging. Combine log snippets with Copilot Chat to quickly reason about failures.",
        url: "https://betterstack.com/logtail",
        websiteUrl: "https://betterstack.com/logtail",
        logo: "/logos/logtail.svg",
        tags: ["category:productivity", "logging", "observability"],
        difficulty: Difficulty.INTERMEDIATE,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
      {
        title: "Grafana",
        slug: "grafana",
        name: "Grafana",
        description:
          "Grafana is an open-source platform for dashboards and observability.",
        shortDescription:
          "Dashboards for metrics, traces, and logs.",
        content:
          "Grafana dashboards help you visualize metrics and traces. It’s helpful for verifying that performance-sensitive code generated with AI behaves correctly in production.",
        url: "https://grafana.com",
        websiteUrl: "https://grafana.com",
        logo: "/logos/grafana.svg",
        tags: ["category:productivity", "observability", "metrics"],
        difficulty: Difficulty.ADVANCED,
        status: ContentStatus.APPROVED,
        authorId,
        authorName: "CopilotHub Seeder",
        featured: false,
      },
    ];
  }
  

  console.log('✅ Created', tools.length, 'example tools');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
