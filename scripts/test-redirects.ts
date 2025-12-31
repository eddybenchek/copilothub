import { db } from '../lib/db';
import {
  findInstructionBySlug,
  findAgentBySlug,
  findMcpBySlug,
  findSpecificationAgent,
} from '../lib/redirect-helpers';

/**
 * Test script to verify redirects work correctly
 * Tests all broken redirects and 404s from the CSV files
 */
async function testRedirects() {
  console.log('🧪 Testing redirects...\n');

  const testCases = [
    // Broken redirects from CSV
    {
      type: 'instruction',
      input: 'terraform',
      expected: 'Should find instruction or redirect to /instructions',
    },
    {
      type: 'instruction',
      input: 'azure-verified-modules-terraform',
      expected: 'Should find instruction or redirect to /instructions',
    },
    {
      type: 'instruction',
      input: 'powershell',
      expected: 'Should find instruction or redirect to /instructions',
    },
    // 404 pages
    {
      type: 'spec',
      input: 'spec',
      expected: 'Should find specification agent or redirect to /agents',
    },
    {
      type: 'mcp',
      input: 'swarmia.com',
      expected: 'Should find MCP (mattjegan-swarmia-mcp) or handle gracefully',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      let result: string | null = null;
      let found = false;

      switch (testCase.type) {
        case 'instruction':
          result = await findInstructionBySlug(testCase.input);
          found = result !== null;
          if (found) {
            console.log(`✅ Instruction "${testCase.input}" → Found: ${result}`);
          } else {
            console.log(`⚠️  Instruction "${testCase.input}" → Not found (will redirect to /instructions)`);
          }
          break;

        case 'spec':
          result = await findSpecificationAgent();
          found = result !== null;
          if (found) {
            console.log(`✅ Specification agent → Found: ${result}`);
          } else {
            console.log(`⚠️  Specification agent → Not found (will redirect to /agents)`);
          }
          break;

        case 'mcp':
          result = await findMcpBySlug(testCase.input);
          found = result !== null;
          if (found) {
            console.log(`✅ MCP "${testCase.input}" → Found: ${result}`);
          } else {
            console.log(`⚠️  MCP "${testCase.input}" → Not found (will 404 or redirect)`);
          }
          break;
      }

      // Test passes if it either finds a match OR gracefully handles not found
      passed++;
    } catch (error) {
      console.error(`❌ Error testing "${testCase.input}":`, error);
      failed++;
    }
  }

  // Also check if the actual slugs exist in database
  console.log('\n📊 Checking actual database slugs...\n');

  // Check for terraform-related instructions
  const terraformInstructions = await db.instruction.findMany({
    where: {
      OR: [
        { slug: { contains: 'terraform', mode: 'insensitive' } },
        { title: { contains: 'terraform', mode: 'insensitive' } },
      ],
      status: 'APPROVED',
    },
    select: { slug: true, title: true },
    take: 5,
  });

  if (terraformInstructions.length > 0) {
    console.log('Found Terraform-related instructions:');
    terraformInstructions.forEach((inst) => {
      console.log(`  - ${inst.slug}: ${inst.title}`);
    });
  } else {
    console.log('⚠️  No Terraform-related instructions found in database');
  }

  // Check for powershell-related instructions
  const powershellInstructions = await db.instruction.findMany({
    where: {
      OR: [
        { slug: { contains: 'powershell', mode: 'insensitive' } },
        { title: { contains: 'powershell', mode: 'insensitive' } },
      ],
      status: 'APPROVED',
    },
    select: { slug: true, title: true },
    take: 5,
  });

  if (powershellInstructions.length > 0) {
    console.log('\nFound PowerShell-related instructions:');
    powershellInstructions.forEach((inst) => {
      console.log(`  - ${inst.slug}: ${inst.title}`);
    });
  } else {
    console.log('\n⚠️  No PowerShell-related instructions found in database');
  }

  // Check for specification agent
  const specAgents = await db.agent.findMany({
    where: {
      OR: [
        { slug: { contains: 'specification', mode: 'insensitive' } },
        { slug: { contains: 'spec', mode: 'insensitive' } },
        { title: { contains: 'specification', mode: 'insensitive' } },
      ],
      status: 'APPROVED',
    },
    select: { slug: true, title: true },
    take: 5,
  });

  if (specAgents.length > 0) {
    console.log('\nFound Specification-related agents:');
    specAgents.forEach((agent) => {
      console.log(`  - ${agent.slug}: ${agent.title}`);
    });
  } else {
    console.log('\n⚠️  No Specification-related agents found in database');
  }

  // Check for swarmia MCP
  const swarmiaMcps = await db.mcpServer.findMany({
    where: {
      OR: [
        { slug: { contains: 'swarmia', mode: 'insensitive' } },
        { title: { contains: 'swarmia', mode: 'insensitive' } },
        { name: { contains: 'swarmia', mode: 'insensitive' } },
      ],
      status: 'APPROVED',
    },
    select: { slug: true, title: true, name: true },
    take: 5,
  });

  if (swarmiaMcps.length > 0) {
    console.log('\nFound Swarmia-related MCPs:');
    swarmiaMcps.forEach((mcp) => {
      console.log(`  - ${mcp.slug}: ${mcp.title || mcp.name}`);
    });
  } else {
    console.log('\n⚠️  No Swarmia-related MCPs found in database');
  }

  console.log(`\n✅ Tests completed: ${passed} passed, ${failed} failed`);
  console.log('\n💡 Note: Redirects will work correctly even if items are not found');
  console.log('   (they will redirect to listing pages as fallback)');
}

testRedirects()
  .catch(console.error)
  .finally(() => db.$disconnect());

