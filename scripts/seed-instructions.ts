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
    {
      title: 'Spring Boot 2 → 3 Migration Guide (Jakarta EE)',
      slug: 'spring-boot-2-to-3-migration',
      description: 'Production-safe step-by-step playbook to migrate Spring Boot 2.x to 3.x with Jakarta EE, Java 17, Spring Security 6, and Hibernate 6',
      content: `# Spring Boot 2 → 3 Migration Guide (Jakarta EE)

A **production-safe, step-by-step playbook** to migrate a Spring Boot 2.x application to **Spring Boot 3.x** using **GitHub Copilot**.

This guide focuses on **incremental migration**, minimizing risk while handling Jakarta EE changes, Java 17 upgrades, Spring Security 6 refactors, and Hibernate 6 validation.

---

## Why Spring Boot 2 → 3 Is a Breaking Migration

Spring Boot 3 is **not a minor upgrade**. It introduces platform-level changes that impact almost every layer of a Spring application.

Most production teams delay this migration because:

- The surface area of changes is large
- Errors often appear late (runtime, not compile-time)
- Security and persistence changes are risky

This guide exists to make the migration **predictable, testable, and reversible**.

---

## Major Breaking Changes You Must Handle

### Jakarta EE Namespace Migration

- \`javax.persistence\` → \`jakarta.persistence\`
- \`javax.validation\` → \`jakarta.validation\`
- \`javax.servlet\` → \`jakarta.servlet\`
- \`javax.annotation\` → \`jakarta.annotation\`
- \`javax.transaction\` → \`jakarta.transaction\`

### Java Runtime Baseline

- Java **17** minimum requirement (Java 8/11 no longer supported)
- Maven / Gradle toolchain updates required
- JVM arguments may need adjustment

### Spring Security 6

- \`WebSecurityConfigurerAdapter\` removed (deprecated in 5.7)
- New \`SecurityFilterChain\` bean-based configuration model
- \`antMatchers()\` → \`requestMatchers()\`
- \`authorizeRequests()\` → \`authorizeHttpRequests()\`
- Method security changes

### Hibernate 6

- Stricter JPQL parsing (queries must be valid)
- Changed query return behavior
- Pagination and joins behave differently
- \`@Type\` annotation replaced with \`@JdbcTypeCode\`
- \`@TypeDef\` changes

### Actuator & Configuration

- Endpoint path changes (\`/actuator/health\` → \`/actuator/health\` still works, but some endpoints moved)
- Deprecated starters removed
- Configuration properties renamed

---

## Recommended Migration Strategy (Production-Safe)

The safest approach is **incremental**, not a big-bang upgrade.

### Phase 1 — Preflight

- Upgrade Java runtime to **17**
- Run full test suite and document baseline
- Freeze feature development
- Create migration branch
- Document current dependency versions

### Phase 2 — Dependency Alignment

- Import Spring Boot 3 BOM
- Remove incompatible starters
- Upgrade third-party libraries to Spring Boot 3-compatible versions
- Update build tool configurations

### Phase 3 — Jakarta Refactor

- Mechanical \`javax → jakarta\` refactors
- No business logic changes
- Update imports across all files

### Phase 4 — Security Migration

- Replace deprecated Spring Security patterns
- Migrate \`WebSecurityConfigurerAdapter\` to \`SecurityFilterChain\`
- Validate authentication and authorization flows
- Test security configurations

### Phase 5 — Persistence Validation

- Fix Hibernate query issues
- Update custom types and converters
- Validate schema migrations
- Review pagination and joins
- Test database operations

### Phase 6 — Cleanup & Hardening

- Remove transitional code
- Enable stricter validation
- Update documentation
- Final regression testing
- Performance benchmarking

---

## High-Signal GitHub Copilot Prompts

These prompts are designed for **large-scale, mechanical refactors** where Copilot excels.

### Phase 1: Project Compatibility Scan

**Prompt:**
\`\`\`
Scan this Spring Boot 2.x project and identify all dependencies that need to be upgraded for Spring Boot 3.x compatibility. Check:
1. Spring Boot version (currently 2.x)
2. Java version requirement (must be 17+)
3. Third-party libraries incompatible with Spring Boot 3
4. Deprecated Spring Security configurations
5. javax.* imports that need jakarta.* migration

Generate a migration readiness report with:
- Incompatible dependencies
- Required version upgrades
- Breaking change risks
- Estimated migration complexity
\`\`\`

**Detailed Prompt:**
\`\`\`
Analyze pom.xml/build.gradle and all Java source files. Create a comprehensive compatibility report:

1. List all Spring Boot starters and their current versions
2. Identify which starters are deprecated in Spring Boot 3
3. Check for javax.* imports (persistence, validation, servlet, annotation, transaction)
4. Find WebSecurityConfigurerAdapter usage
5. Check Hibernate version compatibility
6. Identify custom type definitions using @Type
7. List all third-party dependencies and their Spring Boot 3 compatibility status

Output format:
- Dependency Name | Current Version | Required Version | Breaking Changes | Migration Effort
\`\`\`

### Phase 2: Dependency Alignment

**Prompt:**
\`\`\`
Update this Spring Boot project's build configuration (pom.xml/build.gradle) to Spring Boot 3.x:

1. Update Spring Boot parent/BOM to 3.x
2. Update Java version to 17
3. Remove deprecated starters
4. Update compatible third-party libraries to Spring Boot 3-compatible versions
5. Update Maven/Gradle plugin versions
6. Add any required new dependencies

Preserve all existing functionality and configuration.
\`\`\`

**Detailed Prompt for Maven:**
\`\`\`
Update pom.xml for Spring Boot 3.x migration:

1. Change parent version: \`<parent><version>3.x.x</version></parent>\`
2. Set Java version: \`<java.version>17</java.version>\` and \`<maven.compiler.source>17</maven.compiler.source>\`
3. Update spring-boot-starter-* dependencies to 3.x versions
4. Remove deprecated starters (if any)
5. Update spring-boot-maven-plugin to 3.x
6. Check and update:
   - spring-boot-starter-web
   - spring-boot-starter-data-jpa
   - spring-boot-starter-security
   - spring-boot-starter-validation
   - spring-boot-starter-actuator
7. Update third-party dependencies:
   - Hibernate to 6.x
   - Jakarta EE APIs
   - Other Spring ecosystem dependencies

Maintain all existing properties and configurations.
\`\`\`

**Detailed Prompt for Gradle:**
\`\`\`
Update build.gradle for Spring Boot 3.x migration:

1. Update \`org.springframework.boot\` plugin to 3.x
2. Set Java toolchain: \`java.toolchain.languageVersion = JavaLanguageVersion.of(17)\`
3. Update all \`org.springframework.boot:spring-boot-starter-*\` dependencies to 3.x
4. Update \`io.spring.dependency-management\` plugin version
5. Update Hibernate to 6.x
6. Update Jakarta EE dependencies
7. Update Gradle wrapper to 7.5+ (required for Java 17)

Preserve all existing configurations, repositories, and build logic.
\`\`\`

### Phase 3: Jakarta Namespace Refactor

**Prompt:**
\`\`\`
Migrate all javax.* imports to jakarta.* across this Spring Boot project:

1. javax.persistence.* → jakarta.persistence.*
2. javax.validation.* → jakarta.validation.*
3. javax.servlet.* → jakarta.servlet.*
4. javax.annotation.* → jakarta.annotation.*
5. javax.transaction.* → jakarta.transaction.*

Update all import statements, but do NOT change any business logic, method signatures, or class implementations. This is a pure namespace migration.

Files to update:
- All Java source files
- Test files
- Configuration classes
- Entity classes
- Service classes
- Controller classes
\`\`\`

**Detailed Prompt for Entity Classes:**
\`\`\`
Update JPA entity classes for Jakarta EE migration:

1. Change \`import javax.persistence.*;\` to \`import jakarta.persistence.*;\`
2. Update all annotations:
   - @Entity, @Table, @Id, @GeneratedValue remain the same (just import changes)
   - @Column, @OneToMany, @ManyToOne, @ManyToMany, @OneToOne (import changes only)
3. Update validation imports:
   - \`javax.validation.constraints.*\` → \`jakarta.validation.constraints.*\`
4. Do NOT change:
   - Field names
   - Relationships
   - Column mappings
   - Business logic

Apply to all entity classes in the project.
\`\`\`

**Detailed Prompt for Repository Classes:**
\`\`\`
Update Spring Data JPA repository interfaces for Jakarta EE:

1. Change \`import javax.persistence.*;\` to \`import jakarta.persistence.*;\` in custom repository implementations
2. Update @Query annotations (syntax remains the same, only import changes)
3. Update @Modifying annotations (import changes)
4. Update @Transactional imports: \`javax.transaction.Transactional\` → \`jakarta.transaction.Transactional\`

Repository interfaces extending JpaRepository don't need changes, but custom implementations do.
\`\`\`

**Detailed Prompt for Controller Classes:**
\`\`\`
Update Spring MVC controllers for Jakarta EE migration:

1. Update validation imports: \`javax.validation.*\` → \`jakarta.validation.*\`
2. Update @Valid, @NotNull, @Size, @Min, @Max, etc. (imports only)
3. Update servlet imports if used: \`javax.servlet.*\` → \`jakarta.servlet.*\`
4. Update HttpServletRequest, HttpServletResponse imports if present

Controller annotations (@RestController, @RequestMapping, etc.) remain unchanged.
\`\`\`

### Phase 4: Spring Security Migration

**Prompt:**
\`\`\`
Migrate Spring Security configuration from WebSecurityConfigurerAdapter to the new SecurityFilterChain bean-based approach for Spring Security 6:

1. Remove class extending WebSecurityConfigurerAdapter
2. Create a @Bean method returning SecurityFilterChain
3. Convert configure(HttpSecurity http) logic to SecurityFilterChain
4. Update:
   - antMatchers() → requestMatchers()
   - authorizeRequests() → authorizeHttpRequests()
   - and() → and() (unchanged, but verify chaining)
5. Convert any AuthenticationManagerBuilder configuration to AuthenticationManager bean
6. Update CORS configuration if present
7. Update CSRF configuration if present

Preserve all existing security rules and behaviors.
\`\`\`

**Detailed Example Prompt:**
\`\`\`
Convert this Spring Security configuration class:

\`\`\`java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/public/**").permitAll()
                .antMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            .and()
            .formLogin()
            .and()
            .httpBasic();
    }
}
\`\`\`

To Spring Security 6 SecurityFilterChain format. Use @Bean method, update method names, preserve all security rules.
\`\`\`

**Detailed Prompt for Method Security:**
\`\`\`
Update method-level security annotations for Spring Security 6:

1. @EnableGlobalMethodSecurity → @EnableMethodSecurity
2. @PreAuthorize, @PostAuthorize, @Secured remain the same (just enable annotation changes)
3. Update configuration class to use @EnableMethodSecurity instead of @EnableGlobalMethodSecurity
4. Verify all method security expressions still work

Test all secured methods after migration.
\`\`\`

### Phase 5: Hibernate 6 Migration

**Prompt:**
\`\`\`
Update Hibernate entities and queries for Hibernate 6 compatibility:

1. Replace @Type annotation with @JdbcTypeCode or @JdbcType
2. Update @TypeDef to use new Hibernate 6 type system
3. Review all JPQL queries for stricter parsing requirements
4. Update pagination queries if needed
5. Check join behavior changes
6. Update custom type implementations

Identify all @Type usages and suggest Hibernate 6 replacements.
\`\`\`

**Detailed Prompt for Custom Types:**
\`\`\`
Migrate Hibernate custom types from @Type to Hibernate 6 format:

1. Find all @Type annotations
2. For simple type mappings, use @JdbcTypeCode
3. For complex types, implement BasicType or use @JdbcType
4. Update @TypeDef definitions
5. Example:
   - Old: @Type(type = "jsonb")
   - New: @JdbcTypeCode(SqlTypes.JSON) or custom BasicType

Provide migration for each custom type found.
\`\`\`

**Detailed Prompt for Query Updates:**
\`\`\`
Review and fix JPQL/HQL queries for Hibernate 6 stricter parsing:

1. Ensure all queries are syntactically valid
2. Check pagination queries (setFirstResult/setMaxResults)
3. Verify join syntax
4. Update any deprecated query methods
5. Test all named queries
6. Check native query compatibility

List all queries that may need updates and suggest fixes.
\`\`\`

### Phase 6: Cleanup & Validation

**Prompt:**
\`\`\`
Perform final cleanup and validation for Spring Boot 3 migration:

1. Remove any transitional/compatibility code
2. Update application.properties/yml for Spring Boot 3 property changes
3. Remove deprecated configuration properties
4. Update logging configuration if needed
5. Verify actuator endpoints
6. Check for any remaining javax.* imports
7. Update documentation and comments
8. Ensure all tests pass
9. Verify no deprecated warnings

Generate a final migration checklist.
\`\`\`

**Detailed Prompt for Configuration:**
\`\`\`
Update application.properties/application.yml for Spring Boot 3:

1. Check for renamed properties (e.g., server.servlet.context-path changes)
2. Update actuator endpoint configurations
3. Update datasource configurations if needed
4. Review security properties
5. Update logging configuration
6. Check for deprecated properties and replace with new equivalents

List all configuration changes needed.
\`\`\`

---

## Testing Strategy

### Unit Tests

Run all unit tests after each phase:
\`\`\`bash
mvn test
# or
gradle test
\`\`\`

### Integration Tests

Focus on:
- Security configurations
- Database operations
- API endpoints
- Authentication/authorization flows

### Manual Testing Checklist

- [ ] Application starts without errors
- [ ] All API endpoints respond correctly
- [ ] Authentication works
- [ ] Authorization rules enforced
- [ ] Database queries execute successfully
- [ ] Pagination works correctly
- [ ] File uploads/downloads work (if applicable)
- [ ] Actuator endpoints accessible
- [ ] Logging works correctly

---

## Rollback Procedure

If migration fails:

1. Revert to previous Git commit/branch
2. Restore previous dependency versions
3. Verify application functionality
4. Document issues encountered
5. Plan fixes before retry

**Always maintain a rollback branch during migration.**

---

## Common Pitfalls

1. **Runtime Errors from Jakarta Migration**: Some errors only appear at runtime. Test thoroughly.
2. **Security Configuration Breaking**: Spring Security 6 changes are significant. Test all security rules.
3. **Hibernate Query Failures**: Stricter parsing catches previously working invalid queries.
4. **Third-Party Library Incompatibility**: Some libraries may not support Spring Boot 3 yet.
5. **Configuration Property Changes**: Some properties renamed or removed.

---

## Post-Migration Optimization

After successful migration:

1. Enable Java 17 features (records, pattern matching, etc.)
2. Review and optimize for Spring Boot 3 performance improvements
3. Update to latest Spring Boot 3.x patch version
4. Consider Spring Boot 3.1+ features (native compilation, etc.)
5. Update team documentation

---

## Resources

- [Spring Boot 3.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide)
- [Spring Security 6 Migration Guide](https://docs.spring.io/spring-security/reference/migration/index.html)
- [Hibernate 6 Migration Guide](https://hibernate.org/community/releases/6.0/)
- [Jakarta EE 9 Migration](https://jakarta.ee/specifications/platform/9/)

---

**Remember**: This is an incremental migration. Complete one phase, test thoroughly, commit, then proceed to the next phase.`,
      filePattern: '**/*.java',
      language: 'java',
      framework: 'spring-boot',
      scope: 'project',
      tags: ['spring-boot', 'java', 'migration', 'jakarta-ee', 'spring-security', 'hibernate', 'category:modernization'],
      difficulty: Difficulty.ADVANCED,
      featured: true,
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

