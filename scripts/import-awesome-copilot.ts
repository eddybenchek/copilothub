import { Octokit } from '@octokit/rest';
import { PrismaClient, ContentStatus, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();
// Use GitHub token if available to increase rate limit (60 -> 5000/hour)
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});

interface CopilotInstruction {
  name: string;
  description: string;
  content: string;
  filePattern?: string;
  language?: string;
  framework?: string;
  tags: string[];
}

async function fetchAwesomeCopilotInstructions() {
  const owner = 'github';
  const repo = 'awesome-copilot';
  
  try {
    console.log('📥 Fetching instructions from awesome-copilot...');
    
    // Fetch the instructions directory
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'instructions',
      ref: 'main',
    });

    if (!Array.isArray(contents)) {
      console.log('❌ Instructions directory not found or is not a directory');
      return [];
    }

    console.log(`✅ Found ${contents.length} files in instructions directory`);

    const instructions: CopilotInstruction[] = [];

    for (const file of contents) {
      if (file.type === 'file' && file.name.endsWith('.md')) {
        try {
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const { data: fileData } = await octokit.repos.getContent({
            owner,
            repo,
            path: file.path,
            ref: 'main',
          });

          if (!Array.isArray(fileData) && 'type' in fileData && fileData.type === 'file' && fileData.content) {
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            
            // Parse the markdown to extract metadata
            const nameMatch = file.name.replace('.md', '').replace(/-/g, ' ');
            const titleMatch = content.match(/^#\s+(.+)/m);
            const descMatch = content.match(/^##?\s*Description[:\s]+(.+)/mi) || 
                            content.match(/^>\s*(.+)/m);
            
            const title = titleMatch?.[1] || nameMatch;
            const description = descMatch?.[1] || `Coding standards for ${nameMatch}`;
            
            instructions.push({
              name: title,
              description: description,
              content: content,
              filePattern: extractFilePattern(content),
              language: extractLanguage(file.name, content),
              framework: extractFramework(content),
              tags: extractTags(content),
            });
            
            console.log(`✅ Parsed: ${title}`);
          }
        } catch (error) {
          console.error(`❌ Error fetching ${file.name}:`, error);
        }
      }
    }

    return instructions;
  } catch (error) {
    console.error('❌ Error fetching instructions:', error);
    return [];
  }
}

function extractFilePattern(content: string): string | undefined {
  const patterns = [
    /file pattern[:\s]+`([^`]+)`/i,
    /applies to[:\s]+`([^`]+)`/i,
    /for files[:\s]+`([^`]+)`/i,
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[1];
  }
  
  return undefined;
}

function extractLanguage(filename: string, content: string): string | undefined {
  const lowerFilename = filename.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  const languages = [
    { keywords: ['typescript', 'tsx', '.ts'], name: 'typescript' },
    { keywords: ['javascript', 'jsx', '.js'], name: 'javascript' },
    { keywords: ['python', '.py'], name: 'python' },
    { keywords: ['rust', '.rs'], name: 'rust' },
    { keywords: ['go', 'golang'], name: 'go' },
    { keywords: ['java'], name: 'java' },
    { keywords: ['c++', 'cpp'], name: 'cpp' },
    { keywords: ['c#', 'csharp'], name: 'csharp' },
  ];
  
  for (const lang of languages) {
    if (lang.keywords.some(kw => lowerFilename.includes(kw) || lowerContent.includes(kw))) {
      return lang.name;
    }
  }
  
  return undefined;
}

function extractFramework(content: string): string | undefined {
  const lowerContent = content.toLowerCase();
  
  const frameworks = [
    { keywords: ['react'], name: 'react' },
    { keywords: ['vue'], name: 'vue' },
    { keywords: ['next.js', 'nextjs'], name: 'nextjs' },
    { keywords: ['angular'], name: 'angular' },
    { keywords: ['svelte'], name: 'svelte' },
    { keywords: ['django'], name: 'django' },
    { keywords: ['flask'], name: 'flask' },
    { keywords: ['express'], name: 'express' },
    { keywords: ['fastapi'], name: 'fastapi' },
  ];
  
  for (const fw of frameworks) {
    if (fw.keywords.some(kw => lowerContent.includes(kw))) {
      return fw.name;
    }
  }
  
  return undefined;
}

function extractTags(content: string): string[] {
  const tags: string[] = [];
  const lowerContent = content.toLowerCase();
  
  const tagKeywords = [
    { keywords: ['testing', 'test', 'unit test'], tag: 'testing' },
    { keywords: ['security', 'secure'], tag: 'security' },
    { keywords: ['performance', 'optimization'], tag: 'performance' },
    { keywords: ['accessibility', 'a11y'], tag: 'accessibility' },
    { keywords: ['best practices', 'standards'], tag: 'best-practices' },
    { keywords: ['documentation', 'comments'], tag: 'documentation' },
    { keywords: ['error handling'], tag: 'error-handling' },
    { keywords: ['async', 'asynchronous'], tag: 'async' },
    { keywords: ['api'], tag: 'api' },
    { keywords: ['database'], tag: 'database' },
  ];
  
  for (const item of tagKeywords) {
    if (item.keywords.some(kw => lowerContent.includes(kw))) {
      tags.push(item.tag);
    }
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

async function importInstructions() {
  console.log('🚀 Starting awesome-copilot instructions import...\n');
  
  const instructions = await fetchAwesomeCopilotInstructions();
  
  if (instructions.length === 0) {
    console.log('❌ No instructions found to import');
    return;
  }
  
  console.log(`\n✅ Found ${instructions.length} instructions to import\n`);
  
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

  let imported = 0;
  let updated = 0;

  for (const instruction of instructions) {
    const slug = instruction.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
      const existing = await prisma.instruction.findUnique({ where: { slug } });
      
      if (existing) {
        await prisma.instruction.update({
          where: { slug },
          data: {
            description: instruction.description,
            content: instruction.content,
            tags: instruction.tags,
            filePattern: instruction.filePattern,
            language: instruction.language,
            framework: instruction.framework,
          },
        });
        updated++;
        console.log(`🔄 Updated: ${instruction.name}`);
      } else {
        await prisma.instruction.create({
          data: {
            title: instruction.name,
            slug,
            description: instruction.description,
            content: instruction.content,
            filePattern: instruction.filePattern,
            language: instruction.language,
            framework: instruction.framework,
            tags: instruction.tags,
            difficulty: Difficulty.INTERMEDIATE,
            status: ContentStatus.APPROVED,
            featured: false,
            authorId: defaultAuthor.id,
          },
        });
        imported++;
        console.log(`✅ Imported: ${instruction.name}`);
      }
    } catch (error) {
      console.error(`❌ Error importing ${instruction.name}:`, error);
    }
  }
  
  console.log(`\n🎉 Import complete!`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   📊 Total: ${imported + updated}\n`);
}

importInstructions()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

