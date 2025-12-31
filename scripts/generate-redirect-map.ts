import { db } from '../lib/db';
import { ContentStatus } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Generate a static redirect map from the database
 * This map is used in middleware (Edge Runtime) to avoid Prisma queries
 */
async function generateRedirectMap() {
  console.log('🔄 Generating redirect map...\n');

  const redirectMap: {
    instructions: Record<string, string>;
    agents: Record<string, string>;
    mcps: Record<string, string>;
    spec: string | null;
  } = {
    instructions: {},
    agents: {},
    mcps: {},
    spec: null,
  };

  // Fetch all approved instructions
  const instructions = await db.instruction.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { slug: true, title: true },
  });

  console.log(`📝 Processing ${instructions.length} instructions...`);

  for (const instruction of instructions) {
    const slug = instruction.slug.toLowerCase();
    
    // Add exact slug match
    redirectMap.instructions[slug] = instruction.slug;
    
    // Add variations for common patterns
    // If slug contains the title words, add title-based variations
    const titleWords = instruction.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);
    
    // Add first word as potential redirect
    if (titleWords.length > 0) {
      const firstWord = titleWords[0];
      if (!redirectMap.instructions[firstWord] || redirectMap.instructions[firstWord] === instruction.slug) {
        redirectMap.instructions[firstWord] = instruction.slug;
      }
    }
    
    // Add slug without common suffixes
    const slugWithoutSuffix = slug
      .replace(/-instructions$/, '')
      .replace(/-guidelines$/, '')
      .replace(/-best-practices$/, '')
      .replace(/-conventions$/, '');
    
    if (slugWithoutSuffix !== slug && !redirectMap.instructions[slugWithoutSuffix]) {
      redirectMap.instructions[slugWithoutSuffix] = instruction.slug;
    }
    
    // Add variations by removing common abbreviations/acronyms
    // e.g., "azure-verified-modules-avm-terraform" -> "azure-verified-modules-terraform"
    const slugParts = slug.split('-');
    const commonAbbrevs = ['avm', 'api', 'sdk', 'cli', 'ui', 'ux', 'db', 'sql', 'http', 'https', 'json', 'xml', 'yaml', 'md', 'ts', 'js', 'py', 'rb', 'go', 'rs'];
    
    // Try removing each abbreviation if it exists
    for (const abbrev of commonAbbrevs) {
      const abbrevIndex = slugParts.indexOf(abbrev);
      if (abbrevIndex !== -1) {
        const slugWithoutAbbrev = slugParts
          .filter((_, i) => i !== abbrevIndex)
          .join('-');
        if (slugWithoutAbbrev && !redirectMap.instructions[slugWithoutAbbrev]) {
          redirectMap.instructions[slugWithoutAbbrev] = instruction.slug;
        }
      }
    }
    
    // Add variations by removing single-letter parts (common in slugs)
    const slugWithoutSingleLetters = slugParts
      .filter((part) => part.length > 1)
      .join('-');
    if (slugWithoutSingleLetters !== slug && !redirectMap.instructions[slugWithoutSingleLetters]) {
      redirectMap.instructions[slugWithoutSingleLetters] = instruction.slug;
    }
  }

  // Fetch all approved agents
  const agents = await db.agent.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { slug: true, title: true },
  });

  console.log(`🤖 Processing ${agents.length} agents...`);

  // Find specification agent
  const specAgent = agents.find(
    (a) =>
      a.slug.toLowerCase() === 'specification' ||
      a.slug.toLowerCase().includes('specification') ||
      a.title.toLowerCase().includes('specification')
  );

  if (specAgent) {
    redirectMap.spec = specAgent.slug;
    console.log(`✅ Found specification agent: ${specAgent.slug}`);
  }

  for (const agent of agents) {
    const slug = agent.slug.toLowerCase();
    redirectMap.agents[slug] = agent.slug;
    
    // Add title-based variations
    const titleWords = agent.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);
    
    if (titleWords.length > 0) {
      const firstWord = titleWords[0];
      if (!redirectMap.agents[firstWord] || redirectMap.agents[firstWord] === agent.slug) {
        redirectMap.agents[firstWord] = agent.slug;
      }
    }
  }

  // Fetch all approved MCPs
  const mcps = await db.mcpServer.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { slug: true, title: true, name: true },
  });

  console.log(`🔌 Processing ${mcps.length} MCPs...`);

  for (const mcp of mcps) {
    const slug = mcp.slug.toLowerCase();
    redirectMap.mcps[slug] = mcp.slug;
    
    // Handle domain-like slugs (e.g., "swarmia.com" -> "mattjegan-swarmia-mcp")
    // Extract potential domain names from slug (e.g., "mattjegan-swarmia-mcp" -> "swarmia")
    const slugParts = slug.split('-');
    for (const part of slugParts) {
      // If part looks like a service name (not a username prefix), create domain mappings
      if (part.length > 3 && !part.match(/^(mattjegan|github|user|author)/i)) {
        // Create domain-like mappings
        const domainVariations = [
          `${part}.com`,
          `${part}.org`,
          `${part}.net`,
          `${part}.io`,
          `${part}.dev`,
        ];
        
        for (const domainVar of domainVariations) {
          if (!redirectMap.mcps[domainVar]) {
            redirectMap.mcps[domainVar] = mcp.slug;
          }
        }
      }
    }
    
    // Also handle if slug itself contains domain pattern
    const domainName = slug.replace(/\.(com|org|net|io|dev)$/i, '');
    if (domainName !== slug && !redirectMap.mcps[domainName]) {
      redirectMap.mcps[domainName] = mcp.slug;
    }
    
    // Add name-based variations if available
    if (mcp.name) {
      const nameSlug = mcp.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      if (nameSlug && nameSlug !== slug && !redirectMap.mcps[nameSlug]) {
        redirectMap.mcps[nameSlug] = mcp.slug;
      }
      
      // Extract domain from name if it contains one (e.g., "mattjegan/swarmia-mcp" -> "swarmia.com")
      const nameParts = mcp.name.toLowerCase().split(/[\/\-_]/);
      for (const part of nameParts) {
        if (part.length > 3 && !part.match(/^(mattjegan|github|user|author)/i)) {
          const domainVar = `${part}.com`;
          if (!redirectMap.mcps[domainVar]) {
            redirectMap.mcps[domainVar] = mcp.slug;
          }
        }
      }
    }
  }

  // Write the redirect map to a JSON file
  const outputPath = join(process.cwd(), 'lib', 'redirect-map.json');
  writeFileSync(outputPath, JSON.stringify(redirectMap, null, 2), 'utf-8');

  console.log(`\n✅ Redirect map generated successfully!`);
  console.log(`   - Instructions: ${Object.keys(redirectMap.instructions).length} mappings`);
  console.log(`   - Agents: ${Object.keys(redirectMap.agents).length} mappings`);
  console.log(`   - MCPs: ${Object.keys(redirectMap.mcps).length} mappings`);
  console.log(`   - Spec redirect: ${redirectMap.spec || 'none'}`);
  console.log(`   - Output: ${outputPath}`);
}

generateRedirectMap()
  .catch(console.error)
  .finally(() => db.$disconnect());

