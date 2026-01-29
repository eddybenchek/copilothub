/**
 * Spring Boot Hub Index Configuration
 * 
 * Single source of truth for routing, content organization, and SEO.
 * Maps migrations, errors, prompt packs, and sections for the Spring Boot Hub.
 */

export const SPRING_BOOT_SECTIONS = {
  overview: 'overview',
  featured: 'featured',
  catalog: 'catalog',
  'common-errors': 'common-errors',
  'prompt-packs': 'prompt-packs',
  workflows: 'workflows',
  tools: 'tools',
  faq: 'faq',
} as const;

export type SpringBootSection = typeof SPRING_BOOT_SECTIONS[keyof typeof SPRING_BOOT_SECTIONS];

export interface MigrationConfig {
  key: string;
  title: string;
  description: string;
  tags: string[];
  primaryInstructionSlug: string;
  anchor?: string;
  related?: {
    promptPackKey?: string;
    workflowSlugs?: string[];
    errorKeys?: string[];
  };
}

export interface ErrorConfig {
  key: string;
  title: string;
  description: string;
  tags: string[];
  instructionSlug: string;
  anchor: string;
  searchAliases: string[];
  fixPatterns?: string[];
}

export interface PromptPackConfig {
  key: string;
  title: string;
  description?: string;
  tags: string[];
}

export const SPRING_BOOT_HUB_INDEX = {
  migrations: [
    {
      key: '2-to-3-jakarta',
      title: 'Spring Boot 2 → 3 (Jakarta EE)',
      description: 'Jakarta EE namespace change, Java 17 requirement',
      tags: ['spring-boot', 'jakarta', 'migration', 'jakarta-ee'],
      primaryInstructionSlug: 'spring-boot-2-to-3-migration',
      anchor: 'jakarta-ee-namespace-migration',
      related: {
        promptPackKey: 'jakarta-refactor',
        errorKeys: ['javax-to-jakarta-imports'],
      },
    },
    {
      key: '3-to-4-upgrade',
      title: 'Spring Boot 3 → 4 Upgrade',
      description: 'Framework upgrades + config changes + validation',
      tags: ['spring-boot', 'migration', 'upgrade'],
      primaryInstructionSlug: 'spring-boot-3x-to-40-migration-guide',
      related: {
        errorKeys: ['actuator-endpoint-changes', 'jackson-customizer-package-change'],
      },
    },
    {
      key: 'spring-security-6',
      title: 'Spring Security 6 Migration',
      description: 'WebSecurityConfigurerAdapter removed, SecurityFilterChain migration',
      tags: ['spring-security', 'security', 'migration', 'spring-boot'],
      primaryInstructionSlug: 'spring-boot-2-to-3-migration',
      anchor: 'spring-security-6',
      related: {
        promptPackKey: 'security-migration',
        errorKeys: ['websecurityconfigureradapter-removed'],
      },
    },
    {
      key: 'hibernate-6',
      title: 'Hibernate 6 Migration',
      description: 'Hibernate 6 stricter query parsing, JPQL updates',
      tags: ['hibernate', 'jpa', 'persistence', 'migration'],
      primaryInstructionSlug: 'spring-boot-2-to-3-migration',
      anchor: 'hibernate-6',
      related: {
        promptPackKey: 'hibernate-jpa',
        errorKeys: ['hibernate-6-jpql'],
      },
    },
    {
      key: 'actuator-endpoints',
      title: 'Actuator Endpoint Changes',
      description: 'Endpoint path and configuration updates',
      tags: ['actuator', 'monitoring', 'spring-boot'],
      primaryInstructionSlug: 'spring-boot-3x-to-40-migration-guide',
      anchor: 'actuator-changes',
      related: {
        errorKeys: ['actuator-endpoint-changes'],
      },
    },
    {
      key: 'observability',
      title: 'Logging/Tracing/Observability Changes',
      description: 'Micrometer and observability improvements',
      tags: ['observability', 'logging', 'tracing', 'micrometer'],
      primaryInstructionSlug: 'spring-boot-3x-to-40-migration-guide',
    },
  ] as const satisfies readonly MigrationConfig[],

  errors: [
    {
      key: 'websecurityconfigureradapter-removed',
      title: 'WebSecurityConfigurerAdapter removed',
      description: 'Spring Security 6 migration guide',
      tags: ['spring-security', 'security', 'migration'],
      instructionSlug: 'spring-boot-2-to-3-migration',
      anchor: 'spring-security-6',
      searchAliases: ['WebSecurityConfigurerAdapter', 'Spring Security 6', 'SecurityFilterChain', 'security config'],
      fixPatterns: [
        'Replace WebSecurityConfigurerAdapter with @Bean SecurityFilterChain',
        'Use authorizeHttpRequests() instead of authorizeRequests()',
        'Use requestMatchers() instead of antMatchers()',
      ],
    },
    {
      key: 'javax-to-jakarta-imports',
      title: 'javax → jakarta imports',
      description: 'Jakarta EE namespace migration',
      tags: ['jakarta', 'javax', 'migration', 'namespace'],
      instructionSlug: 'spring-boot-2-to-3-migration',
      anchor: 'jakarta-ee-namespace-migration',
      searchAliases: ['javax imports', 'jakarta imports', 'javax.persistence', 'jakarta.persistence', 'namespace change'],
      fixPatterns: [
        'Replace javax.servlet.* with jakarta.servlet.*',
        'Replace javax.persistence.* with jakarta.persistence.*',
        'Replace javax.validation.* with jakarta.validation.*',
        'Replace javax.annotation.* with jakarta.annotation.*',
      ],
    },
    {
      key: 'hibernate-6-jpql',
      title: 'Hibernate 6 query issues',
      description: 'JPQL and query parsing changes',
      tags: ['hibernate', 'jpa', 'query', 'jpql'],
      instructionSlug: 'spring-boot-2-to-3-migration',
      anchor: 'hibernate-6',
      searchAliases: ['Hibernate 6', 'JPQL', 'query parsing', 'Hibernate query error'],
      fixPatterns: [
        'Use explicit JOINs instead of implicit joins',
        'Replace SIZE() with EXISTS subqueries',
        'Add explicit aliases to subqueries',
      ],
    },
    {
      key: 'actuator-endpoint-changes',
      title: 'Actuator endpoint changed',
      description: 'Endpoint path and config updates',
      tags: ['actuator', 'monitoring', 'endpoints'],
      instructionSlug: 'spring-boot-3x-to-40-migration-guide',
      anchor: 'actuator-changes',
      searchAliases: ['Actuator', 'endpoint changes', 'health check', 'monitoring'],
    },
    {
      key: 'jackson-customizer-package-change',
      title: 'Jackson customization changes',
      description: 'JSON serialization updates',
      tags: ['jackson', 'json', 'serialization'],
      instructionSlug: 'spring-boot-3x-to-40-migration-guide',
      anchor: 'jackson-3-migration',
      searchAliases: ['Jackson', 'JSON customization', 'ObjectMapper', 'serialization'],
    },
  ] as const satisfies readonly ErrorConfig[],

  promptPacks: [
    {
      key: 'jakarta-refactor',
      title: 'Jakarta refactor',
      description: 'Migrate javax.* imports to jakarta.* namespace',
      tags: ['jakarta', 'javax', 'jakarta-ee', 'namespace', 'refactor'],
    },
    {
      key: 'security-migration',
      title: 'Security migration',
      description: 'Migrate Spring Security configuration to SecurityFilterChain',
      tags: ['security', 'spring-security', 'authentication', 'authorization'],
    },
    {
      key: 'hibernate-jpa',
      title: 'Hibernate/JPA',
      description: 'Fix Hibernate 6 JPQL queries and entity mappings',
      tags: ['hibernate', 'jpa', 'persistence', 'orm', 'entity'],
    },
    {
      key: 'testing-verification',
      title: 'Testing & verification',
      description: 'Create test suites and verify migration success',
      tags: ['testing', 'test', 'verification', 'junit'],
    },
    {
      key: 'build-maven-gradle',
      title: 'Build (Maven/Gradle)',
      description: 'Update build configuration for Spring Boot 3',
      tags: ['maven', 'gradle', 'build', 'dependencies'],
    },
  ] as const satisfies readonly PromptPackConfig[],

  sections: SPRING_BOOT_SECTIONS,
} as const;

// Helper functions
export function getMigrationByKey(key: string): MigrationConfig | undefined {
  return SPRING_BOOT_HUB_INDEX.migrations.find((m) => m.key === key);
}

export function getErrorByKey(key: string): ErrorConfig | undefined {
  return SPRING_BOOT_HUB_INDEX.errors.find((e) => e.key === key);
}

export function getPromptPackByKey(key: string): PromptPackConfig | undefined {
  return SPRING_BOOT_HUB_INDEX.promptPacks.find((p) => p.key === key);
}

export function getAllMigrations(): readonly MigrationConfig[] {
  return SPRING_BOOT_HUB_INDEX.migrations;
}

export function getAllErrors(): readonly ErrorConfig[] {
  return SPRING_BOOT_HUB_INDEX.errors;
}

export function getAllPromptPacks(): readonly PromptPackConfig[] {
  return SPRING_BOOT_HUB_INDEX.promptPacks;
}
