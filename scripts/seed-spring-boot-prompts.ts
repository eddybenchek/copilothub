import { PrismaClient, ContentStatus, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSpringBootPrompts() {
  console.log('🌱 Seeding Spring Boot Prompts...\n');

  // Get or create admin user
  let admin = await prisma.user.findFirst({
    where: {
      OR: [{ email: { contains: 'admin' } }, { role: 'ADMIN' }],
    },
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

  const springBootPrompts = [
    // Jakarta Refactor Category
    {
      title: 'Migrate javax.* imports to jakarta.* namespace',
      slug: 'spring-boot-jakarta-namespace-migration',
      description:
        'Systematically refactor all javax.* imports to jakarta.* across your Spring Boot codebase.',
      content: `You are a Spring Boot migration expert. Help migrate this codebase from javax.* to jakarta.* namespace.

**Context:**
- Spring Boot 3 requires Jakarta EE 9+ namespace
- All javax.* imports must be replaced with jakarta.*
- This affects: javax.servlet, javax.persistence, javax.validation, javax.annotation, etc.

**Task:**
1. Scan the codebase for all javax.* imports
2. Replace them with jakarta.* equivalents:
   - javax.servlet.* → jakarta.servlet.*
   - javax.persistence.* → jakarta.persistence.*
   - javax.validation.* → jakarta.validation.*
   - javax.annotation.* → jakarta.annotation.*
   - javax.transaction.* → jakarta.transaction.*
3. Update any string literals or annotations that reference javax.*
4. Verify imports are correct for Spring Boot 3

**Files to check:**
- All .java files
- pom.xml or build.gradle dependencies
- Configuration files

**Important:**
- Do this incrementally, file by file
- Test after each batch of changes
- Some third-party libraries may still use javax.* - document these exceptions`,
      tags: [
        'spring-boot',
        'jakarta',
        'javax',
        'jakarta-ee',
        'migration',
        'namespace',
        'java',
        'category:modernization',
      ],
      difficulty: Difficulty.INTERMEDIATE,
      status: ContentStatus.APPROVED,
      authorId: admin.id,
    },
    {
      title: 'Refactor Jakarta EE annotations and API usage',
      slug: 'spring-boot-jakarta-annotations-refactor',
      description:
        'Update Jakarta EE annotations (@Entity, @Valid, @PostConstruct, etc.) to use jakarta.* packages.',
      content: `You are a Spring Boot migration specialist. Refactor Jakarta EE annotations from javax.* to jakarta.*.

**Annotations to migrate:**
- @Entity, @Table, @Id, @Column → jakarta.persistence.*
- @Valid, @NotNull, @Size → jakarta.validation.*
- @PostConstruct, @PreDestroy → jakarta.annotation.*
- @WebServlet, @WebFilter → jakarta.servlet.*
- @Transactional → jakarta.transaction.*

**Steps:**
1. Find all annotation imports using javax.*
2. Replace with jakarta.* equivalents
3. Verify annotation behavior hasn't changed
4. Check for any annotation processor configurations

**Example:**
\`\`\`java
// Before
import javax.persistence.Entity;
import javax.validation.Valid;

// After
import jakarta.persistence.Entity;
import jakarta.validation.Valid;
\`\`\`

**Files:** All Java files with entity classes, controllers, services`,
      tags: [
        'spring-boot',
        'jakarta',
        'annotations',
        'jakarta-ee',
        'refactor',
        'java',
        'category:modernization',
      ],
      difficulty: Difficulty.INTERMEDIATE,
      status: ContentStatus.APPROVED,
      authorId: admin.id,
    },

    // Security Migration Category
    {
      title: 'Migrate Spring Security configuration from WebSecurityConfigurerAdapter',
      slug: 'spring-boot-security-configurer-adapter-migration',
      description:
        'Convert deprecated WebSecurityConfigurerAdapter to Spring Security 6 component-based configuration.',
      content: `You are a Spring Security migration expert. Migrate from WebSecurityConfigurerAdapter to Spring Security 6 component-based configuration.

**Context:**
- WebSecurityConfigurerAdapter is removed in Spring Security 6
- Must use @Bean configuration with SecurityFilterChain
- AuthenticationManagerBuilder is replaced with AuthenticationConfiguration

**Migration Steps:**

1. **Remove extends WebSecurityConfigurerAdapter**
   - Convert to @Configuration class
   - Inject AuthenticationConfiguration

2. **Replace configure(HttpSecurity http)**
   \`\`\`java
   // Before
   @Override
   protected void configure(HttpSecurity http) throws Exception {
     http.authorizeRequests()...
   }
   
   // After
   @Bean
   public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
     http.authorizeHttpRequests()...
     return http.build();
   }
   \`\`\`

3. **Replace configure(AuthenticationManagerBuilder auth)**
   - Use @Bean AuthenticationManager
   - Inject AuthenticationConfiguration

4. **Update method names:**
   - authorizeRequests() → authorizeHttpRequests()
   - antMatchers() → requestMatchers()
   - mvcMatchers() → requestMatchers()

**Files:** Security configuration classes`,
      tags: [
        'spring-boot',
        'spring-security',
        'security',
        'spring-security-6',
        'authentication',
        'authorization',
        'migration',
        'category:modernization',
      ],
      difficulty: Difficulty.ADVANCED,
      status: ContentStatus.APPROVED,
      authorId: admin.id,
    },
    {
      title: 'Update Spring Security filter chain configuration',
      slug: 'spring-boot-security-filter-chain-update',
      description:
        'Modernize Spring Security filter chain configuration for Spring Security 6.',
      content: `You are a Spring Security expert. Update filter chain configuration for Spring Security 6.

**Key Changes:**
- authorizeRequests() → authorizeHttpRequests()
- antMatchers() → requestMatchers()
- mvcMatchers() → requestMatchers()
- CSRF configuration changes
- Session management updates

**Common Patterns:**

\`\`\`java
// Before
http.authorizeRequests()
    .antMatchers("/public/**").permitAll()
    .antMatchers("/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated();

// After
http.authorizeHttpRequests()
    .requestMatchers("/public/**").permitAll()
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated();
\`\`\`

**Tasks:**
1. Update all SecurityFilterChain configurations
2. Replace deprecated methods
3. Update CSRF configuration if needed
4. Test all security rules still work

**Files:** Security configuration classes`,
      tags: [
        'spring-boot',
        'spring-security',
        'security',
        'filter-chain',
        'websecurity',
        'migration',
        'category:modernization',
      ],
      difficulty: Difficulty.ADVANCED,
      status: ContentStatus.APPROVED,
      authorId: admin.id,
    },

    // Hibernate/JPA Category
    {
      title: 'Fix Hibernate 6 JPQL query parsing issues',
      slug: 'spring-boot-hibernate-6-jpql-fixes',
      description:
        'Resolve Hibernate 6 stricter JPQL query parsing errors and update query syntax.',
      content: `You are a Hibernate/JPA expert. Fix Hibernate 6 JPQL query parsing issues.

**Context:**
- Hibernate 6 has stricter JPQL parsing
- Some queries that worked in Hibernate 5 may fail
- Better error messages help identify issues

**Common Issues:**

1. **Implicit joins must be explicit**
   \`\`\`java
   // Before (may fail)
   SELECT u FROM User u WHERE u.department.name = 'IT'
   
   // After
   SELECT u FROM User u JOIN u.department d WHERE d.name = 'IT'
   \`\`\`

2. **Collection size checks**
   \`\`\`java
   // Before
   WHERE SIZE(u.orders) > 0
   
   // After
   WHERE EXISTS (SELECT 1 FROM u.orders o)
   \`\`\`

3. **Subquery aliases**
   - Must use explicit aliases in subqueries
   - Correlated subqueries need proper JOIN syntax

**Tasks:**
1. Find all @Query annotations with JPQL
2. Identify queries with implicit joins
3. Update to explicit JOIN syntax
4. Test all queries still return correct results

**Files:** Repository interfaces, @Query annotations`,
      tags: [
        'spring-boot',
        'hibernate',
        'jpa',
        'hibernate-6',
        'query',
        'jpql',
        'persistence',
        'migration',
        'category:modernization',
      ],
      difficulty: Difficulty.ADVANCED,
      status: ContentStatus.APPROVED,
      authorId: admin.id,
    },
    {
      title: 'Update JPA entity mappings for Hibernate 6',
      slug: 'spring-boot-hibernate-6-entity-mappings',
      description:
        'Update JPA entity mappings and annotations for Hibernate 6 compatibility.',
      content: `You are a JPA/Hibernate expert. Update entity mappings for Hibernate 6.

**Key Changes:**
- @Type annotation changes (now @JdbcTypeCode)
- Enum handling updates
- Collection mapping improvements
- Lazy loading behavior changes

**Common Updates:**

1. **Custom Types**
   \`\`\`java
   // Before
   @Type(type = "jsonb")
   private Map<String, Object> metadata;
   
   // After
   @JdbcTypeCode(SqlTypes.JSON)
   private Map<String, Object> metadata;
   \`\`\`

2. **Enum Handling**
   - Use @Enumerated(EnumType.STRING) explicitly
   - Check enum value compatibility

3. **Collection Mappings**
   - Verify @OneToMany/@ManyToMany mappings
   - Check cascade and fetch types

**Tasks:**
1. Scan all @Entity classes
2. Update deprecated @Type annotations
3. Verify enum mappings
4. Test entity persistence and queries

**Files:** Entity classes, domain models`,
      tags: [
        'spring-boot',
        'hibernate',
        'jpa',
        'entity',
        'mapping',
        'persistence',
        'orm',
        'migration',
        'category:modernization',
      ],
      difficulty: Difficulty.INTERMEDIATE,
      status: ContentStatus.APPROVED,
      authorId: admin.id,
    },

    // Testing & Verification Category
    {
      title: 'Create Spring Boot 3 migration test suite',
      slug: 'spring-boot-3-migration-test-suite',
      description:
        'Generate comprehensive test cases to verify Spring Boot 2→3 migration success.',
      content: `You are a testing expert. Create a comprehensive test suite to verify Spring Boot 2→3 migration.

**Test Categories:**

1. **Jakarta Namespace Tests**
   - Verify all imports use jakarta.*
   - Test entity persistence
   - Test validation annotations

2. **Security Tests**
   - Test authentication flows
   - Test authorization rules
   - Test CSRF protection
   - Test session management

3. **Hibernate/JPA Tests**
   - Test all repository queries
   - Test entity mappings
   - Test transaction boundaries

4. **API Endpoint Tests**
   - Test all REST controllers
   - Test request/response handling
   - Test error handling

5. **Configuration Tests**
   - Test application properties
   - Test bean configurations
   - Test profile-specific configs

**Test Structure:**
\`\`\`java
@SpringBootTest
@AutoConfigureMockMvc
class SpringBoot3MigrationTests {
  // Jakarta namespace tests
  // Security tests
  // JPA tests
  // API tests
}
\`\`\`

**Tasks:**
1. Create test classes for each category
2. Add assertions for migration-specific checks
3. Include integration tests
4. Document test coverage

**Files:** Test directory structure`,
      tags: [
        'spring-boot',
        'testing',
        'test',
        'verification',
        'junit',
        'migration',
        'category:modernization',
      ],
      difficulty: Difficulty.INTERMEDIATE,
      status: ContentStatus.APPROVED,
      authorId: admin.id,
    },
    {
      title: 'Verify Spring Boot 3 dependency compatibility',
      slug: 'spring-boot-3-dependency-verification',
      description:
        'Check and verify all third-party dependencies are compatible with Spring Boot 3.',
      content: `You are a dependency management expert. Verify all dependencies are compatible with Spring Boot 3.

**Checklist:**

1. **Spring Dependencies**
   - Spring Framework 6.x
   - Spring Security 6.x
   - Spring Data JPA 3.x
   - Spring Boot 3.x

2. **Third-Party Libraries**
   - Check each dependency's Spring Boot 3 compatibility
   - Look for Jakarta EE 9+ support
   - Check Java 17+ requirement

3. **Build Tool Updates**
   - Maven: Update spring-boot-starter-parent version
   - Gradle: Update plugin and dependencies

**Verification Steps:**

\`\`\`bash
# Check dependency tree
mvn dependency:tree | grep -i spring
gradle dependencies | grep -i spring

# Check for javax.* in dependencies
mvn dependency:tree | grep javax
\`\`\`

**Common Issues:**
- Libraries still using javax.*
- Incompatible Spring versions
- Missing Jakarta EE support

**Tasks:**
1. List all dependencies
2. Check compatibility matrix
3. Update incompatible dependencies
4. Document any exceptions

**Files:** pom.xml, build.gradle, dependency reports`,
      tags: [
        'spring-boot',
        'testing',
        'verification',
        'dependencies',
        'maven',
        'gradle',
        'migration',
        'category:modernization',
      ],
      difficulty: Difficulty.BEGINNER,
      status: ContentStatus.APPROVED,
      authorId: admin.id,
    },

    // Build (Maven/Gradle) Category
    {
      title: 'Update Maven dependencies for Spring Boot 3',
      slug: 'spring-boot-3-maven-dependencies',
      description:
        'Update pom.xml with Spring Boot 3 dependencies and Jakarta EE compatible libraries.',
      content: `You are a Maven expert. Update pom.xml for Spring Boot 3 migration.

**Key Updates:**

1. **Parent POM**
   \`\`\`xml
   <parent>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-parent</artifactId>
     <version>3.2.0</version>
   </parent>
   \`\`\`

2. **Java Version**
   \`\`\`xml
   <properties>
     <java.version>17</java.version>
   </properties>
   \`\`\`

3. **Dependency Updates**
   - spring-boot-starter-web
   - spring-boot-starter-data-jpa
   - spring-boot-starter-security
   - spring-boot-starter-validation

4. **Remove/Replace Incompatible Dependencies**
   - Check for javax.* dependencies
   - Update to jakarta.* equivalents
   - Remove deprecated starters

**Tasks:**
1. Update parent version
2. Set Java 17
3. Update all Spring Boot starters
4. Check third-party dependencies
5. Run mvn dependency:tree to verify

**Files:** pom.xml`,
      tags: [
        'spring-boot',
        'maven',
        'build',
        'dependencies',
        'pom.xml',
        'migration',
        'category:modernization',
      ],
      difficulty: Difficulty.BEGINNER,
      status: ContentStatus.APPROVED,
      authorId: admin.id,
    },
    {
      title: 'Update Gradle build for Spring Boot 3',
      slug: 'spring-boot-3-gradle-build',
      description:
        'Update build.gradle with Spring Boot 3 plugin and Jakarta EE compatible dependencies.',
      content: `You are a Gradle expert. Update build.gradle for Spring Boot 3 migration.

**Key Updates:**

1. **Plugin Version**
   \`\`\`gradle
   plugins {
     id 'org.springframework.boot' version '3.2.0'
     id 'io.spring.dependency-management' version '1.1.4'
   }
   \`\`\`

2. **Java Version**
   \`\`\`gradle
   java {
     sourceCompatibility = '17'
     targetCompatibility = '17'
   }
   \`\`\`

3. **Dependency Updates**
   \`\`\`gradle
   dependencies {
     implementation 'org.springframework.boot:spring-boot-starter-web'
     implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
     implementation 'org.springframework.boot:spring-boot-starter-security'
     implementation 'org.springframework.boot:spring-boot-starter-validation'
   }
   \`\`\`

4. **Dependency Management**
   - Use Spring Boot BOM for version management
   - Check for javax.* dependencies
   - Update to jakarta.* equivalents

**Tasks:**
1. Update plugin versions
2. Set Java 17
3. Update all dependencies
4. Run gradle dependencies to verify
5. Check for dependency conflicts

**Files:** build.gradle, settings.gradle`,
      tags: [
        'spring-boot',
        'gradle',
        'build',
        'dependencies',
        'build.gradle',
        'migration',
        'category:modernization',
      ],
      difficulty: Difficulty.BEGINNER,
      status: ContentStatus.APPROVED,
      authorId: admin.id,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const prompt of springBootPrompts) {
    try {
      const existing = await prisma.prompt.findUnique({
        where: { slug: prompt.slug },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${prompt.title} (already exists)`);
        skipped++;
        continue;
      }

      await prisma.prompt.create({
        data: {
          ...prompt,
          status: ContentStatus.APPROVED,
        },
      });

      console.log(`✅ Created: ${prompt.title}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${prompt.title}:`, error);
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📊 Total: ${created + skipped}\n`);
}

seedSpringBootPrompts()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
