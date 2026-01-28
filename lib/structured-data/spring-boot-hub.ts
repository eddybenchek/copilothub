import { getBaseUrl } from '../metadata';
import type { SpringBootContent } from '../hub-helpers';

export function generateSpringBootHubStructuredData(content: SpringBootContent) {
  const baseUrl = getBaseUrl();
  
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
  };
}
