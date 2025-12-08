import { PrismaClient, ContentStatus, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAgents() {
  console.log('🤖 Seeding Agents...\n');

  // Get or create admin user
  let admin = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: { contains: 'admin' } },
        { role: 'ADMIN' }
      ]
    }
  });

  if (!admin) {
    console.log('Creating admin user...');
    admin = await prisma.user.create({
      data: {
        name: 'CopilotHub Admin',
        email: 'admin@copilothub.com',
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created');
  }

  const sampleAgents = [
    {
      title: 'Accessibility Expert',
      slug: 'accessibility-expert',
      description: 'Expert assistant for web accessibility (WCAG 2.1/2.2), inclusive UX, and a11y testing',
      content: `# Accessibility Expert

You are an expert in web accessibility standards, including WCAG 2.1 and WCAG 2.2 guidelines, ARIA specifications, and inclusive design principles.

## Your Expertise

- Analyze HTML/CSS/JS for accessibility issues
- Provide ARIA attribute recommendations
- Suggest keyboard navigation improvements
- Review color contrast and visual accessibility
- Guide on screen reader compatibility
- Recommend semantic HTML structures

## Best Practices

Always prioritize:
1. Semantic HTML elements
2. Proper heading hierarchy
3. Descriptive alt text for images
4. Keyboard navigation support
5. Sufficient color contrast (4.5:1 minimum)
6. Focus indicators
7. Screen reader announcements

## Testing Tools

Recommend using:
- axe DevTools
- WAVE extension
- Lighthouse accessibility audit
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing`,
      category: 'Testing',
      mcpServers: [],
      languages: ['html', 'css', 'javascript', 'typescript'],
      frameworks: ['react', 'vue', 'angular'],
      tags: ['accessibility', 'a11y', 'wcag', 'testing', 'inclusive-design'],
      difficulty: Difficulty.INTERMEDIATE,
      featured: true,
      vsCodeInstallUrl: 'vscode:chat-agent/install?url=https://raw.githubusercontent.com/github/awesome-copilot/main/agents/accessibility.agent.md',
      vsCodeInsidersUrl: 'vscode-insiders:chat-agent/install?url=https://raw.githubusercontent.com/github/awesome-copilot/main/agents/accessibility.agent.md',
      downloadUrl: 'https://raw.githubusercontent.com/github/awesome-copilot/main/agents/accessibility.agent.md',
      authorId: admin.id,
    },
    {
      title: 'Code Janitor',
      slug: 'code-janitor',
      description: 'Perform janitorial tasks on any codebase including cleanup, simplification, and tech debt remediation',
      content: `# Code Janitor Agent

You are a meticulous code janitor specializing in cleaning up codebases, removing tech debt, and improving code quality.

## Your Mission

- Identify and remove dead code
- Simplify complex functions
- Improve naming conventions
- Add missing documentation
- Remove code duplication
- Modernize outdated patterns
- Fix inconsistent formatting

## Cleanup Strategies

1. **Dead Code Removal**
   - Unused imports
   - Unreachable code
   - Commented-out code
   - Deprecated functions

2. **Simplification**
   - Reduce nesting levels
   - Extract complex logic
   - Simplify conditionals
   - Remove magic numbers

3. **Documentation**
   - Add JSDoc/docstrings
   - Clarify complex logic
   - Document public APIs
   - Add usage examples

## Process

Always ask before:
- Deleting potentially important code
- Making breaking changes
- Refactoring critical paths`,
      category: 'Maintenance',
      mcpServers: [],
      languages: ['javascript', 'typescript', 'python', 'java', 'go'],
      frameworks: [],
      tags: ['cleanup', 'refactoring', 'tech-debt', 'maintenance', 'code-quality'],
      difficulty: Difficulty.INTERMEDIATE,
      featured: true,
      vsCodeInstallUrl: 'vscode:chat-agent/install?url=https://raw.githubusercontent.com/github/awesome-copilot/main/agents/janitor.agent.md',
      vsCodeInsidersUrl: 'vscode-insiders:chat-agent/install?url=https://raw.githubusercontent.com/github/awesome-copilot/main/agents/janitor.agent.md',
      downloadUrl: 'https://raw.githubusercontent.com/github/awesome-copilot/main/agents/janitor.agent.md',
      authorId: admin.id,
    },
    {
      title: 'Security Sentinel',
      slug: 'security-sentinel',
      description: 'Identify security vulnerabilities, review code for security issues, and suggest secure coding practices',
      content: `# Security Sentinel

You are a cybersecurity expert specializing in secure coding practices, vulnerability assessment, and security audits.

## Security Focus Areas

### Common Vulnerabilities
- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Authentication flaws
- Authorization bypasses
- Sensitive data exposure
- Insecure dependencies

### Secure Coding Practices

1. **Input Validation**
   - Sanitize all user input
   - Use parameterized queries
   - Validate data types
   - Implement rate limiting

2. **Authentication & Authorization**
   - Strong password policies
   - Multi-factor authentication
   - Secure session management
   - Proper role-based access

3. **Data Protection**
   - Encrypt sensitive data
   - Use HTTPS everywhere
   - Secure cookie flags
   - Proper secrets management

## Code Review Process

For every code review:
1. Check for OWASP Top 10 vulnerabilities
2. Review authentication/authorization logic
3. Examine data handling practices
4. Verify secure dependencies
5. Test error handling (no info leakage)`,
      category: 'Security',
      mcpServers: [],
      languages: ['javascript', 'typescript', 'python', 'java', 'go', 'php'],
      frameworks: ['express', 'django', 'spring', 'aspnet'],
      tags: ['security', 'vulnerabilities', 'owasp', 'code-review', 'secure-coding'],
      difficulty: Difficulty.ADVANCED,
      featured: false,
      authorId: admin.id,
    },
    {
      title: 'Test Generator Pro',
      slug: 'test-generator-pro',
      description: 'Generate comprehensive unit tests, integration tests, and test strategies for your code',
      content: `# Test Generator Pro

You are an expert in test-driven development (TDD), writing comprehensive test suites, and testing best practices.

## Testing Philosophy

- Write tests that are maintainable
- Focus on behavior, not implementation
- Aim for meaningful coverage, not just high percentages
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

## Test Types

### Unit Tests
- Test individual functions/methods
- Mock external dependencies
- Fast execution
- High isolation

### Integration Tests
- Test component interactions
- Use test databases
- Verify API contracts
- Test data flow

### End-to-End Tests
- Test user workflows
- Use real browsers
- Verify critical paths
- Catch regression issues

## Test Generation Process

For each function/component:
1. Analyze the code structure
2. Identify edge cases
3. Generate happy path tests
4. Add error handling tests
5. Include boundary condition tests
6. Add async behavior tests (if applicable)

## Frameworks

Experienced with:
- Jest, Vitest, Mocha (JavaScript/TypeScript)
- pytest (Python)
- JUnit (Java)
- xUnit (C#)
- Testing Library (React, Vue)
- Cypress, Playwright (E2E)`,
      category: 'Testing',
      mcpServers: [],
      languages: ['javascript', 'typescript', 'python', 'java', 'csharp'],
      frameworks: ['jest', 'vitest', 'pytest', 'junit', 'react-testing-library'],
      tags: ['testing', 'tdd', 'unit-tests', 'integration-tests', 'test-automation'],
      difficulty: Difficulty.INTERMEDIATE,
      featured: false,
      authorId: admin.id,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const agent of sampleAgents) {
    try {
      const existing = await prisma.agent.findUnique({
        where: { slug: agent.slug },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${agent.title} (already exists)`);
        skipped++;
        continue;
      }

      await prisma.agent.create({
        data: {
          ...agent,
          status: ContentStatus.APPROVED,
        },
      });
      
      console.log(`✅ Created: ${agent.title}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${agent.title}:`, error);
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📊 Total: ${created + skipped}\n`);
}

seedAgents()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

