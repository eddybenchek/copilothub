import { PrismaClient, ContentStatus, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInstructions() {
  console.log('🌱 Seeding Instructions...\n');

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

  const sampleInstructions = [
    {
      title: 'React Component Best Practices',
      slug: 'react-component-best-practices',
      description: 'Guidelines for creating maintainable and performant React components',
      content: `# React Component Best Practices

## General Guidelines

- Use functional components with hooks instead of class components
- Keep components small and focused on a single responsibility
- Use TypeScript for type safety
- Implement proper error boundaries
- Use memo() for expensive computations

## Component Structure

\`\`\`tsx
// Good example
export function UserCard({ user }: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      {isExpanded && <UserDetails user={user} />}
    </div>
  );
}
\`\`\`

## Performance

- Avoid inline functions in JSX
- Use useMemo and useCallback appropriately
- Implement virtual scrolling for long lists
- Lazy load heavy components

## Accessibility

- Always provide meaningful aria-labels
- Ensure keyboard navigation works
- Use semantic HTML elements
- Test with screen readers`,
      filePattern: '*.tsx',
      language: 'typescript',
      framework: 'react',
      scope: 'file',
      tags: ['react', 'typescript', 'best-practices', 'components'],
      difficulty: Difficulty.INTERMEDIATE,
      featured: true,
      authorId: admin.id,
    },
    {
      title: 'TypeScript Error Handling',
      slug: 'typescript-error-handling',
      description: 'Comprehensive error handling patterns for TypeScript applications',
      content: `# TypeScript Error Handling

## Custom Error Classes

\`\`\`typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
\`\`\`

## Try-Catch Best Practices

- Always catch errors in async functions
- Use specific error types
- Log errors with context
- Return proper error responses

## Result Type Pattern

\`\`\`typescript
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { ok: false, error: new Error('Division by zero') };
  }
  return { ok: true, value: a / b };
}
\`\`\``,
      filePattern: '*.ts',
      language: 'typescript',
      framework: null,
      scope: 'project',
      tags: ['typescript', 'error-handling', 'best-practices'],
      difficulty: Difficulty.ADVANCED,
      featured: true,
      authorId: admin.id,
    },
    {
      title: 'API Route Security',
      slug: 'api-route-security',
      description: 'Security best practices for Next.js API routes',
      content: `# API Route Security

## Authentication

Always verify user authentication before processing requests:

\`\`\`typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Process request...
}
\`\`\`

## Input Validation

- Always validate and sanitize user input
- Use Zod or similar validation libraries
- Implement rate limiting
- Prevent SQL injection with parameterized queries

## CORS Configuration

Configure CORS headers appropriately for your API routes.

## Security Headers

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block`,
      filePattern: 'app/api/**/*.ts',
      language: 'typescript',
      framework: 'nextjs',
      scope: 'project',
      tags: ['security', 'api', 'nextjs', 'authentication'],
      difficulty: Difficulty.ADVANCED,
      featured: false,
      authorId: admin.id,
    },
    {
      title: 'Python Docstring Standards',
      slug: 'python-docstring-standards',
      description: 'Write clear and consistent Python docstrings',
      content: `# Python Docstring Standards

## Function Docstrings

Use Google-style docstrings:

\`\`\`python
def calculate_average(numbers: list[float]) -> float:
    """Calculate the average of a list of numbers.
    
    Args:
        numbers: A list of numeric values.
        
    Returns:
        The arithmetic mean of the numbers.
        
    Raises:
        ValueError: If the list is empty.
        
    Example:
        >>> calculate_average([1, 2, 3, 4, 5])
        3.0
    """
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")
    return sum(numbers) / len(numbers)
\`\`\`

## Class Docstrings

Document the purpose, attributes, and key methods.

## Module Docstrings

Include a brief description of the module's purpose at the top of each file.`,
      filePattern: '*.py',
      language: 'python',
      framework: null,
      scope: 'file',
      tags: ['python', 'documentation', 'best-practices'],
      difficulty: Difficulty.BEGINNER,
      featured: false,
      authorId: admin.id,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const instruction of sampleInstructions) {
    try {
      const existing = await prisma.instruction.findUnique({
        where: { slug: instruction.slug },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${instruction.title} (already exists)`);
        skipped++;
        continue;
      }

      await prisma.instruction.create({
        data: {
          ...instruction,
          status: ContentStatus.APPROVED,
        },
      });
      
      console.log(`✅ Created: ${instruction.title}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${instruction.title}:`, error);
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📊 Total: ${created + skipped}\n`);
}

seedInstructions()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

