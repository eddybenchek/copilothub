import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
  const agents = await prisma.agent.findMany({
    select: {
      title: true,
      category: true,
    },
    orderBy: {
      category: 'asc',
    },
  });

  const categories = new Map<string, number>();
  const agentsByCategory = new Map<string, string[]>();

  agents.forEach((agent) => {
    const cat = agent.category || 'null';
    categories.set(cat, (categories.get(cat) || 0) + 1);
    
    if (!agentsByCategory.has(cat)) {
      agentsByCategory.set(cat, []);
    }
    agentsByCategory.get(cat)!.push(agent.title);
  });

  console.log('\n📊 Agent Categories Summary:\n');
  console.log('Categories and counts:');
  Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} agents`);
    });

  console.log(`\nTotal agents: ${agents.length}\n`);

  console.log('\n📋 Agents by Category:\n');
  Array.from(agentsByCategory.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([cat, titles]) => {
      console.log(`\n${cat} (${titles.length}):`);
      titles.forEach((title) => {
        console.log(`  - ${title}`);
      });
    });

  await prisma.$disconnect();
}

checkCategories().catch(console.error);

