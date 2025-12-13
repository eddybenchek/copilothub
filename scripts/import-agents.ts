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
            
            const agentName = nameMatch.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            const category = extractCategory(content, agentName);
            agents.push({
              name: agentName,
              description: description.substring(0, 200),
              content: content,
              category: category,
              mcpServers: extractMcpServers(content),
              languages: extractLanguages(content, agentName),
              frameworks: extractFrameworks(content, agentName),
              tags: extractTags(content, nameMatch, category),
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

function extractCategory(content: string, name: string): string | undefined {
  const lowerContent = content.toLowerCase();
  const lowerName = name.toLowerCase();
  
  // Priority-based category extraction - check most specific first
  // Use both name and content, but prioritize name for accuracy
  
  // Language Experts (MCP Experts) - check first as it's very specific
  const languageKeywords = ['typescript', 'python', 'go', 'rust', 'java', 'csharp', 'php', 'ruby', 'swift', 'kotlin', 'clojure', 'cpp', 'c++'];
  const isLanguageExpert = lowerName.includes('mcp expert') || 
    (lowerName.includes('expert') && languageKeywords.some(lang => lowerName.includes(lang)));
  if (isLanguageExpert) {
    return 'Language Expert';
  }
  
  // Infrastructure & DevOps (check before Cloud as it's more specific)
  if (lowerName.includes('terraform') || lowerName.includes('bicep') || 
      lowerName.includes('infrastructure') || lowerName.includes('devops') || 
      lowerName.includes('deploy') || lowerName.includes('gitops')) {
    return 'Infrastructure';
  }
  
  // Database - be very specific, only match explicit database-related terms
  const databaseKeywords = ['dba', 'database', 'postgres', 'mongodb', 'neo4j', 
    'sql', 'mysql', 'postgresql', 'mssql', 'oracle'];
  const hasDatabaseName = databaseKeywords.some(keyword => lowerName.includes(keyword));
  const hasDatabaseContent = lowerContent.includes('database administrator') || 
    lowerContent.includes('dba') || lowerContent.includes('database management');
  
  if (hasDatabaseName || hasDatabaseContent) {
    return 'Database';
  }
  
  // Cloud & Platform (but not if already Infrastructure)
  if (lowerName.includes('azure') || lowerName.includes('aws') || lowerName.includes('gcp') || 
      lowerName.includes('cloud') || (lowerName.includes('platform') && !lowerName.includes('power'))) {
    return 'Cloud';
  }
  
  // Security - be more specific
  if (lowerName.includes('security') || lowerName.includes('sentinel') || 
      (lowerName.includes('sec') && !lowerName.includes('expert')) ||
      lowerContent.includes('security vulnerability') || lowerContent.includes('security audit') ||
      lowerContent.includes('vulnerability scan') || lowerContent.includes('security testing')) {
    return 'Security';
  }
  
  // Testing - ONLY match explicit testing keywords in NAME (not content to avoid false positives)
  const testingNameKeywords = ['tester', 'tdd', 'playwright'];
  const hasTestingName = testingNameKeywords.some(keyword => lowerName.includes(keyword));
  
  if (hasTestingName) {
    return 'Testing';
  }
  
  // Software Engineering roles (SE prefix) - check early
  if (lowerName.startsWith('se ') || lowerName.startsWith('se-')) {
    const seType = lowerName;
    if (seType.includes('security')) return 'Security';
    if (seType.includes('gitops') || seType.includes('ci')) return 'Infrastructure';
    if (seType.includes('technical writer') || seType.includes('writer')) return 'Documentation';
    if (seType.includes('ux') || seType.includes('ui') || seType.includes('designer')) return 'Frontend';
    if (seType.includes('architecture') || seType.includes('architect')) return 'Architecture';
    if (seType.includes('product manager')) return 'Architecture'; // Planning/strategy
    // Default for other SE roles
    return 'Architecture';
  }
  
  // Business Intelligence & Data
  if (lowerName.includes('power bi') || lowerName.includes('dax') || 
      lowerName.includes('data modeling') || lowerName.includes('kusto')) {
    return 'Business Intelligence';
  }
  
  // Architecture & Planning - expand to catch more planning/research agents
  if (lowerName.includes('architect') || lowerName.includes('architecture') || 
      lowerName.includes('blueprint') || lowerName.includes('planner') ||
      lowerName.includes('plan') || lowerName.includes('research') ||
      lowerName.includes('spike') || lowerName.includes('specification') ||
      lowerName.includes('prd') || lowerName.includes('implementation plan')) {
    return 'Architecture';
  }
  
  // Code Quality & Analysis
  if (lowerName.includes('code review') || lowerName.includes('code quality') ||
      lowerName.includes('code sentinel') || lowerName.includes('code alchemist') ||
      lowerName.includes('analyzer') || lowerName.includes('optimization') ||
      lowerName.includes('evaluator') || lowerName.includes('reviewer')) {
    return 'Maintenance';
  }
  
  // Generic Expert/Engineer agents (catch before they fall through)
  if (lowerName.includes('expert') && !lowerName.includes('mcp')) {
    // Try to infer from context
    if (lowerName.includes('frontend') || lowerName.includes('react') || 
        lowerName.includes('nextjs') || lowerName.includes('ui')) {
      return 'Frontend';
    }
    if (lowerName.includes('backend') || lowerName.includes('api') || 
        lowerName.includes('dotnet') || lowerName.includes('cpp')) {
      return 'Backend';
    }
    if (lowerName.includes('drupal') || lowerName.includes('laravel') || 
        lowerName.includes('shopify') || lowerName.includes('pimcore')) {
      return 'Framework';
    }
    // Default expert agents to Architecture
    return 'Architecture';
  }
  
  // Frontend
  if (lowerName.includes('frontend') || lowerName.includes('react') || 
      lowerName.includes('vue') || lowerName.includes('angular') || 
      lowerName.includes('nextjs') || (lowerName.includes('ui') && !lowerName.includes('platform'))) {
    return 'Frontend';
  }
  
  // Backend
  if (lowerName.includes('backend') || lowerName.includes('api architect') ||
      lowerName.includes('express') || lowerName.includes('django') || lowerName.includes('flask')) {
    return 'Backend';
  }
  
  // Maintenance & Refactoring
  if (lowerName.includes('refactor') || lowerName.includes('cleanup') || 
      lowerName.includes('janitor') || lowerName.includes('maintenance') || 
      lowerName.includes('remediation') || lowerName.includes('tech debt')) {
    return 'Maintenance';
  }
  
  // Documentation
  if (lowerName.includes('documentation') || lowerName.includes('docs') || 
      lowerName.includes('adr') || lowerName.includes('readme') || 
      lowerName.includes('i18n') || lowerName.includes('technical writer')) {
    return 'Documentation';
  }
  
  // Accessibility
  if (lowerName.includes('accessibility') || lowerName.includes('a11y')) {
    return 'Accessibility';
  }
  
  // Framework-specific
  if (lowerName.includes('laravel') || lowerName.includes('drupal') || 
      lowerName.includes('shopify') || lowerName.includes('semantic kernel') ||
      (lowerName.includes('electron') && !lowerName.includes('angular'))) {
    return 'Framework';
  }
  
  // Monitoring & Observability
  if (lowerName.includes('monitoring') || lowerName.includes('observability') || 
      lowerName.includes('dynatrace') || lowerName.includes('elasticsearch') || 
      lowerName.includes('pagerduty')) {
    return 'Monitoring';
  }
  
  // Generic "Beast Mode" and similar generic agents - default to Architecture
  if (lowerName.includes('beast mode') || lowerName.includes('beast-mode') ||
      lowerName.includes('thinking') && lowerName.includes('mode')) {
    return 'Architecture';
  }
  
  // Generic utility/helper agents - default to Architecture
  if (lowerName.includes('debug') || lowerName.includes('mentor') || 
      lowerName.includes('demonstrate') || lowerName.includes('critical thinking')) {
    return 'Architecture';
  }
  
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

function extractLanguages(content: string, name: string): string[] {
  const languages: string[] = [];
  const lowerContent = content.toLowerCase();
  const lowerName = name.toLowerCase();
  
  // Language map with priority keywords (more specific = higher priority)
  const languageMap = {
    'typescript': {
      keywords: ['typescript', 'ts'],
      strongSignals: ['typescript', '.ts', 'tsx', 'typescript code', 'typescript project'],
      nameSignals: ['typescript', 'ts']
    },
    'javascript': {
      keywords: ['javascript', 'js'],
      strongSignals: ['javascript', '.js', 'jsx', 'javascript code', 'node.js', 'nodejs'],
      nameSignals: ['javascript', 'js']
    },
    'python': {
      keywords: ['python', 'py'],
      strongSignals: ['python', '.py', 'python code', 'python project', 'pip', 'pytest'],
      nameSignals: ['python', 'py']
    },
    'java': {
      keywords: ['java'],
      strongSignals: ['java', '.java', 'java code', 'java project', 'maven', 'gradle'],
      nameSignals: ['java']
    },
    'go': {
      keywords: ['golang', 'go'],
      strongSignals: ['golang', 'go code', '.go', 'go project', 'go module'],
      nameSignals: ['go', 'golang']
    },
    'rust': {
      keywords: ['rust'],
      strongSignals: ['rust', '.rs', 'rust code', 'rust project', 'cargo'],
      nameSignals: ['rust']
    },
    'csharp': {
      keywords: ['c#', 'csharp'],
      strongSignals: ['c#', 'csharp', '.cs', 'c# code', '.net', 'dotnet'],
      nameSignals: ['csharp', 'c#']
    },
    'php': {
      keywords: ['php'],
      strongSignals: ['php', '.php', 'php code', 'php project', 'composer'],
      nameSignals: ['php']
    },
  };
  
  // Check name first (highest priority)
  for (const [lang, data] of Object.entries(languageMap)) {
    if (data.nameSignals.some(signal => lowerName.includes(signal))) {
      languages.push(lang);
    }
  }
  
  // Then check for strong signals in content
  for (const [lang, data] of Object.entries(languageMap)) {
    if (!languages.includes(lang) && data.strongSignals.some(signal => lowerContent.includes(signal))) {
      languages.push(lang);
    }
  }
  
  // Finally, check for any keyword mentions (but limit to max 5 languages)
  if (languages.length < 5) {
    for (const [lang, data] of Object.entries(languageMap)) {
      if (!languages.includes(lang) && languages.length < 5) {
        // Only add if it appears in a meaningful context (not just a passing mention)
        const keywordPattern = new RegExp(`\\b(${data.keywords.join('|')})\\b`, 'i');
        if (keywordPattern.test(lowerContent)) {
          // Check if it's mentioned in a relevant context (near words like "code", "project", "development", etc.)
          const contextPattern = new RegExp(`(${data.keywords.join('|')}).{0,50}(code|project|development|application|programming|framework|library)`, 'i');
          if (contextPattern.test(lowerContent)) {
            languages.push(lang);
          }
        }
      }
    }
  }
  
  return [...new Set(languages)].slice(0, 5); // Limit to 5 most relevant
}

function extractFrameworks(content: string, name: string): string[] {
  const frameworks: string[] = [];
  const lowerContent = content.toLowerCase();
  const lowerName = name.toLowerCase();
  
  // Framework map with priority signals
  const frameworkMap = {
    'react': {
      keywords: ['react'],
      strongSignals: ['react', 'react.js', 'reactjs', 'react component', 'react app'],
      nameSignals: ['react']
    },
    'vue': {
      keywords: ['vue'],
      strongSignals: ['vue', 'vue.js', 'vuejs', 'vue component', 'vue app'],
      nameSignals: ['vue']
    },
    'angular': {
      keywords: ['angular'],
      strongSignals: ['angular', 'angular.js', 'angularjs', 'angular component', 'angular app'],
      nameSignals: ['angular']
    },
    'nextjs': {
      keywords: ['next.js', 'nextjs'],
      strongSignals: ['next.js', 'nextjs', 'next.js app', 'next.js project'],
      nameSignals: ['nextjs', 'next.js']
    },
    'express': {
      keywords: ['express'],
      strongSignals: ['express', 'express.js', 'expressjs', 'express app', 'express server'],
      nameSignals: ['express']
    },
    'django': {
      keywords: ['django'],
      strongSignals: ['django', 'django app', 'django project', 'django framework'],
      nameSignals: ['django']
    },
    'flask': {
      keywords: ['flask'],
      strongSignals: ['flask', 'flask app', 'flask application', 'flask project'],
      nameSignals: ['flask']
    },
    'spring': {
      keywords: ['spring'],
      strongSignals: ['spring', 'spring boot', 'spring framework', 'spring application'],
      nameSignals: ['spring']
    },
  };
  
  // Check name first (highest priority)
  for (const [framework, data] of Object.entries(frameworkMap)) {
    if (data.nameSignals.some(signal => lowerName.includes(signal))) {
      frameworks.push(framework);
    }
  }
  
  // Then check for strong signals in content
  for (const [framework, data] of Object.entries(frameworkMap)) {
    if (!frameworks.includes(framework) && data.strongSignals.some(signal => lowerContent.includes(signal))) {
      frameworks.push(framework);
    }
  }
  
  // Finally, check for keyword mentions in relevant context (limit to max 3 frameworks)
  if (frameworks.length < 3) {
    for (const [framework, data] of Object.entries(frameworkMap)) {
      if (!frameworks.includes(framework) && frameworks.length < 3) {
        const keywordPattern = new RegExp(`\\b(${data.keywords.join('|')})\\b`, 'i');
        if (keywordPattern.test(lowerContent)) {
          // Check if it's mentioned in a relevant context
          const contextPattern = new RegExp(`(${data.keywords.join('|')}).{0,50}(app|application|project|framework|development|code)`, 'i');
          if (contextPattern.test(lowerContent)) {
            frameworks.push(framework);
          }
        }
      }
    }
  }
  
  return [...new Set(frameworks)].slice(0, 3); // Limit to 3 most relevant
}

function extractTags(content: string, name: string, category?: string): string[] {
  const tags: string[] = [];
  const lowerContent = content.toLowerCase();
  const lowerName = name.toLowerCase();
  const lowerCategory = category?.toLowerCase() || '';
  
  // Security tag - add if Security category OR if explicitly about security
  if (lowerCategory === 'security') {
    tags.push('security');
  } else {
    // Only add security tag if explicitly about security (not just mentions "security")
    const securityPatterns = [
      /\bsecurity\b.*\b(vulnerability|audit|scan|review|testing|check|onboarding)\b/i,
      /\b(vulnerability|security audit|security scan|security review|security testing)\b/i,
      /\bsecure\b.*\b(code|practice|implementation|development)\b/i,
      /\bsecurity\s+(tool|agent|assistant|onboarding|scanner)\b/i
    ];
    if (securityPatterns.some(pattern => pattern.test(lowerContent)) || 
        (lowerName.includes('security') && (lowerName.includes('onboarding') || lowerName.includes('reviewer') || lowerName.includes('scanner')))) {
      tags.push('security');
    }
  }
  
  // Testing tag - ONLY if category is Testing
  if (lowerCategory === 'testing') {
    tags.push('testing');
  }
  // Don't add testing tag for non-testing categories, even if they mention "test"
  
  // Accessibility tag - only if explicitly about accessibility
  if (lowerName.includes('accessibility') || lowerName.includes('a11y')) {
    tags.push('accessibility');
  } else if (lowerContent.includes('accessibility') || lowerContent.includes('a11y') ||
      lowerContent.includes('wcag') || lowerContent.includes('aria')) {
    // Check if it's actually about accessibility, not just a mention
    const a11yPatterns = [
      /\baccessibility\s+(tool|agent|assistant|checker|audit)\b/i,
      /\b(improve|check|audit|test)\s+accessibility\b/i,
      /\bwcag\s+(compliance|guidelines)\b/i
    ];
    if (a11yPatterns.some(pattern => pattern.test(lowerContent))) {
      tags.push('accessibility');
    }
  }
  
  // Refactoring tag - only if explicitly about refactoring
  if (lowerContent.includes('refactor') || lowerContent.includes('refactoring')) {
    const refactorPatterns = [
      /\brefactor\b.*\b(code|legacy|technical debt)\b/i,
      /\bcode\s+refactoring\b/i,
      /\brefactoring\s+(tool|agent|assistant)\b/i
    ];
    if (refactorPatterns.some(pattern => pattern.test(lowerContent)) ||
        lowerName.includes('refactor') || lowerName.includes('janitor')) {
      tags.push('refactoring');
    }
  }
  
  // Documentation tag - only if explicitly about documentation
  if (lowerContent.includes('documentation') || lowerName.includes('documentation') ||
      lowerName.includes('docs') || lowerName.includes('adr') || lowerName.includes('readme')) {
    const docPatterns = [
      /\b(generate|create|write|improve)\s+documentation\b/i,
      /\bdocumentation\s+(generator|tool|assistant)\b/i,
      /\b(api|code)\s+documentation\b/i
    ];
    if (docPatterns.some(pattern => pattern.test(lowerContent)) ||
        lowerName.includes('documentation') || lowerName.includes('docs')) {
      tags.push('documentation');
    }
  }
  
  // Performance tag - only if explicitly about performance
  if (lowerContent.includes('performance') || lowerName.includes('performance')) {
    const perfPatterns = [
      /\bperformance\s+(optimization|improvement|analysis|tuning)\b/i,
      /\boptimize\b.*\bperformance\b/i,
      /\b(improve|enhance)\s+performance\b/i
    ];
    if (perfPatterns.some(pattern => pattern.test(lowerContent)) ||
        lowerName.includes('performance') || lowerName.includes('optimization')) {
      tags.push('performance');
    }
  }
  
  // Best practices tag
  if (lowerContent.includes('best practices') || lowerContent.includes('best-practices') ||
      lowerContent.includes('coding standards') || lowerContent.includes('code quality')) {
    tags.push('best-practices');
  }
  
  // Code review tag - only if explicitly about code review
  if (lowerName.includes('reviewer') || lowerName.includes('code review')) {
    tags.push('code-review');
  } else if (lowerContent.includes('code review') || lowerContent.includes('review code')) {
    const reviewPatterns = [
      /\bcode\s+review\s+(tool|agent|assistant|process)\b/i,
      /\b(review|analyze)\s+code\s+(quality|security|best practices)\b/i
    ];
    if (reviewPatterns.some(pattern => pattern.test(lowerContent))) {
      tags.push('code-review');
    }
  }
  
  // Migration tag - only if explicitly about migration
  if (lowerContent.includes('migration') || lowerName.includes('migration')) {
    const migrationPatterns = [
      /\b(migrate|migration)\s+(from|to|project|codebase)\b/i,
      /\bcode\s+migration\b/i,
      /\b(migrate|upgrade)\s+(framework|library|version)\b/i
    ];
    if (migrationPatterns.some(pattern => pattern.test(lowerContent)) ||
        lowerName.includes('migration') || lowerName.includes('upgrade')) {
      tags.push('migration');
    }
  }
  
  // Limit tags to most relevant (max 4)
  return [...new Set(tags)].slice(0, 4);
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

