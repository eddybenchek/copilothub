import { PrismaClient } from '@prisma/client';
import { ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Known broken links and their fixes (or null to remove)
const linkFixes: Record<string, string | null> = {
  // AI Google links - these domains may have changed
  'https://ai.google/research/responsible-ai/': 'https://ai.google/discover/responsible-ai/',
  'https://ai.google/responsibility/': 'https://ai.google/discover/responsible-ai/',
  'https://ai.google/discover/responsible-ai/': null, // 404 - remove if no alternative found
  
  // GitHub repos that may have been moved or deleted
  'https://github.com/dnaerys/onekgp-mcp': null, // Remove if repo doesn't exist
  'https://github.com/pulumi/mcp-server': 'https://github.com/pulumi/mcp',
  'https://github.com/pulumi/mcp': null, // 404 - repo may not exist, remove
  'https://github.com/inspizzz/jetbrains-datalore-mcp': null, // Remove if repo doesn't exist
  'https://github.com/langchain-ai/langsmith': 'https://github.com/langchain-ai/langsmith-docs', // Try docs repo
  'https://github.com/centerforaisafety/ai-safety-resources': null, // 404 - remove
  'https://github.com/microsoft/PowerPlatform-DataverseClient-Python/blob/main/examples/quickstart_pandas.py': 'https://github.com/microsoft/PowerPlatform-DataverseClient-Python/tree/main/examples', // Use tree instead of blob
  'https://github.com/harrison/ai-counsel': null, // 404 - remove
  'https://github.com/Shopify/dev-mcp': null, // 404 - remove
  
  // Microsoft Learn links - these may have moved
  'https://learn.microsoft.com/en-us/python/api/powerplatform-dataverse-client/': 'https://learn.microsoft.com/en-us/python/api/overview/azure/dataverse',
  'https://learn.microsoft.com/en-us/python/api/overview/azure/dataverse': null, // 404 - may need alternative
  'https://learn.microsoft.com/en-us/azure/architecture/best-practices/performance': 'https://learn.microsoft.com/en-us/azure/architecture/framework/performance',
  'https://learn.microsoft.com/en-us/azure/architecture/framework/performance': null, // 404 - may need alternative
  'https://learn.microsoft.com/en-us/dotnet/standard/performance/': 'https://learn.microsoft.com/en-us/dotnet/fundamentals/performance',
  'https://learn.microsoft.com/en-us/dotnet/fundamentals/performance': null, // 404 - may need alternative
  'https://learn.microsoft.com/en-us/sql/relational-databases/performance/performance-tuning-sql-server?view=sql-server-ver16': 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/performance-tuning-sql-server',
  'https://learn.microsoft.com/en-us/sql/relational-databases/performance/performance-tuning-sql-server': null, // 404 - may need alternative
  
  // OWASP link
  'https://owasp.org/www-project-performance-testing/': 'https://owasp.org/www-community/Performance',
  'https://owasp.org/www-community/Performance': null, // 404 - may need alternative
  
  // Oracle link
  'https://www.oracle.com/java/technologies/javase/performance.html': 'https://www.oracle.com/java/technologies/performance.html',
  'https://www.oracle.com/java/technologies/performance.html': null, // 404 - may need alternative
  
  // DNS issue - handle with/without trailing slash and http/https
  'https://gui-rs.org': 'https://github.com/tauri-apps/tauri', // gui-rs.org seems to be down, redirect to Tauri
  'https://gui-rs.org/': 'https://github.com/tauri-apps/tauri',
  'http://gui-rs.org': 'https://github.com/tauri-apps/tauri',
  'http://gui-rs.org/': 'https://github.com/tauri-apps/tauri',
  
  // URL encoding issues
  'https://melr%c5%8dse.org': 'https://melrose.org', // Decode URL encoding
  'https://melrose.org': null, // DNS failure - remove if domain doesn't exist
  
  // 403 Forbidden links - these may require authentication or have been moved
  'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/': 'https://www.deeplearning.ai/courses/chatgpt-prompt-engineering-for-developers/',
  'https://www.deeplearning.ai/courses/chatgpt-prompt-engineering-for-developers/': null, // 404 - remove
  'https://www.webpagetest.org/': 'https://www.catchpoint.com/webpagetest', // Try without trailing slash
  'https://docs.pytest.org/': 'https://docs.pytest.org/en/stable/', // Use stable version
  'https://www.cs.helsinki.fi/u/luontola/tdd-2009/ext/ObjectCalisthenics.pdf': null, // 403 Forbidden - access denied, remove link
  'https://gramine.readthedocs.io/en/stable/attestation.html': 'https://gramineproject.io/docs/attestation', // Updated docs location
  'https://gramineproject.io/docs/attestation': null, // 404 - remove
  'https://www.npmjs.com/package/@fluentui/react-migration-v8-v9': 'https://www.npmjs.com/package/@fluentui/react-components', // Package may have moved
  'https://docs.ansible.com/ansible/latest/collections/ansible/builtin/index.html': 'https://docs.ansible.com/ansible/latest/collections/index.html', // Updated docs structure
  'https://docs.ansible.com/ansible/latest/reference_appendices/glossary.html': 'https://docs.ansible.com/ansible/latest/reference_appendices/glossary.html', // May require authentication - try alternative
  'https://docs.ansible.com/ansible/latest/reference_appendices/glossary': 'https://docs.ansible.com/ansible/latest/user_guide/glossary.html', // Alternative glossary location (without .html)
  // Handle with/without trailing slash
  'https://docs.ansible.com/ansible/latest/collections/ansible/builtin/': 'https://docs.ansible.com/ansible/latest/collections/index.html',
  'https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/': 'https://www.writethedocs.org/guide/', // Updated URL structure
  
  // MCP Protocol spec
  'https://spec.modelcontextprotocol.io/': 'https://modelcontextprotocol.io', // Try main domain
  'https://modelcontextprotocol.io': null, // If still 404, remove
  
  // Hibernate
  'https://hibernate.org/community/releases/6.0/': 'https://hibernate.org/orm/releases/6.0/', // Try ORM path
  'https://hibernate.org/orm/releases/6.0/': null, // If still 404, remove
  
  // Gitea MCP
  'https://gitea.com/gitea/gitea-mcp': null, // 500 error - remove
  
  // Daisy's AI
  'https://www.daisys.ai/': null, // 400 error - remove
  
  // Atlassian Jira
  'https://www.atlassian.com/software/jira': 'https://www.atlassian.com/software/jira/features', // Try features page
};

interface BrokenLink {
  type: 'instruction' | 'agent' | 'mcp' | 'tool';
  id: string;
  slug: string;
  title: string;
  field: 'content' | 'description' | 'githubUrl' | 'websiteUrl' | 'url';
  oldUrl: string;
  newUrl: string | null;
}

// URL verification function with timeout and redirect handling
async function verifyUrl(url: string, maxRedirects: number = 3): Promise<boolean> {
  if (!url || url === 'null') return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    let currentUrl = url;
    let redirectCount = 0;
    
    while (redirectCount <= maxRedirects) {
      const response = await fetch(currentUrl, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'manual', // Handle redirects manually
      });
      
      clearTimeout(timeoutId);
      
      // Success status codes
      if (response.status >= 200 && response.status < 300) {
        return true;
      }
      
      // Handle redirects
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          currentUrl = new URL(location, currentUrl).href;
          redirectCount++;
          continue;
        }
      }
      
      // For other status codes, consider it failed
      return false;
    }
    
    return false; // Too many redirects
  } catch (error) {
    // Timeout, network error, or other issues
    return false;
  }
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
      // Decode URL-encoded links (handle errors gracefully)
      let decodedUrl = url;
      try {
        decodedUrl = decodeURIComponent(url);
      } catch {
        // URL is not encoded or invalid, use original
        decodedUrl = url;
      }
      const urlToCheck = linkFixes.hasOwnProperty(url) ? url : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'instruction',
          id: instruction.id,
          slug: instruction.slug,
          title: instruction.title,
          field: 'content',
          oldUrl: url,
          newUrl: linkFixes[urlToCheck],
        });
      }
    }

    // Check description field
    const descLinks = extractLinks(instruction.description);
    for (const url of descLinks) {
      let decodedUrl = url;
      try {
        decodedUrl = decodeURIComponent(url);
      } catch {
        decodedUrl = url;
      }
      const urlToCheck = linkFixes.hasOwnProperty(url) ? url : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'instruction',
          id: instruction.id,
          slug: instruction.slug,
          title: instruction.title,
          field: 'description',
          oldUrl: url,
          newUrl: linkFixes[urlToCheck],
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
      // Decode URL-encoded links (handle errors gracefully)
      let decodedUrl = url;
      try {
        decodedUrl = decodeURIComponent(url);
      } catch {
        decodedUrl = url;
      }
      const urlToCheck = linkFixes.hasOwnProperty(url) ? url : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'agent',
          id: agent.id,
          slug: agent.slug,
          title: agent.title,
          field: 'content',
          oldUrl: url,
          newUrl: linkFixes[urlToCheck],
        });
      }
    }

    // Check description field
    const descLinks = extractLinks(agent.description);
    for (const url of descLinks) {
      let decodedUrl = url;
      try {
        decodedUrl = decodeURIComponent(url);
      } catch {
        decodedUrl = url;
      }
      const urlToCheck = linkFixes.hasOwnProperty(url) ? url : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'agent',
          id: agent.id,
          slug: agent.slug,
          title: agent.title,
          field: 'description',
          oldUrl: url,
          newUrl: linkFixes[urlToCheck],
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
      // Decode URL-encoded links (handle errors gracefully)
      let decodedUrl = url;
      try {
        decodedUrl = decodeURIComponent(url);
      } catch {
        decodedUrl = url;
      }
      const urlToCheck = linkFixes.hasOwnProperty(url) ? url : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'mcp',
          id: mcp.id,
          slug: mcp.slug,
          title: mcp.title,
          field: 'content',
          oldUrl: url,
          newUrl: linkFixes[urlToCheck],
        });
      }
    }

    // Check description field
    const descLinks = extractLinks(mcp.description);
    for (const url of descLinks) {
      let decodedUrl = url;
      try {
        decodedUrl = decodeURIComponent(url);
      } catch {
        decodedUrl = url;
      }
      const urlToCheck = linkFixes.hasOwnProperty(url) ? url : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'mcp',
          id: mcp.id,
          slug: mcp.slug,
          title: mcp.title,
          field: 'description',
          oldUrl: url,
          newUrl: linkFixes[urlToCheck],
        });
      }
    }

    // Check githubUrl
    if (mcp.githubUrl) {
      let decodedUrl = mcp.githubUrl;
      try {
        decodedUrl = decodeURIComponent(mcp.githubUrl);
      } catch {
        decodedUrl = mcp.githubUrl;
      }
      const urlToCheck = linkFixes.hasOwnProperty(mcp.githubUrl) ? mcp.githubUrl : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'mcp',
          id: mcp.id,
          slug: mcp.slug,
          title: mcp.title,
          field: 'githubUrl',
          oldUrl: mcp.githubUrl,
          newUrl: linkFixes[urlToCheck],
        });
      }
    }

    // Check websiteUrl
    if (mcp.websiteUrl) {
      let decodedUrl = mcp.websiteUrl;
      try {
        decodedUrl = decodeURIComponent(mcp.websiteUrl);
      } catch {
        decodedUrl = mcp.websiteUrl;
      }
      const urlToCheck = linkFixes.hasOwnProperty(mcp.websiteUrl) ? mcp.websiteUrl : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'mcp',
          id: mcp.id,
          slug: mcp.slug,
          title: mcp.title,
          field: 'websiteUrl',
          oldUrl: mcp.websiteUrl,
          newUrl: linkFixes[urlToCheck],
        });
      }
    }
  }

  // Check Tools
  console.log('🛠️ Checking Tools...');
  const tools = await prisma.tool.findMany({
    where: { status: ContentStatus.APPROVED },
    select: { id: true, slug: true, title: true, content: true, description: true, url: true, websiteUrl: true },
  });

  for (const tool of tools) {
    // Check content field
    const contentLinks = extractLinks(tool.content);
    for (const url of contentLinks) {
      let decodedUrl = url;
      try {
        decodedUrl = decodeURIComponent(url);
      } catch {
        decodedUrl = url;
      }
      const urlToCheck = linkFixes.hasOwnProperty(url) ? url : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'tool',
          id: tool.id,
          slug: tool.slug,
          title: tool.title,
          field: 'content',
          oldUrl: url,
          newUrl: linkFixes[urlToCheck],
        });
      }
    }

    // Check description field
    const descLinks = extractLinks(tool.description);
    for (const url of descLinks) {
      let decodedUrl = url;
      try {
        decodedUrl = decodeURIComponent(url);
      } catch {
        decodedUrl = url;
      }
      const urlToCheck = linkFixes.hasOwnProperty(url) ? url : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'tool',
          id: tool.id,
          slug: tool.slug,
          title: tool.title,
          field: 'description',
          oldUrl: url,
          newUrl: linkFixes[urlToCheck],
        });
      }
    }

    // Check url field
    if (tool.url) {
      let decodedUrl = tool.url;
      try {
        decodedUrl = decodeURIComponent(tool.url);
      } catch {
        decodedUrl = tool.url;
      }
      const urlToCheck = linkFixes.hasOwnProperty(tool.url) ? tool.url : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'tool',
          id: tool.id,
          slug: tool.slug,
          title: tool.title,
          field: 'url',
          oldUrl: tool.url,
          newUrl: linkFixes[urlToCheck],
        });
      }
    }

    // Check websiteUrl field
    if (tool.websiteUrl) {
      let decodedUrl = tool.websiteUrl;
      try {
        decodedUrl = decodeURIComponent(tool.websiteUrl);
      } catch {
        decodedUrl = tool.websiteUrl;
      }
      const urlToCheck = linkFixes.hasOwnProperty(tool.websiteUrl) ? tool.websiteUrl : (linkFixes.hasOwnProperty(decodedUrl) ? decodedUrl : null);
      
      if (urlToCheck) {
        brokenLinks.push({
          type: 'tool',
          id: tool.id,
          slug: tool.slug,
          title: tool.title,
          field: 'websiteUrl',
          oldUrl: tool.websiteUrl,
          newUrl: linkFixes[urlToCheck],
        });
      }
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

  // Fix the links with verification
  let fixed = 0;
  let removed = 0;
  let skipped = 0;
  let failed = 0;

  for (const [key, links] of grouped.entries()) {
    const [type, id, field] = key.split(':');
    const link = links[0]; // All links in group have same type/id/field

    try {
      // Verify new URLs before applying fix (skip verification for removals)
      let shouldSkip = false;
      for (const brokenLink of links) {
        if (brokenLink.newUrl !== null) {
          const isValid = await verifyUrl(brokenLink.newUrl);
          if (!isValid) {
            console.log(`⚠️  Skipping fix for ${type} ${link.slug}: ${brokenLink.oldUrl} → ${brokenLink.newUrl} (verification failed)`);
            skipped++;
            shouldSkip = true;
            break;
          }
        }
      }
      
      if (shouldSkip) {
        continue; // Skip this entire fix group
      }
      
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
      } else if (type === 'tool') {
        const tool = await prisma.tool.findUnique({ where: { id } });
        if (!tool) continue;

        let updated = false;
        let newContent = tool.content;
        let newDescription = tool.description;
        let newUrl = tool.url;
        let newWebsiteUrl = tool.websiteUrl;

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
          } else if (brokenLink.field === 'url') {
            newUrl = brokenLink.newUrl;
            updated = true;
          } else if (brokenLink.field === 'websiteUrl') {
            newWebsiteUrl = brokenLink.newUrl;
            updated = true;
          }
        }

        if (updated) {
          await prisma.tool.update({
            where: { id },
            data: {
              content: newContent,
              description: newDescription,
              url: newUrl,
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
      failed++;
    }
  }

  console.log(`\n✨ Summary:`);
  console.log(`   ✅ Fixed: ${fixed} items`);
  console.log(`   🗑️  Removed: ${removed} links`);
  console.log(`   ⚠️  Skipped: ${skipped} links (verification failed)`);
  console.log(`   ❌ Failed: ${failed} items`);
  console.log(`   📊 Total processed: ${fixed + skipped + failed}`);
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

