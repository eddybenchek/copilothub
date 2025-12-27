import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBrokenLogos() {
  console.log('🔧 Fixing broken logo paths...\n');

  // Fix httpie: change .svg to .png
  const httpieTool = await prisma.tool.findFirst({
    where: {
      OR: [
        { slug: 'httpie-cli' },
        { title: { contains: 'HTTPie', mode: 'insensitive' } },
      ],
    },
  });

  if (httpieTool && httpieTool.logo === '/logos/httpie.svg') {
    await prisma.tool.update({
      where: { id: httpieTool.id },
      data: { logo: '/logos/httpie.png' },
    });
    console.log('✅ Fixed HTTPie logo: .svg → .png');
  }

  // Remove logos for tools that don't have logo files
  const toolsWithoutLogos = [
    'codeium',
    'tabnine',
    'ripgrep',
    'cody',
    'sourcegraph-cody',
    'continue-dev',
    'lazygit',
  ];

  for (const slug of toolsWithoutLogos) {
    const tool = await prisma.tool.findUnique({
      where: { slug },
    });

    if (tool && tool.logo) {
      // Check if logo file exists by checking common extensions
      const logoPath = tool.logo;
      const hasSvg = logoPath.endsWith('.svg');
      const hasPng = logoPath.endsWith('.png');

      // If it's a .svg and we know it doesn't exist, remove it
      if (hasSvg && !hasPng) {
        await prisma.tool.update({
          where: { id: tool.id },
          data: { logo: null },
        });
        console.log(`✅ Removed broken logo for ${tool.title || slug}`);
      }
    }
  }

  // Also check for any other tools with .svg logos that might be broken
  const allToolsWithSvgLogos = await prisma.tool.findMany({
    where: {
      logo: {
        endsWith: '.svg',
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      logo: true,
    },
  });

  const knownMissingSvgs = [
    '/logos/codeium.svg',
    '/logos/tabnine.svg',
    '/logos/ripgrep.svg',
    '/logos/cody.svg',
    '/logos/continue.svg',
    '/logos/lazygit.svg',
    '/logos/codewhisperer.svg',
    '/logos/gh-cli.svg',
    '/logos/raycast.svg',
    '/logos/linear.svg',
    '/logos/jira.svg',
    '/logos/slack.svg',
    '/logos/discord.svg',
    '/logos/notion.svg',
    '/logos/supabase.svg',
    '/logos/tableplus.svg',
    '/logos/dbeaver.svg',
    '/logos/datagrip.svg',
    '/logos/postman.svg',
    '/logos/insomnia.svg',
    '/logos/hoppscotch.svg',
    '/logos/react-devtools.svg',
    '/logos/redux-devtools.svg',
    '/logos/codespaces.svg',
    '/logos/sentry.svg',
    '/logos/logtail.svg',
    '/logos/grafana.svg',
    '/logos/intellij.svg',
    '/logos/webstorm.svg',
    '/logos/pycharm.svg',
    '/logos/neovim.svg',
    '/logos/fleet.svg',
  ];

  for (const tool of allToolsWithSvgLogos) {
    if (tool.logo && knownMissingSvgs.includes(tool.logo)) {
      await prisma.tool.update({
        where: { id: tool.id },
        data: { logo: null },
      });
      console.log(`✅ Removed broken logo for ${tool.title || tool.slug}: ${tool.logo}`);
    }
  }

  console.log('\n✨ Logo fixes complete!');
  await prisma.$disconnect();
}

fixBrokenLogos().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

