import { PrismaClient, ContentStatus, Difficulty } from '@prisma/client';
import { Octokit } from '@octokit/rest';

const prisma = new PrismaClient();
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

interface McpServerData {
  name: string;
  description: string;
  githubUrl: string;
  tags: string[];
  category?: string;
  installCommand?: string;
  configExample?: string;
}

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

    if (Array.isArray(data) || data.type !== 'file' || !data.content) {
      console.error('File content not available');
      return [];
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const mcps: McpServerData[] = [];
    const lines = content.split('\n');

    console.log(`📄 README content length: ${content.length} characters`);
    console.log(`📄 Total lines: ${lines.length}`);

    // Debug: Find lines that look like GitHub repos (owner/repo)
    const repoLines = lines.filter(l => {
      // Look for pattern: word/word (GitHub repo format)
      return /[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/.test(l) && !l.includes('github.com/punkpeye');
    });
    
    console.log(`\n📋 Found ${repoLines.length} lines with potential GitHub repos (owner/repo format):`);
    
    // Show first 30
    repoLines.slice(0, 30).forEach((line, i) => {
      console.log(`  ${i + 1}. ${line.substring(0, 150)}`);
    });
    
    if (repoLines.length > 30) {
      console.log(`  ... and ${repoLines.length - 30} more lines`);
    }

    let currentCategory = 'general';
    let matchAttempts = 0;
    
    for (const line of lines) {
      // Debug: count lines that start with - (dashes, not asterisks!)
      if (line.trim().startsWith('- ')) {
        matchAttempts++;
      }
      // Track current category from ### headers
      if (line.startsWith('### ')) {
        const categoryText = line.replace('### ', '').trim();
        const cleanCategory = categoryText.replace(/<a\s+name="[^"]*"><\/a>/gi, '').replace(/^[^\w\s&]+/, '').trim();
        currentCategory = cleanCategory.toLowerCase();
        continue;
      }

      // MCP servers use DASHES (-), not asterisks (*)
      // Format: - [owner/repo](url) emojis - description
      const match = line.match(/^\s*-\s+\[([a-zA-Z0-9_.\-]+\/[a-zA-Z0-9_.\-]+)\]\(([^)]+)\)/);
      
      if (match) {
        const [, repoPath, githubUrl] = match;
        
        // Extract everything after the closing parenthesis
        const afterLink = line.substring(line.indexOf(')') + 1).trim();
        
        // Extract description (everything after " - ")
        let description = '';
        if (afterLink.includes(' - ')) {
          description = afterLink.split(' - ').slice(1).join(' - ').trim();
        }
        
        // Skip if no description (probably a false positive)
        if (!description || description.length < 10) {
          continue;
        }

        // Extract tags from emojis
        const tags: string[] = [];
        if (line.includes('🐍')) tags.push('python');
        if (line.includes('📇')) tags.push('typescript');
        if (line.includes('☁️')) tags.push('cloud');
        if (line.includes('🏠')) tags.push('local');
        if (line.includes('🍎')) tags.push('macos');
        if (line.includes('🪟')) tags.push('windows');
        if (line.includes('🐧')) tags.push('linux');
        if (line.includes('🏎️') || line.includes('🦀')) tags.push('rust');
        if (line.includes('☕')) tags.push('java');
        if (line.includes('🎖️')) tags.push('enterprise');

        // Use the actual GitHub URL from the link
        const actualGithubUrl = githubUrl.startsWith('http') ? githubUrl : `https://github.com/${githubUrl}`;
        const installCommand = `npx -y ${repoPath}`;
        
        const configExample = JSON.stringify({
          name: repoPath.split('/')[1],
          command: 'npx',
          args: ['-y', repoPath],
        }, null, 2);

        mcps.push({
          name: repoPath,
          description,
          githubUrl: actualGithubUrl,
          tags: [...new Set([...tags, currentCategory].filter(Boolean))],
          category: currentCategory || undefined,
          installCommand,
          configExample,
        });

        if (mcps.length <= 3) {
          console.log(`✅ Found: ${repoPath} - ${description.substring(0, 50)}...`);
        }
      }
    }

    console.log(`\n📊 Stats:`);
    console.log(`   Lines starting with - (dash): ${matchAttempts}`);
    console.log(`   MCP servers found: ${mcps.length}`);
    return mcps;
  } catch (error) {
    console.error('Error fetching MCP servers:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return [];
  }
}

async function main() {
  console.log('🚀 Starting MCP servers import (SIMPLE VERSION)...\n');

  const importUser = await prisma.user.upsert({
    where: { email: 'import@copilothub.com' },
    update: {},
    create: {
      email: 'import@copilothub.com',
      name: 'MCP Importer',
      role: 'ADMIN',
    },
  });

  console.log('📥 Fetching MCP servers from awesome-mcp-servers...\n');
  const mcps = await fetchMcpServers();

  if (mcps.length === 0) {
    console.log('❌ No MCPs found to import');
    return;
  }

  let imported = 0;
  let skipped = 0;

  for (const mcpData of mcps) {
    try {
      const slug = mcpData.name
        .toLowerCase()
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const existing = await (prisma as any).mcpServer.findUnique({
        where: { slug },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await (prisma as any).mcpServer.create({
        data: {
          title: mcpData.name,
          slug,
          description: mcpData.description,
          content: `# ${mcpData.name}\n\n${mcpData.description}\n\nGitHub: ${mcpData.githubUrl}`,
          githubUrl: mcpData.githubUrl,
          tags: mcpData.tags,
          category: mcpData.category,
          installCommand: mcpData.installCommand,
          configExample: mcpData.configExample,
          difficulty: Difficulty.INTERMEDIATE,
          status: ContentStatus.APPROVED,
          authorId: importUser.id,
        },
      });

      imported++;
      if (imported <= 5 || imported % 50 === 0) {
        console.log(`✅ Imported (${imported}): ${mcpData.name}`);
      }
    } catch (error) {
      console.error(`❌ Error importing ${mcpData.name}:`, error);
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

