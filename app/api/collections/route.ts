import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { ContentStatus, TargetType } from '@prisma/client';

// This route supports /api/collections (list, create) and /api/collections/:id (single public)

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (id) {
    const collection = await db.collection.findUnique({
      where: { id },
      include: { items: true, user: { select: { name: true, id: true } } },
    });
    
    if (!collection) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check if user owns this collection or if it's public
    const isOwner = session?.user?.id === collection.userId;
    if (!isOwner && !collection.isPublic) {
      return NextResponse.json({ error: 'Not found or not public' }, { status: 404 });
    }

    // Fetch content for each item
    const itemsWithContent = await Promise.all(
      collection.items.map(async (item) => {
        let content: any = null;
        
        switch (item.targetType) {
          case 'PROMPT':
            content = await db.prompt.findUnique({
              where: { id: item.targetId, status: ContentStatus.APPROVED },
              select: { id: true, title: true, slug: true, description: true },
            });
            break;
          case 'TOOL':
            content = await db.tool.findUnique({
              where: { id: item.targetId, status: ContentStatus.APPROVED },
              select: { id: true, title: true, name: true, slug: true, description: true, shortDescription: true },
            });
            break;
          case 'MCP':
            content = await (db as any).mcpServer.findUnique({
              where: { id: item.targetId, status: ContentStatus.APPROVED },
              select: { id: true, title: true, name: true, slug: true, description: true, shortDescription: true },
            });
            break;
          case 'INSTRUCTION':
            content = await db.instruction.findUnique({
              where: { id: item.targetId, status: ContentStatus.APPROVED },
              select: { id: true, title: true, slug: true, description: true },
            });
            break;
          case 'AGENT':
            content = await db.agent.findUnique({
              where: { id: item.targetId, status: ContentStatus.APPROVED },
              select: { id: true, title: true, slug: true, description: true },
            });
            break;
        }

        return {
          ...item,
          content,
        };
      })
    );

    return NextResponse.json({
      ...collection,
      items: itemsWithContent,
    });
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // User's own collections (all, public and private)
  const collections = await db.collection.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(collections);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { name, description, isPublic } = body;
  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }
  const col = await db.collection.create({
    data: {
      userId: session.user.id,
      name,
      description: description || '',
      isPublic: Boolean(isPublic),
    },
    include: {
      items: true,
    },
  });
  return NextResponse.json(col);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { id, name, description, isPublic, items } = body;

  const existing = await db.collection.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
  }

  const updated = await db.collection.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      description: description ?? existing.description,
      isPublic: isPublic ?? existing.isPublic,
    },
  });

  if (items && Array.isArray(items)) {
    // Remove all old items, add new
    await db.collectionItem.deleteMany({ where: { collectionId: id } });
    await db.collectionItem.createMany({
      data: items.map((item: any) => ({
        collectionId: id,
        targetId: item.targetId,
        targetType: item.targetType,
      })),
      skipDuplicates: true,
    });
  }

  // Return updated collection with items
  const updatedWithItems = await db.collection.findUnique({
    where: { id },
    include: { items: true },
  });

  return NextResponse.json(updatedWithItems);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const existing = await db.collection.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
  }
  await db.collection.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
