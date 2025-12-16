import { PrismaClient, ContentStatus, Difficulty } from '@prisma/client';
import { Octokit } from '@octokit/rest';

const prisma = new PrismaClient();
// Use GitHub token if available, otherwise use unauthenticated requests
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface McpServerData {
  name: string;
  description: string;
  githubUrl: string;
  websiteUrl?: string;
  tags: string[];
  category?: string;
  installCommand?: string;
  configExample?: string;
}

// Parse MCP entries from awesome-mcp-servers README
async function fetchMcpServers(): Promise<McpServerData[]> {
  const owner = 'punkpeye';
  const repo = 'awesome-mcp-servers';
  const path = 'README.md';

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: 'main',
    });

    // Handle different response types
    if (Array.isArray(data)) {
      console.error('Expected file but got directory');
      return [];
    }

    if (data.type !== 'file' || !data.content) {
      console.error('File content not available');
      return [];
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const mcps: McpServerData[] = [];

    console.log(`📄 README content length: ${content.length} characters`);
    console.log(`📄 First 500 characters:\n${content.substring(0, 500)}`);

    // Parse markdown list items
    // Format: * [name](url) 🐍 ☁️ - description
    // Or: * [name](url) - description
    const lines = content.split('\n');
    console.log(`📄 Total lines: ${lines.length}`);
    let currentCategory = '';
    let inCodeBlock = false;
    let listItemCount = 0;
    let inServerImplementationsSection = false;
    let hasSeenSubCategory = false; // Track if we've seen actual sub-categories (not just TOC)

    for (const line of lines) {
      // Skip code blocks
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      // Detect "Server Implementations" section - this is where the MCP servers are
      if (line.startsWith('## ') && line.toLowerCase().includes('server implementation')) {
        inServerImplementationsSection = true;
        currentCategory = 'server';
        console.log('✅ Found "Server Implementations" section');
        continue;
      }

      // Stop parsing if we hit another main section (##) after Server Implementations
      // But only stop if we've seen actual sub-categories AND parsed at least some servers
      // This prevents stopping at "Frameworks" in the table of contents
      if (inServerImplementationsSection && line.startsWith('## ')) {
        const sectionName = line.replace('## ', '').trim().toLowerCase();
        // Only stop if:
        // 1. We've seen sub-categories (past the TOC)
        // 2. We've processed enough items to be past the TOC (or found actual servers)
        // 3. This is a new main section (not Server Implementations)
        const shouldStop = hasSeenSubCategory && 
            (listItemCount > 50 || mcps.length > 0) && // Past TOC if we've processed many items or found servers
            currentCategory !== 'server' && 
            !sectionName.includes('server') && 
            (sectionName.includes('framework') || 
             sectionName.includes('tips') || 
             sectionName.includes('star history') ||
             sectionName.includes('about'));
             
        if (shouldStop) {
          console.log(`⏹️  Stopping at section: ${sectionName} (after parsing ${mcps.length} servers, ${listItemCount} items processed)`);
          inServerImplementationsSection = false;
          break;
        } else if (hasSeenSubCategory && sectionName.includes('framework')) {
          // Log why we're not stopping
          console.log(`⚠️  Found "Frameworks" but not stopping yet (hasSeenSubCategory: ${hasSeenSubCategory}, listItemCount: ${listItemCount}, mcps.length: ${mcps.length})`);
        }
      }

      // Only parse list items if we're in the Server Implementations section
      if (!inServerImplementationsSection) {
        continue;
      }

      // Detect sub-category headers (### Subcategory) - these are the actual categories
      if (line.startsWith('### ')) {
        let categoryText = line.replace('### ', '').trim();
        // Remove HTML anchor tags like <a name="..."></a>
        categoryText = categoryText.replace(/<a\s+name="[^"]*"><\/a>/gi, '').trim();
        // Remove any emoji or special characters from category name
        const cleanCategory = categoryText.replace(/^[^\w\s&]+/, '').trim();
        currentCategory = cleanCategory.toLowerCase();
        hasSeenSubCategory = true; // Mark that we've seen actual sub-categories
        continue;
      }

      // Skip notes, tips, and other non-server entries
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('* Note') || 
          trimmedLine.startsWith('* Tip') ||
          trimmedLine.startsWith('* [Server Implementations') ||
          trimmedLine.startsWith('* [Frameworks') ||
          trimmedLine.startsWith('* [Tips') ||
          trimmedLine.toLowerCase().includes('quickstart') ||
          trimmedLine.toLowerCase().includes('reddit') ||
          trimmedLine.toLowerCase().includes('discord') ||
          trimmedLine.toLowerCase().includes('setup claude')) {
        continue;
      }
      
      // Skip table of contents items FIRST (they have emoji + dash + link to anchor)
      // Format: * 🔗 - [Aggregators](#aggregators)
      if (trimmedLine.match(/^\*\s+[^\s\[\]]+\s+-\s+\[[^\]]+\]\(#/)) {
        continue;
      }
      
      // MCP servers are in two formats:
      // 1. Old format: * [name](url) - description
      // 2. New format: * owner/repo emojis - description (from the website HTML)
      
      // Try markdown link format first
      let listItemMatch = line.match(/^\s*\*\s+(?:`)?\[([^\]]+)\](?:`)?\(([^)]+)\)/);
      let name = '';
      let url = '';
      
      if (listItemMatch) {
        [, name, url] = listItemMatch;
        listItemCount++;
        
        // Skip if it's a TOC link (anchor)
        if (url.startsWith('#')) {
          continue;
        }
      } else {
        // Try new format: * owner/repo emojis - description
        // Match: * word/word (before emojis or spaces)
        const newFormatMatch = line.match(/^\s*\*\s+([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)\s/);
        if (newFormatMatch) {
          [, name] = newFormatMatch;
          url = `https://github.com/${name}`;
          listItemCount++;
        } else {
          // No match, not a valid server entry
          continue;
        }
      }
      
      // Skip if it's a section header or navigation link
      const nameLower = name.toLowerCase();
      const skipHeaders = [
        'what is mcp',
        'clients',
        'tutorials',
        'community',
        'legend',
        'server implementations',
        'frameworks',
        'tips & tricks',
        'tips and tricks',
        'model context protocol',
        'setup claude desktop',
        'reddit',
        'discord',
        'quickstart',
        'youtube',
        'youtu.be',
      ];
      
      // Skip navigation links and section headers
      if (skipHeaders.some(header => nameLower.includes(header)) || name.length < 3) {
        continue;
      }
      
      // Skip if it's a link to a section anchor (starts with #)
      // These are table of contents links, not actual MCP servers
      if (url.startsWith('#')) {
        continue;
      }
      
      // Skip if the name looks like a category name (usually single word or short)
      // Real MCP servers usually have owner/repo format
      if (!name.includes('/') && name.length < 8 && !name.includes('-')) {
        continue;
      }
      
      // Must be a GitHub URL to be a valid MCP server
      // Handle both absolute URLs and relative paths
      let fullUrl = url;
      if (!url.startsWith('http')) {
        if (url.startsWith('/')) {
          fullUrl = `https://github.com${url}`;
        } else if (url.includes('/')) {
          fullUrl = `https://github.com/${url}`;
        } else {
          fullUrl = `https://github.com/${owner}/${url}`;
        }
      }
      
      // Only process GitHub URLs
      if (!fullUrl.includes('github.com')) {
        continue;
      }
      
      // Debug: log first few valid items found
      if (listItemCount <= 5) {
        console.log(`  🔍 Found item ${listItemCount}: [${name}](${fullUrl.substring(0, 60)}...)`);
      }
        
        // Extract everything after the link
        const afterLink = line.substring(line.indexOf(')') + 1).trim();
        
        // Split by ' - ' to separate emojis/tags from description
        let description = afterLink;
        if (afterLink.includes(' - ')) {
          const parts = afterLink.split(' - ');
          description = parts.slice(1).join(' - ').trim();
        }
        
        // If no description after ' - ', use the whole afterLink (might be description only)
        if (!description && afterLink) {
          description = afterLink;
        }
        
        // Clean description - remove leading emojis and extra spaces
        description = description.replace(/^[🐍📇☁️🏠🍎🪟🐧🏎️☕🎖️🦀\s]+/, '').trim();
        
        // Skip if no meaningful description (likely a header or navigation)
        // Real MCP servers should have at least 10 characters of description
        // But allow shorter if it has emojis (which were removed)
        if (!description || (description.length < 10 && !afterLink.includes('🐍') && !afterLink.includes('📇'))) {
          continue;
        }
        
        // Additional validation: name should look like a repo (contains / or is a valid package name)
        // Most MCP servers have format owner/repo-name
        // But allow single names if they're long enough (package names)
        if (!name.includes('/') && name.length < 4) {
          continue;
        }
        // Extract tags from emoji indicators in the line
        const tags: string[] = [];
        
        // Check for emojis in the line
        if (line.includes('🐍')) tags.push('python');
        if (line.includes('📇')) tags.push('typescript');
        if (line.includes('☁️')) tags.push('cloud');
        if (line.includes('🏠')) tags.push('local');
        if (line.includes('🍎')) tags.push('macos');
        if (line.includes('🪟')) tags.push('windows');
        if (line.includes('🐧')) tags.push('linux');
        if (line.includes('🏎️')) tags.push('rust');
        if (line.includes('☕')) tags.push('java');
        if (line.includes('🎖️')) tags.push('enterprise');
        if (line.includes('🦀')) tags.push('rust');

        // Extract category from description or use current category
        let category = currentCategory;
        const descLower = description.toLowerCase();
        if (descLower.includes('database') || tags.includes('database')) category = 'database';
        if (descLower.includes('api') || tags.includes('api')) category = 'api';
        if (descLower.includes('productivity') || tags.includes('productivity')) category = 'productivity';
        if (descLower.includes('cloud') || tags.includes('cloud')) category = 'cloud';
        if (descLower.includes('ai') || tags.includes('ai')) category = 'ai';
        if (descLower.includes('devops') || tags.includes('devops')) category = 'devops';

        // Use the full GitHub URL we already constructed
        const githubUrl = fullUrl;

        // Generate install command from GitHub URL
        let installCommand = '';
        if (githubUrl.includes('github.com')) {
          const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git|\/|$)/);
          if (repoMatch) {
            const [, repoOwner, repoName] = repoMatch;
            // Common patterns for MCP servers
            if (repoName.includes('mcp') || repoName.includes('server')) {
              installCommand = `npx -y ${repoOwner}/${repoName}`;
            } else {
              installCommand = `npx -y @${repoOwner}/${repoName}`;
            }
          }
        }

        // Generate config example
        const configExample = JSON.stringify({
          name: name.toLowerCase().replace(/\s+/g, '-'),
          command: installCommand.split(' ')[0] || 'npx',
          args: installCommand.split(' ').slice(1) || [],
        }, null, 2);

      mcps.push({
        name: name.trim(),
        description: description,
        githubUrl: githubUrl,
        tags: [...new Set([...tags, category].filter(Boolean))],
        category: category || undefined,
        installCommand: installCommand || undefined,
        configExample: configExample,
      });
    }

    console.log(`📝 Found ${listItemCount} list items in Server Implementations section`);
    console.log(`📝 Parsed ${mcps.length} valid MCP server entries`);
    if (mcps.length === 0) {
      console.log('⚠️  No MCPs found. Debugging info:');
      const serverSectionStart = lines.findIndex(l => l.toLowerCase().includes('server implementation') && l.startsWith('##'));
      if (serverSectionStart >= 0) {
        console.log(`📍 Server Implementations section starts at line ${serverSectionStart + 1}`);
        // Look for content in a wider range
        const serverSectionLines = lines.slice(serverSectionStart, Math.min(serverSectionStart + 500, lines.length));
        
        // Find the first sub-category (###)
        const firstSubCategoryIndex = serverSectionLines.findIndex(l => l.startsWith('### '));
        console.log(`📍 First sub-category at line ${serverSectionStart + firstSubCategoryIndex + 1}`);
        
        if (firstSubCategoryIndex >= 0) {
          // Look for list items AFTER the first sub-category
          const afterSubCategory = serverSectionLines.slice(firstSubCategoryIndex, firstSubCategoryIndex + 100);
          const allListItems = afterSubCategory.filter(l => l.trim().startsWith('* '));
          
          console.log(`\n📋 Found ${allListItems.length} list items in first 100 lines after first sub-category:`);
          allListItems.slice(0, 20).forEach((line, i) => {
            // Try both formats
            const markdownMatch = line.match(/^\s*\*\s+(?:`)?\[([^\]]+)\](?:`)?\(([^)]+)\)/);
            const newFormatMatch = line.match(/^\s*\*\s+([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)\s/);
            
            if (markdownMatch) {
              const [, name, url] = markdownMatch;
              console.log(`  ${i + 1}. [OLD FORMAT] [${name.substring(0, 30)}](${url.substring(0, 30)})`);
            } else if (newFormatMatch) {
              const [, repo] = newFormatMatch;
              console.log(`  ${i + 1}. [NEW FORMAT] ${repo} - ${line.substring(0, 80)}...`);
            } else {
              console.log(`  ${i + 1}. [NO MATCH] ${line.substring(0, 100)}`);
            }
          });
        }
        
        // Look for sub-categories
        const subCategories = serverSectionLines.filter(l => l.startsWith('### ')).slice(0, 5);
        console.log(`\n📁 First 5 sub-categories found:`);
        subCategories.forEach((cat, i) => {
          console.log(`  ${i + 1}. ${cat.replace('### ', '').trim()}`);
        });
      } else {
        console.log('❌ Could not find Server Implementations section');
      }
    } else {
      console.log(`\n📋 Sample of first 3 MCPs to be imported:`);
      mcps.slice(0, 3).forEach((mcp, i) => {
        console.log(`  ${i + 1}. ${mcp.name} - ${mcp.description.substring(0, 60)}...`);
      });
    }

    return mcps;
  } catch (error) {
    console.error('Error fetching MCP servers:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    return [];
  }
}

/**
 * Extract GitHub username from GitHub URL
 * Format: https://github.com/username/repo
 */
function extractGitHubUsernameFromUrl(githubUrl: string | null | undefined): string | null {
  if (!githubUrl) return null;
  
  try {
    const match = githubUrl.match(/github\.com\/([^/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Find author by GitHub username
 */
async function findAuthorByGitHubUsername(githubUsername: string | null | undefined) {
  if (!githubUsername) return null;
  
  try {
    const user = await prisma.user.findFirst({
      where: { 
        githubUsername: githubUsername.toLowerCase().trim()
      } as any, // Type assertion needed until Prisma types fully update
    });
    return user;
  } catch (error) {
    console.error(`Error finding author by GitHub username ${githubUsername}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting MCP servers import...');

  // Get or create import user (fallback)
  const importUser = await prisma.user.upsert({
    where: { email: 'import@copilothub.com' },
    update: {},
    create: {
      email: 'import@copilothub.com',
      name: 'MCP Importer',
      role: 'ADMIN',
    },
  });

  console.log('📥 Fetching MCP servers from awesome-mcp-servers...');
  const mcps = await fetchMcpServers();
  console.log(`📦 Found ${mcps.length} MCP servers to import`);

  let imported = 0;
  let skipped = 0;
  let matchedAuthors = 0;

  for (const mcpData of mcps) {
    try {
      // Generate slug
      const slug = mcpData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      // Check if already exists
      const existing = await (prisma as any).mcpServer.findUnique({
        where: { slug },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Try to find author by GitHub username
      const githubUsername = extractGitHubUsernameFromUrl(mcpData.githubUrl);
      let author = importUser;
      
      if (githubUsername) {
        const matchedAuthor = await findAuthorByGitHubUsername(githubUsername);
        if (matchedAuthor) {
          author = matchedAuthor;
          matchedAuthors++;
          console.log(`  📌 Matched author: ${githubUsername} for "${mcpData.name}"`);
        }
      }

      // Create MCP server
      await (prisma as any).mcpServer.create({
        data: {
          title: mcpData.name,
          slug,
          description: mcpData.description,
          content: `# ${mcpData.name}\n\n${mcpData.description}\n\nGitHub: ${mcpData.githubUrl}`,
          githubUrl: mcpData.githubUrl,
          websiteUrl: mcpData.websiteUrl,
          tags: mcpData.tags,
          category: mcpData.category,
          installCommand: mcpData.installCommand,
          configExample: mcpData.configExample,
          difficulty: Difficulty.INTERMEDIATE,
          status: ContentStatus.APPROVED,
          authorId: author.id,
        },
      });

      imported++;
      console.log(`✅ Imported: ${mcpData.name}`);
    } catch (error) {
      console.error(`❌ Error importing ${mcpData.name}:`, error);
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Matched authors: ${matchedAuthors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

