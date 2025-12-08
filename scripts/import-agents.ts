import { Octokit } from '@octokit/rest';
import { PrismaClient, ContentStatus, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();
// Use GitHub token if available to increase rate limit (60 -> 5000/hour)
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});

interface CopilotAgent {
  name: string;
  description: string;
  content: string;
  category?: string;
  mcpServers: string[];
  languages: string[];
  frameworks: string[];
  tags: string[];
  vsCodeInstallUrl: string;
  vsCodeInsidersUrl: string;
  downloadUrl: string;
}

async function fetchAwesomeCopilotAgents(): Promise<CopilotAgent[]> {
  const owner = 'github';
  const repo = 'awesome-copilot';
  
  try {
    console.log('📥 Fetching agents from awesome-copilot...\n');
    
    // Fetch the agents directory
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'agents',
      ref: 'main',
    });

    if (!Array.isArray(contents)) {
      console.error('Expected an array of contents for agents directory.');
      return [];
    }

    const agents: CopilotAgent[] = [];

    for (const file of contents) {
      if (file.type === 'file' && file.name.endsWith('.agent.md')) {
        try {
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log(`  Fetching ${file.name}...`);
          
          const { data: fileData } = await octokit.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: 'main',
          });

          if (!Array.isArray(fileData) && 'type' in fileData && fileData.type === 'file' && fileData.content) {
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            
            // Extract title from filename
            const nameMatch = file.name.replace('.agent.md', '').replace(/-/g, ' ');
            
            // Extract description from first paragraph
            const descMatch = content.match(/^#\s+[^\n]+\n\n(.+?)(?:\n\n|$)/);
            const description = descMatch?.[1]?.replace(/\n/g, ' ') || nameMatch;
            
            // Generate URLs
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
            const vsCodeUrl = `vscode:chat-agent/install?url=${encodeURIComponent(rawUrl)}`;
            const vsCodeInsidersUrl = `vscode-insiders:chat-agent/install?url=${encodeURIComponent(rawUrl)}`;
            
            agents.push({
              name: nameMatch.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              description: description.substring(0, 200),
              content: content,
              category: extractCategory(content),
              mcpServers: extractMcpServers(content),
              languages: extractLanguages(content),
              frameworks: extractFrameworks(content),
              tags: extractTags(content, nameMatch),
              vsCodeInstallUrl: vsCodeUrl,
              vsCodeInsidersUrl: vsCodeInsidersUrl,
              downloadUrl: rawUrl,
            });
          }
        } catch (error: any) {
          console.error(`❌ Error fetching ${file.name}:`, error.message);
        }
      }
    }

    return agents;
  } catch (error: any) {
    console.error('❌ Error fetching agents:', error.message);
    return [];
  }
}

function extractCategory(content: string): string | undefined {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('security') || lowerContent.includes('vulnerability')) return 'Security';
  if (lowerContent.includes('test') || lowerContent.includes('testing')) return 'Testing';
  if (lowerContent.includes('accessibility') || lowerContent.includes('a11y')) return 'Accessibility';
  if (lowerContent.includes('refactor') || lowerContent.includes('cleanup')) return 'Maintenance';
  if (lowerContent.includes('documentation') || lowerContent.includes('docs')) return 'Documentation';
  if (lowerContent.includes('frontend') || lowerContent.includes('ui')) return 'Frontend';
  if (lowerContent.includes('backend') || lowerContent.includes('api')) return 'Backend';
  if (lowerContent.includes('database') || lowerContent.includes('sql')) return 'Database';
  
  return undefined;
}

function extractMcpServers(content: string): string[] {
  // Look for explicit MCP server declarations in structured formats only
  // Example: "MCP Servers: filesystem, github, git"
  // Example: "Required MCPs: - filesystem - github"
  
  // Try pattern 1: "MCP Servers: server1, server2, server3"
  const commaPattern = /(?:MCP|Required)\s+(?:Server|Servers|MCP)s?:\s*([a-z0-9-,\s]+?)(?:\n\n|$)/im;
  const commaMatch = content.match(commaPattern);
  
  if (commaMatch) {
    const servers = commaMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s && /^[a-z0-9-]+$/.test(s) && s.length < 50); // Only valid slugs
    
    if (servers.length > 0 && servers.length < 10) {
      return servers;
    }
  }
  
  // Try pattern 2: Bullet list "- server-name"
  const bulletPattern = /(?:MCP|Required)\s+(?:Server|Servers|MCP)s?:[\s\n]+(?:[-*]\s*([a-z0-9-]+)\s*\n?)+/im;
  const bulletMatch = content.match(bulletPattern);
  
  if (bulletMatch) {
    const servers = Array.from(content.matchAll(/[-*]\s*([a-z0-9-]+)/g))
      .map(m => m[1])
      .filter(s => s && s.length < 50 && s.length > 2);
    
    if (servers.length > 0 && servers.length < 10) {
      return servers.slice(0, 10);
    }
  }
  
  // Default: no MCPs detected (better to have empty than garbage)
  return [];
}

function extractLanguages(content: string): string[] {
  const languages: string[] = [];
  const lowerContent = content.toLowerCase();
  
  const languageMap = {
    'typescript': ['typescript', 'ts'],
    'javascript': ['javascript', 'js'],
    'python': ['python', 'py'],
    'java': ['java'],
    'go': ['golang', 'go'],
    'rust': ['rust'],
    'csharp': ['c#', 'csharp'],
    'php': ['php'],
  };
  
  for (const [lang, keywords] of Object.entries(languageMap)) {
    if (keywords.some(kw => lowerContent.includes(kw))) {
      languages.push(lang);
    }
  }
  
  return [...new Set(languages)];
}

function extractFrameworks(content: string): string[] {
  const frameworks: string[] = [];
  const lowerContent = content.toLowerCase();
  
  const frameworkMap = {
    'react': ['react'],
    'vue': ['vue'],
    'angular': ['angular'],
    'nextjs': ['next.js', 'nextjs'],
    'express': ['express'],
    'django': ['django'],
    'flask': ['flask'],
    'spring': ['spring'],
  };
  
  for (const [framework, keywords] of Object.entries(frameworkMap)) {
    if (keywords.some(kw => lowerContent.includes(kw))) {
      frameworks.push(framework);
    }
  }
  
  return [...new Set(frameworks)];
}

function extractTags(content: string, name: string): string[] {
  const tags: string[] = [];
  const lowerContent = content.toLowerCase();
  const lowerName = name.toLowerCase();
  
  // Common tags based on content
  if (lowerContent.includes('security') || lowerName.includes('security')) tags.push('security');
  if (lowerContent.includes('test')) tags.push('testing');
  if (lowerContent.includes('accessibility') || lowerContent.includes('a11y')) tags.push('accessibility');
  if (lowerContent.includes('refactor') || lowerContent.includes('cleanup')) tags.push('refactoring');
  if (lowerContent.includes('documentation')) tags.push('documentation');
  if (lowerContent.includes('performance')) tags.push('performance');
  if (lowerContent.includes('best practices')) tags.push('best-practices');
  if (lowerContent.includes('code review')) tags.push('code-review');
  if (lowerContent.includes('migration')) tags.push('migration');
  
  return [...new Set(tags)];
}

async function importAgents() {
  console.log('🚀 Starting import of agents from awesome-copilot...\n');
  
  const agents = await fetchAwesomeCopilotAgents();
  
  if (agents.length === 0) {
    console.log('❌ No agents found to import');
    return;
  }
  
  console.log(`\n✅ Found ${agents.length} agents to import\n`);
  
  // Get or create default author
  let defaultAuthor = await prisma.user.findFirst({
    where: { 
      OR: [
        { email: { contains: 'admin' } },
        { role: 'ADMIN' }
      ]
    }
  });
  
  if (!defaultAuthor) {
    console.log('⚠️  No admin user found. Creating default author...');
    defaultAuthor = await prisma.user.create({
      data: {
        name: 'CopilotHub Admin',
        email: 'admin@copilothub.com',
        role: 'ADMIN',
      },
    });
    console.log('✅ Created default admin user');
  }

  let created = 0;
  let updated = 0;

  for (const agent of agents) {
    const slug = agent.name.toLowerCase().replace(/\s+/g, '-');
    
    try {
      const existing = await prisma.agent.findUnique({
        where: { slug },
      });

      if (existing) {
        await prisma.agent.update({
          where: { slug },
          data: {
            description: agent.description,
            content: agent.content,
            category: agent.category,
            mcpServers: agent.mcpServers,
            languages: agent.languages,
            frameworks: agent.frameworks,
            tags: agent.tags,
            vsCodeInstallUrl: agent.vsCodeInstallUrl,
            vsCodeInsidersUrl: agent.vsCodeInsidersUrl,
            downloadUrl: agent.downloadUrl,
          },
        });
        console.log(`✅ Updated agent: "${agent.name}"`);
        updated++;
      } else {
        await prisma.agent.create({
          data: {
            title: agent.name,
            slug,
            description: agent.description,
            content: agent.content,
            category: agent.category,
            mcpServers: agent.mcpServers,
            languages: agent.languages,
            frameworks: agent.frameworks,
            tags: agent.tags,
            difficulty: Difficulty.INTERMEDIATE, // Default difficulty
            status: ContentStatus.APPROVED,      // Default status
            vsCodeInstallUrl: agent.vsCodeInstallUrl,
            vsCodeInsidersUrl: agent.vsCodeInsidersUrl,
            downloadUrl: agent.downloadUrl,
            authorId: defaultAuthor.id,
          },
        });
        console.log(`✅ Imported agent: "${agent.name}"`);
        created++;
      }
    } catch (error: any) {
      console.error(`❌ Error importing ${agent.name}:`, error.message);
    }
  }
  
  console.log('\n🎉 Import of awesome-copilot agents complete!');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   📊 Total: ${created + updated}\n`);
}

importAgents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

