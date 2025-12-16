import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileCode, Bot, Plug, Wrench, Heart, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import Link from 'next/link';
import { ContentStatus, TargetType } from '@prisma/client';

async function getUserStats(userId: string) {
  const [prompts, tools, mcps, instructions, agents, votes, favorites, collections] = await Promise.all([
    db.prompt.count({ where: { authorId: userId } }),
    db.tool.count({ where: { authorId: userId } }),
    db.mcpServer.count({ where: { authorId: userId } }),
    db.instruction.count({ where: { authorId: userId } }),
    db.agent.count({ where: { authorId: userId } }),
    db.vote.count({ where: { userId } }),
    db.favorite.count({ where: { userId } }),
    db.collection.count({ where: { userId } }),
  ]);

  return {
    prompts,
    tools,
    mcps,
    instructions,
    agents,
    votes,
    favorites,
    collections,
  };
}

async function getRecentActivity(userId: string) {
  // Get recent votes (last 10)
  const recentVotes = await db.vote.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      prompt: {
        select: { id: true, title: true, slug: true },
      },
      tool: {
        select: { id: true, title: true, slug: true },
      },
      mcp: {
        select: { id: true, title: true, slug: true },
      },
      instruction: {
        select: { id: true, title: true, slug: true },
      },
      agent: {
        select: { id: true, title: true, slug: true },
      },
    },
  });

  // Get recent favorites (last 5) with content
  const recentFavorites = await db.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      // We'll fetch content separately since we can't join polymorphic relations
    },
  });

  // Fetch content for favorites
  const favoritesWithContent = await Promise.all(
    recentFavorites.map(async (fav) => {
      let content: { title: string; slug: string } | null = null;
      
      switch (fav.targetType) {
        case 'PROMPT':
          const prompt = await db.prompt.findUnique({
            where: { id: fav.targetId },
            select: { title: true, slug: true },
          });
          content = prompt;
          break;
        case 'TOOL':
          const tool = await db.tool.findUnique({
            where: { id: fav.targetId },
            select: { title: true, slug: true },
          });
          content = tool;
          break;
        case 'MCP':
          const mcp = await db.mcpServer.findUnique({
            where: { id: fav.targetId },
            select: { title: true, slug: true },
          });
          content = mcp;
          break;
        case 'INSTRUCTION':
          const instruction = await db.instruction.findUnique({
            where: { id: fav.targetId },
            select: { title: true, slug: true },
          });
          content = instruction;
          break;
        case 'AGENT':
          const agent = await db.agent.findUnique({
            where: { id: fav.targetId },
            select: { title: true, slug: true },
          });
          content = agent;
          break;
      }

      return { favorite: fav, content };
    })
  );

  // Get recent submissions (last 5)
  const [recentPrompts, recentTools, recentMcps, recentInstructions, recentAgents] = await Promise.all([
    db.prompt.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, slug: true, createdAt: true, status: true },
    }),
    db.tool.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, slug: true, createdAt: true, status: true },
    }),
    db.mcpServer.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, slug: true, createdAt: true, status: true },
    }),
    db.instruction.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, slug: true, createdAt: true, status: true },
    }),
    db.agent.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, slug: true, createdAt: true, status: true },
    }),
  ]);

  // Combine and sort all activities by date
  const activities: Array<{
    type: 'vote' | 'favorite' | 'submission';
    targetType: TargetType;
    title: string;
    slug: string;
    createdAt: Date;
    value?: number;
    status?: ContentStatus;
  }> = [];

  recentVotes.forEach((vote) => {
    let title = '';
    let slug = '';
    const targetType = vote.targetType;

    if (vote.prompt) {
      title = vote.prompt.title;
      slug = vote.prompt.slug;
    } else if (vote.tool) {
      title = vote.tool.title;
      slug = vote.tool.slug;
    } else if (vote.mcp) {
      title = vote.mcp.title;
      slug = vote.mcp.slug;
    } else if (vote.instruction) {
      title = vote.instruction.title;
      slug = vote.instruction.slug;
    } else if (vote.agent) {
      title = vote.agent.title;
      slug = vote.agent.slug;
    }

    if (title) {
      activities.push({
        type: 'vote',
        targetType,
        title,
        slug,
        createdAt: vote.createdAt,
        value: vote.value,
      });
    }
  });

  // Add favorites with content
  favoritesWithContent.forEach(({ favorite, content }) => {
    if (content) {
      activities.push({
        type: 'favorite',
        targetType: favorite.targetType,
        title: content.title,
        slug: content.slug,
        createdAt: favorite.createdAt,
      });
    }
  });

  // Add submissions
  recentPrompts.forEach((item) => {
    activities.push({
      type: 'submission',
      targetType: 'PROMPT' as TargetType,
      title: item.title,
      slug: item.slug,
      createdAt: item.createdAt,
      status: item.status,
    });
  });
  recentTools.forEach((item) => {
    activities.push({
      type: 'submission',
      targetType: 'TOOL' as TargetType,
      title: item.title,
      slug: item.slug,
      createdAt: item.createdAt,
      status: item.status,
    });
  });
  recentMcps.forEach((item) => {
    activities.push({
      type: 'submission',
      targetType: 'MCP' as TargetType,
      title: item.title,
      slug: item.slug,
      createdAt: item.createdAt,
      status: item.status,
    });
  });
  recentInstructions.forEach((item) => {
    activities.push({
      type: 'submission',
      targetType: 'INSTRUCTION' as TargetType,
      title: item.title,
      slug: item.slug,
      createdAt: item.createdAt,
      status: item.status,
    });
  });
  recentAgents.forEach((item) => {
    activities.push({
      type: 'submission',
      targetType: 'AGENT' as TargetType,
      title: item.title,
      slug: item.slug,
      createdAt: item.createdAt,
      status: item.status,
    });
  });

  // Sort by date and take top 10
  return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);
}

function getTypePath(type: TargetType, slug: string): string {
  switch (type) {
    case 'PROMPT':
      return `/prompts/${slug}`;
    case 'TOOL':
      return `/tools/${slug}`;
    case 'MCP':
      return `/mcps/${slug}`;
    case 'INSTRUCTION':
      return `/instructions/${slug}`;
    case 'AGENT':
      return `/agents/${slug}`;
  }
}

function getTypeLabel(type: TargetType): string {
  switch (type) {
    case 'PROMPT':
      return 'Prompt';
    case 'TOOL':
      return 'Tool';
    case 'MCP':
      return 'MCP';
    case 'INSTRUCTION':
      return 'Instruction';
    case 'AGENT':
      return 'Agent';
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/');
  }

  const stats = await getUserStats(session.user.id);
  const recentActivity = await getRecentActivity(session.user.id);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, {session.user?.name || 'User'}!
        </p>
      </div>

      {/* Content Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-400" />
              <CardTitle>Your Prompts</CardTitle>
            </div>
            <CardDescription>Prompts you&apos;ve submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.prompts}</p>
            {stats.prompts > 0 && (
              <Link href="/prompts" className="text-sm text-sky-400 hover:text-sky-300 mt-2 inline-block">
                View all →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-purple-400" />
              <CardTitle>Your Instructions</CardTitle>
            </div>
            <CardDescription>Instructions you&apos;ve created</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.instructions}</p>
            {stats.instructions > 0 && (
              <Link href="/instructions" className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block">
                View all →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-teal-400" />
              <CardTitle>Your Agents</CardTitle>
            </div>
            <CardDescription>Agents you&apos;ve submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.agents}</p>
            {stats.agents > 0 && (
              <Link href="/agents" className="text-sm text-teal-400 hover:text-teal-300 mt-2 inline-block">
                View all →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-slate-400" />
              <CardTitle>Your Tools</CardTitle>
            </div>
            <CardDescription>Tools you&apos;ve shared</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.tools}</p>
            {stats.tools > 0 && (
              <Link href="/tools" className="text-sm text-slate-400 hover:text-slate-300 mt-2 inline-block">
                View all →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plug className="h-5 w-5 text-green-400" />
              <CardTitle>Your MCPs</CardTitle>
            </div>
            <CardDescription>MCP servers you&apos;ve added</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.mcps}</p>
            {stats.mcps > 0 && (
              <Link href="/mcps" className="text-sm text-green-400 hover:text-green-300 mt-2 inline-block">
                View all →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              <CardTitle>Your Favorites</CardTitle>
            </div>
            <CardDescription>Items you&apos;ve favorited</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.favorites}</p>
            {stats.favorites > 0 && (
              <Link href="/dashboard/favorites" className="text-sm text-red-400 hover:text-red-300 mt-2 inline-block">
                View all →
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Stats */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Votes</CardTitle>
            <CardDescription>Content you&apos;ve voted on</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.votes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Collections</CardTitle>
            <CardDescription>Collections you&apos;ve created</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.collections}</p>
            {stats.collections > 0 && (
              <Link href="/dashboard/collections" className="text-sm text-sky-400 hover:text-sky-300 mt-2 inline-block">
                View all →
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent submissions, votes, and favorites</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-slate-700 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No recent activity</p>
              <p className="text-sm text-muted-foreground">
                Start exploring content and voting to see your activity here!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 hover:border-sky-500/40 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {activity.type === 'vote' && (
                      <div className={`p-2 rounded ${activity.value === 1 ? 'bg-sky-500/20 text-sky-400' : 'bg-red-500/20 text-red-400'}`}>
                        {activity.value === 1 ? (
                          <ThumbsUp className="h-4 w-4" />
                        ) : (
                          <ThumbsDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                    {activity.type === 'favorite' && (
                      <div className="p-2 rounded bg-red-500/20 text-red-400">
                        <Heart className="h-4 w-4" />
                      </div>
                    )}
                    {activity.type === 'submission' && (
                      <div className={`p-2 rounded ${
                        activity.status === ContentStatus.APPROVED ? 'bg-green-500/20 text-green-400' :
                        activity.status === ContentStatus.PENDING ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {activity.title ? (
                      <Link
                        href={getTypePath(activity.targetType, activity.slug)}
                        className="text-slate-200 hover:text-sky-400 font-medium block truncate"
                      >
                        {activity.title}
                      </Link>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        {getTypeLabel(activity.targetType)}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {activity.type === 'vote' && `Voted ${activity.value === 1 ? 'up' : 'down'}`}
                        {activity.type === 'favorite' && 'Favorited'}
                        {activity.type === 'submission' && `Submitted ${activity.status === ContentStatus.APPROVED ? '(Approved)' : activity.status === ContentStatus.PENDING ? '(Pending)' : '(Draft)'}`}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GitHub Contribution Note */}
      <Card className="mt-6 border-sky-500/30 bg-sky-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-400" />
            Contributing via GitHub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Since contributions are made via GitHub, submissions made through pull requests will appear here once they&apos;re merged and synced to the database.
          </p>
          <Link
            href="https://github.com/eddybenchek/copilothub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
          >
            Contribute on GitHub →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
