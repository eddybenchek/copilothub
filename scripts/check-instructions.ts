import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInstructions() {
  const slugsToCheck = [
    'azure-verified-modules-terraform',
    'terraform',
  ];

  console.log('🔍 Checking if instructions exist in database...\n');

  for (const slug of slugsToCheck) {
    const instruction = await prisma.instruction.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
      },
    });

    if (instruction) {
      console.log(`✅ Found: ${slug}`);
      console.log(`   Title: ${instruction.title}`);
      console.log(`   Status: ${instruction.status}`);
      console.log(`   Created: ${instruction.createdAt.toISOString()}\n`);
    } else {
      console.log(`❌ Not found: ${slug}\n`);
    }
  }

  // Also check for similar slugs
  console.log('🔍 Checking for similar instruction slugs...\n');
  
  const allInstructions = await prisma.instruction.findMany({
    where: {
      OR: [
        { slug: { contains: 'terraform', mode: 'insensitive' } },
        { slug: { contains: 'azure', mode: 'insensitive' } },
      ],
    },
    select: {
      slug: true,
      title: true,
      status: true,
    },
    take: 20,
  });

  if (allInstructions.length > 0) {
    console.log(`Found ${allInstructions.length} related instructions:\n`);
    allInstructions.forEach((inst) => {
      console.log(`  - ${inst.slug} (${inst.status}): ${inst.title}`);
    });
  } else {
    console.log('No related instructions found.\n');
  }

  await prisma.$disconnect();
}

checkInstructions().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

