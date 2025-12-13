import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ContentStatus, TargetType } from '@prisma/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles, FileCode, Bot, Plug, Wrench, Globe } from 'lucide-react';
import Link from 'next/link';
import { ShareButton as ShareButtonComponent } from '@/components/collections/share-button';

function getTypeIcon(type: TargetType) {
  switch (type) {
    case 'PROMPT':
      return <Sparkles className="h-4 w-4 text-sky-400" />;
    case 'INSTRUCTION':
      return <FileCode className="h-4 w-4 text-sky-400" />;
    case 'AGENT':
      return <Bot className="h-4 w-4 text-purple-400" />;
    case 'MCP':
      return <Plug className="h-4 w-4 text-teal-400" />;
    case 'TOOL':
      return <Wrench className="h-4 w-4 text-slate-400" />;
  }
}

function getTypePath(type: TargetType, slug: string) {
  switch (type) {
    case 'PROMPT':
      return `/prompts/${slug}`;
    case 'INSTRUCTION':
      return `/instructions/${slug}`;
    case 'AGENT':
      return `/agents/${slug}`;
    case 'MCP':
      return `/mcps/${slug}`;
    case 'TOOL':
      return `/tools/${slug}`;
  }
}

async function getCollectionItems(items: any[]) {
  const itemsWithContent = await Promise.all(
    items.map(async (item) => {
      let content: any = null;
      
      switch (item.targetType) {
        case 'PROMPT':
          content = await db.prompt.findUnique({
            where: { id: item.targetId, status: ContentStatus.APPROVED },
            include: { author: { select: { name: true } } },
          });
          break;
        case 'TOOL':
          content = await db.tool.findUnique({
            where: { id: item.targetId, status: ContentStatus.APPROVED },
            include: { author: { select: { name: true } } },
          });
          break;
        case 'MCP':
          content = await (db as any).mcpServer.findUnique({
            where: { id: item.targetId, status: ContentStatus.APPROVED },
            include: { author: { select: { name: true } } },
          });
          break;
        case 'INSTRUCTION':
          content = await db.instruction.findUnique({
            where: { id: item.targetId, status: ContentStatus.APPROVED },
            include: { author: { select: { name: true } } },
          });
          break;
        case 'AGENT':
          content = await db.agent.findUnique({
            where: { id: item.targetId, status: ContentStatus.APPROVED },
            include: { author: { select: { name: true } } },
          });
          break;
      }

      return { item, content };
    })
  );

  return itemsWithContent.filter((item) => item.content !== null);
}

export default async function PublicCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const collection = await db.collection.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, id: true } },
    },
  });

  if (!collection || !collection.isPublic) {
    notFound();
  }

  const itemsWithContent = await getCollectionItems(collection.items);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-sky-400" />
              <h1 className="text-4xl font-bold text-slate-50">{collection.name}</h1>
            </div>
            {collection.description && (
              <p className="text-slate-400 mb-2">{collection.description}</p>
            )}
            <p className="text-sm text-slate-500">
              By {collection.user.name || 'Anonymous'} • {itemsWithContent.length} items
            </p>
          </div>
          <ShareButtonComponent />
        </div>
      </div>

      {itemsWithContent.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400">This collection is empty.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {itemsWithContent.map(({ item, content }) => {
            if (!content) return null;

            return (
              <Card
                key={item.id}
                className="transition duration-150 hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-sky-500/40"
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.targetType)}
                    <CardTitle className="text-lg line-clamp-2">
                      {content.title || content.name || 'Untitled'}
                    </CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {content.description || content.shortDescription || ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={getTypePath(item.targetType, content.slug)}
                    className="text-sm text-sky-400 hover:text-sky-300"
                  >
                    View details →
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

