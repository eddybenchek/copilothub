import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ContentStatus, TargetType } from '@prisma/client';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Heart, Sparkles, FileCode, Bot, Plug, Wrench } from 'lucide-react';
import Link from 'next/link';

async function getFavorites(userId: string) {
  const favorites = await db.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch actual content for each favorite
  const favoritesWithContent = await Promise.all(
    favorites.map(async (fav) => {
      let content: any = null;
      
      switch (fav.targetType) {
        case 'PROMPT':
          content = await db.prompt.findUnique({
            where: { id: fav.targetId, status: ContentStatus.APPROVED },
            include: { author: { select: { name: true } } },
          });
          break;
        case 'TOOL':
          content = await db.tool.findUnique({
            where: { id: fav.targetId, status: ContentStatus.APPROVED },
            include: { author: { select: { name: true } } },
          });
          break;
        case 'MCP':
          content = await (db as any).mcpServer.findUnique({
            where: { id: fav.targetId, status: ContentStatus.APPROVED },
            include: { author: { select: { name: true } } },
          });
          break;
        case 'INSTRUCTION':
          content = await db.instruction.findUnique({
            where: { id: fav.targetId, status: ContentStatus.APPROVED },
            include: { author: { select: { name: true } } },
          });
          break;
        case 'AGENT':
          content = await db.agent.findUnique({
            where: { id: fav.targetId, status: ContentStatus.APPROVED },
            include: { author: { select: { name: true } } },
          });
          break;
      }

      return { favorite: fav, content };
    })
  );

  return favoritesWithContent.filter((item) => item.content !== null);
}

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

async function FavoritesContent() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const favoritesWithContent = await getFavorites(session.user.id);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-red-400 fill-current" />
          <h1 className="text-4xl font-bold text-slate-50">My Favorites</h1>
        </div>
        <p className="text-slate-400">
          {favoritesWithContent.length === 0
            ? 'No favorites yet. Start saving items you love!'
            : `You have ${favoritesWithContent.length} saved ${favoritesWithContent.length === 1 ? 'item' : 'items'}`}
        </p>
      </div>

      {favoritesWithContent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-slate-700 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-200 mb-2">No favorites yet</h2>
          <p className="text-slate-400 mb-6">
            Start exploring and save items you find useful!
          </p>
          <Link
            href="/prompts"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Browse Prompts
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favoritesWithContent.map(({ favorite, content }) => {
            if (!content) return null;

            return (
              <Card
                key={favorite.id}
                className="transition duration-150 hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-sky-500/40"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getTypeIcon(favorite.targetType)}
                      <CardTitle className="text-lg line-clamp-2">
                        {content.title || content.name || 'Untitled'}
                      </CardTitle>
                    </div>
                    <FavoriteButton
                      targetId={favorite.targetId}
                      targetType={favorite.targetType}
                      size="sm"
                    />
                  </div>
                  <CardDescription className="line-clamp-2">
                    {content.description || content.shortDescription || ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={getTypePath(favorite.targetType, content.slug)}
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

export default function FavoritesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-50">My Favorites</h1>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      }
    >
      <FavoritesContent />
    </Suspense>
  );
}

