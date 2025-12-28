import { PrismaClient } from '@prisma/client';
import { ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Known broken links and their fixes (or null to remove)
const linkFixes: Record<string, string | null> = {
  // AI Google links - these domains may have changed
  'https://ai.google/research/responsible-ai/': 'https://ai.google/discover/responsible-ai/',
  'https://ai.google/responsibility/': 'https://ai.google/discover/responsible-ai/',
  
  // GitHub repos that may have been moved or deleted
  'https://github.com/dnaerys/onekgp-mcp': null, // Remove if repo doesn't exist
  'https://github.com/pulumi/mcp-server': 'https://github.com/pulumi/mcp',
  'https://github.com/inspizzz/jetbrains-datalore-mcp': null, // Remove if repo doesn't exist
  
  // Microsoft Learn links - these may have moved
  'https://learn.microsoft.com/en-us/python/api/powerplatform-dataverse-client/': 'https://learn.microsoft.com/en-us/python/api/overview/azure/dataverse',
  'https://learn.microsoft.com/en-us/azure/architecture/best-practices/performance': 'https://learn.microsoft.com/en-us/azure/architecture/framework/performance',
  'https://learn.microsoft.com/en-us/dotnet/standard/performance/': 'https://learn.microsoft.com/en-us/dotnet/fundamentals/performance',
  'https://learn.microsoft.com/en-us/sql/relational-databases/performance/performance-tuning-sql-server?view=sql-server-ver16': 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/performance-tuning-sql-server',
  
  // OWASP link
  'https://owasp.org/www-project-performance-testing/': 'https://owasp.org/www-community/Performance',
  
  // Oracle link
  'https://www.oracle.com/java/technologies/javase/performance.html': 'https://www.oracle.com/java/technologies/performance.html',
  
  // DNS issue - handle with/without trailing slash and http/https
  'https://gui-rs.org': 'https://github.com/tauri-apps/tauri', // gui-rs.org seems to be down, redirect to Tauri
  'https://gui-rs.org/': 'https://github.com/tauri-apps/tauri',
  'http://gui-rs.org': 'https://github.com/tauri-apps/tauri',
  'http://gui-rs.org/': 'https://github.com/tauri-apps/tauri',
  
  // 403 Forbidden links - these may require authentication or have been moved
  'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/': 'https://www.deeplearning.ai/courses/chatgpt-prompt-engineering-for-developers/',
  'https://www.webpagetest.org/': 'https://www.webpagetest.org', // Try without trailing slash
  'https://docs.pytest.org/': 'https://docs.pytest.org/en/stable/', // Use stable version
  'https://www.cs.helsinki.fi/u/luontola/tdd-2009/ext/ObjectCalisthenics.pdf': 'https://www.cs.helsinki.fi/u/luontola/tdd-2009/ext/ObjectCalisthenics.pdf', // PDF may require direct access, keep as is but note
  'https://gramine.readthedocs.io/en/stable/attestation.html': 'https://gramineproject.io/docs/attestation', // Updated docs location
  'https://www.npmjs.com/package/@fluentui/react-migration-v8-v9': 'https://www.npmjs.com/package/@fluentui/react-components', // Package may have moved
  'https://docs.ansible.com/ansible/latest/collections/ansible/builtin/index.html': 'https://docs.ansible.com/ansible/latest/collections/index.html', // Updated docs structure
  'https://docs.ansible.com/ansible/latest/reference_appendices/glossary.html': 'https://docs.ansible.com/ansible/latest/reference_appendices/glossary.html', // May require authentication - try alternative
  'https://docs.ansible.com/ansible/latest/reference_appendices/glossary': 'https://docs.ansible.com/ansible/latest/user_guide/glossary.html', // Alternative glossary location (without .html)
  // Handle with/without trailing slash
  'https://docs.ansible.com/ansible/latest/collections/ansible/builtin/': 'https://docs.ansible.com/ansible/latest/collections/index.html',
  'https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/': 'https://www.writethedocs.org/guide/', // Updated URL structure
};

interface BrokenLink {
  type: 'instruction' | 'agent' | 'mcp';
  id: string;
  slug: string;
  title: string;
  field: 'content' | 'description' | 'githubUrl' | 'websiteUrl';
  oldUrl: string;
  newUrl: string | null;
}

async function findAndFixBrokenLinks() {
  console.log('🔍 Scanning for broken external links...\n');

  const brokenLinks: BrokenLink[] = [];

  // Check Instructions
  console.log('📋 Checking Instructions...');
  const instructions = await prisma.instruction.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { id: true, slug: true, title: true, content: true, description: true },
  });

  for (const instruction of instructions) {
    // Check content field
    const contentLinks = extractLinks(instruction.content);
    for (const url of contentLinks) {
      if (linkFixes.hasOwnProperty(url)) {
        brokenLinks.push({
          type: 'instruction',
          id: instruction.id,
          slug: instruction.slug,
          title: instruction.title,
          field: 'content',
          oldUrl: url,
          newUrl: linkFixes[url],
        });
      }
    }

    // Check description field
    const descLinks = extractLinks(instruction.description);
    for (const url of descLinks) {
      if (linkFixes.hasOwnProperty(url)) {
        brokenLinks.push({
          type: 'instruction',
          id: instruction.id,
          slug: instruction.slug,
          title: instruction.title,
          field: 'description',
          oldUrl: url,
          newUrl: linkFixes[url],
        });
      }
    }
  }

  // Check Agents
  console.log('🤖 Checking Agents...');
  const agents = await prisma.agent.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { id: true, slug: true, title: true, content: true, description: true },
  });

  for (const agent of agents) {
    // Check content field
    const contentLinks = extractLinks(agent.content);
    for (const url of contentLinks) {
      if (linkFixes.hasOwnProperty(url)) {
        brokenLinks.push({
          type: 'agent',
          id: agent.id,
          slug: agent.slug,
          title: agent.title,
          field: 'content',
          oldUrl: url,
          newUrl: linkFixes[url],
        });
      }
    }

    // Check description field
    const descLinks = extractLinks(agent.description);
    for (const url of descLinks) {
      if (linkFixes.hasOwnProperty(url)) {
        brokenLinks.push({
          type: 'agent',
          id: agent.id,
          slug: agent.slug,
          title: agent.title,
          field: 'description',
          oldUrl: url,
          newUrl: linkFixes[url],
        });
      }
    }
  }

  // Check MCPs
  console.log('🔌 Checking MCPs...');
  const mcps = await prisma.mcpServer.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { id: true, slug: true, title: true, content: true, description: true, githubUrl: true, websiteUrl: true },
  });

  for (const mcp of mcps) {
    // Check content field
    const contentLinks = extractLinks(mcp.content);
    for (const url of contentLinks) {
      if (linkFixes.hasOwnProperty(url)) {
        brokenLinks.push({
          type: 'mcp',
          id: mcp.id,
          slug: mcp.slug,
          title: mcp.title,
          field: 'content',
          oldUrl: url,
          newUrl: linkFixes[url],
        });
      }
    }

    // Check description field
    const descLinks = extractLinks(mcp.description);
    for (const url of descLinks) {
      if (linkFixes.hasOwnProperty(url)) {
        brokenLinks.push({
          type: 'mcp',
          id: mcp.id,
          slug: mcp.slug,
          title: mcp.title,
          field: 'description',
          oldUrl: url,
          newUrl: linkFixes[url],
        });
      }
    }

    // Check githubUrl
    if (mcp.githubUrl && linkFixes.hasOwnProperty(mcp.githubUrl)) {
      brokenLinks.push({
        type: 'mcp',
        id: mcp.id,
        slug: mcp.slug,
        title: mcp.title,
        field: 'githubUrl',
        oldUrl: mcp.githubUrl,
        newUrl: linkFixes[mcp.githubUrl],
      });
    }

    // Check websiteUrl
    if (mcp.websiteUrl && linkFixes.hasOwnProperty(mcp.websiteUrl)) {
      brokenLinks.push({
        type: 'mcp',
        id: mcp.id,
        slug: mcp.slug,
        title: mcp.title,
        field: 'websiteUrl',
        oldUrl: mcp.websiteUrl,
        newUrl: linkFixes[mcp.websiteUrl],
      });
    }
  }

  console.log(`\n📊 Found ${brokenLinks.length} broken links to fix\n`);

  // Group by type and field for easier processing
  const grouped = new Map<string, BrokenLink[]>();
  for (const link of brokenLinks) {
    const key = `${link.type}:${link.id}:${link.field}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(link);
  }

  // Fix the links
  let fixed = 0;
  let removed = 0;

  for (const [key, links] of grouped.entries()) {
    const [type, id, field] = key.split(':');
    const link = links[0]; // All links in group have same type/id/field

    try {
      if (type === 'instruction') {
        const instruction = await prisma.instruction.findUnique({ where: { id } });
        if (!instruction) continue;

        let updated = false;
        let newContent = instruction.content;
        let newDescription = instruction.description;

        for (const brokenLink of links) {
          if (brokenLink.field === 'content') {
            if (brokenLink.newUrl) {
              newContent = newContent.replace(brokenLink.oldUrl, brokenLink.newUrl);
            } else {
              // Remove the link (convert markdown link to just text)
              newContent = newContent.replace(
                new RegExp(`\\[([^\\]]+)\\]\\(${escapeRegex(brokenLink.oldUrl)}\\)`, 'g'),
                '$1'
              );
              newContent = newContent.replace(brokenLink.oldUrl, '');
            }
            updated = true;
          } else if (brokenLink.field === 'description') {
            if (brokenLink.newUrl) {
              newDescription = newDescription.replace(brokenLink.oldUrl, brokenLink.newUrl);
            } else {
              newDescription = newDescription.replace(brokenLink.oldUrl, '');
            }
            updated = true;
          }
        }

        if (updated) {
          await prisma.instruction.update({
            where: { id },
            data: {
              content: newContent,
              description: newDescription,
            },
          });
          console.log(`✅ Fixed ${type} ${link.slug} (${link.field})`);
          fixed++;
          if (links.some(l => l.newUrl === null)) removed++;
        }
      } else if (type === 'agent') {
        const agent = await prisma.agent.findUnique({ where: { id } });
        if (!agent) continue;

        let updated = false;
        let newContent = agent.content;
        let newDescription = agent.description;

        for (const brokenLink of links) {
          if (brokenLink.field === 'content') {
            if (brokenLink.newUrl) {
              newContent = newContent.replace(brokenLink.oldUrl, brokenLink.newUrl);
            } else {
              newContent = newContent.replace(
                new RegExp(`\\[([^\\]]+)\\]\\(${escapeRegex(brokenLink.oldUrl)}\\)`, 'g'),
                '$1'
              );
              newContent = newContent.replace(brokenLink.oldUrl, '');
            }
            updated = true;
          } else if (brokenLink.field === 'description') {
            if (brokenLink.newUrl) {
              newDescription = newDescription.replace(brokenLink.oldUrl, brokenLink.newUrl);
            } else {
              newDescription = newDescription.replace(brokenLink.oldUrl, '');
            }
            updated = true;
          }
        }

        if (updated) {
          await prisma.agent.update({
            where: { id },
            data: {
              content: newContent,
              description: newDescription,
            },
          });
          console.log(`✅ Fixed ${type} ${link.slug} (${link.field})`);
          fixed++;
          if (links.some(l => l.newUrl === null)) removed++;
        }
      } else if (type === 'mcp') {
        const mcp = await prisma.mcpServer.findUnique({ where: { id } });
        if (!mcp) continue;

        let updated = false;
        let newContent = mcp.content;
        let newDescription = mcp.description;
        let newGithubUrl = mcp.githubUrl;
        let newWebsiteUrl = mcp.websiteUrl;

        for (const brokenLink of links) {
          if (brokenLink.field === 'content') {
            if (brokenLink.newUrl) {
              newContent = newContent.replace(brokenLink.oldUrl, brokenLink.newUrl);
            } else {
              newContent = newContent.replace(
                new RegExp(`\\[([^\\]]+)\\]\\(${escapeRegex(brokenLink.oldUrl)}\\)`, 'g'),
                '$1'
              );
              newContent = newContent.replace(brokenLink.oldUrl, '');
            }
            updated = true;
          } else if (brokenLink.field === 'description') {
            if (brokenLink.newUrl) {
              newDescription = newDescription.replace(brokenLink.oldUrl, brokenLink.newUrl);
            } else {
              newDescription = newDescription.replace(brokenLink.oldUrl, '');
            }
            updated = true;
          } else if (brokenLink.field === 'githubUrl') {
            newGithubUrl = brokenLink.newUrl;
            updated = true;
          } else if (brokenLink.field === 'websiteUrl') {
            newWebsiteUrl = brokenLink.newUrl;
            updated = true;
          }
        }

        if (updated) {
          await prisma.mcpServer.update({
            where: { id },
            data: {
              content: newContent,
              description: newDescription,
              githubUrl: newGithubUrl,
              websiteUrl: newWebsiteUrl,
            },
          });
          console.log(`✅ Fixed ${type} ${link.slug} (${link.field})`);
          fixed++;
          if (links.some(l => l.newUrl === null)) removed++;
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing ${type} ${link.slug}:`, error);
    }
  }

  console.log(`\n✨ Fixed ${fixed} items (${removed} links removed, ${fixed - removed} links updated)`);
  await prisma.$disconnect();
}

function extractLinks(text: string): string[] {
  const links: string[] = [];
  
  // Match markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    const url = match[2].trim();
    links.push(url);
    // Also add normalized versions (with/without trailing slash)
    if (url.endsWith('/')) {
      links.push(url.slice(0, -1));
    } else {
      links.push(url + '/');
    }
  }
  
  // Match plain URLs: https://...
  const urlRegex = /https?:\/\/[^\s\)]+/g;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0].replace(/[.,;!?]+$/, '').trim(); // Remove trailing punctuation
    links.push(url);
    // Also add normalized versions
    if (url.endsWith('/')) {
      links.push(url.slice(0, -1));
    } else {
      links.push(url + '/');
    }
  }
  
  return [...new Set(links)]; // Remove duplicates
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

findAndFixBrokenLinks().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

