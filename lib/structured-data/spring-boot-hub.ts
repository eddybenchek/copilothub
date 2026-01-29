import { getBaseUrl } from '../metadata';
import type { SpringBootContent } from '../hub-helpers';
import { getAllMigrations, getAllErrors, getAllPromptPacks } from '../hub-indexes/spring-boot-index';

export function generateSpringBootHubStructuredData(content: SpringBootContent) {
  const baseUrl = getBaseUrl();
  const migrations = getAllMigrations();
  const errors = getAllErrors();
  const promptPacks = getAllPromptPacks();
  
  // CollectionPage schema
  const collectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Spring Boot Migration Hub',
    description: 'Production-safe Spring Boot migrations (2→3, 3→4), upgrade checklists, Copilot prompts, and step-by-step workflows for teams.',
    url: `${baseUrl}/spring-boot`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: 
        content.instructions.length + 
        content.prompts.length + 
        content.agents.length + 
        content.tools.length + 
        content.mcps.length,
      itemListElement: [
        ...content.instructions.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'HowTo',
            name: item.title,
            description: item.description,
            url: `${baseUrl}/instructions/${item.slug}`,
          },
        })),
        ...content.prompts.map((item, index) => ({
          '@type': 'ListItem',
          position: content.instructions.length + index + 1,
          item: {
            '@type': 'CreativeWork',
            name: item.title,
            description: item.description,
            url: `${baseUrl}/prompts/${item.slug}`,
          },
        })),
      ],
    },
  };

  // Featured Playbooks ItemList
  const featuredPlaybooksList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Spring Boot Migration Playbooks',
    itemListElement: content.instructions.slice(0, 2).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'HowTo',
        name: item.title,
        description: item.description,
        url: `${baseUrl}/instructions/${item.slug}`,
      },
    })),
  };

  // Migrations ItemList
  const migrationsList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Spring Boot Migration Guides',
    itemListElement: migrations.map((migration, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        name: migration.title,
        description: migration.description,
        url: `${baseUrl}/spring-boot/migrations/${migration.key}`,
      },
    })),
  };

  // Errors ItemList
  const errorsList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Common Spring Boot Migration Errors',
    itemListElement: errors.map((error, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        name: error.title,
        description: error.description,
        url: `${baseUrl}/spring-boot/errors/${error.key}`,
      },
    })),
  };

  // Prompt Packs ItemList
  const promptPacksList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Spring Boot Copilot Prompt Packs',
    itemListElement: promptPacks.map((pack, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: pack.title,
        description: pack.description || `Copilot prompt pack for ${pack.title}`,
        url: `${baseUrl}/spring-boot/prompt-packs/${pack.key}`,
      },
    })),
  };

  // Breadcrumbs schema
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Spring Boot Hub',
        item: `${baseUrl}/spring-boot`,
      },
    ],
  };

  return {
    collectionPage,
    breadcrumbs,
    featuredPlaybooksList,
    migrationsList,
    errorsList,
    promptPacksList,
  };
}
