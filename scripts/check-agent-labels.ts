import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLabels() {
  const agentNames = [
    'Stackhawk Security Onboarding',
    'Task Researcher',
    'Playwright Tester',
    'Tdd Green',
    'Api Architect',
  ];

  for (const name of agentNames) {
    const agent = await prisma.agent.findFirst({
      where: {
        title: {
          contains: name,
          mode: 'insensitive',
        },
      },
      select: {
        title: true,
        category: true,
        languages: true,
        frameworks: true,
        tags: true,
      },
    });

    if (agent) {
      console.log(`\n📋 ${agent.title}:`);
      console.log(`   Category: ${agent.category || 'null'}`);
      console.log(`   Languages (${agent.languages.length}): ${agent.languages.join(', ') || 'none'}`);
      console.log(`   Frameworks (${agent.frameworks.length}): ${agent.frameworks.join(', ') || 'none'}`);
      console.log(`   Tags (${agent.tags.length}): ${agent.tags.join(', ') || 'none'}`);
    } else {
      console.log(`\n❌ Agent "${name}" not found`);
    }
  }

  await prisma.$disconnect();
}

checkLabels().catch(console.error);

