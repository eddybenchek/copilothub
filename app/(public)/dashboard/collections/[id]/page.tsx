'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Plus, 
  X, 
  Globe, 
  Lock,
  Sparkles,
  FileCode,
  Bot,
  Plug,
  Wrench,
  Save,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';
import { TargetType } from '@prisma/client';

type Collection = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  items: CollectionItem[];
  createdAt: string;
  updatedAt: string;
};

type CollectionItem = {
  id: string;
  targetId: string;
  targetType: TargetType;
  content?: any;
};

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

export default function CollectionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      const loadCollection = async () => {
        try {
          const response = await fetch(`/api/collections?id=${collectionId}`);
          if (response.ok) {
            const data = await response.json();
            setCollection(data);
            setEditName(data.name);
            setEditDescription(data.description || '');
            setEditIsPublic(data.isPublic);
          } else if (response.status === 404) {
            addToast('Collection not found', 'error');
            router.push('/dashboard/collections');
          } else {
            addToast('Failed to load collection', 'error');
          }
        } catch (error) {
          addToast('Failed to load collection', 'error');
        } finally {
          setIsLoading(false);
        }
      };
      loadCollection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, collectionId]);


  const handleSave = async () => {
    if (!editName.trim()) {
      addToast('Collection name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: collectionId,
          name: editName,
          description: editDescription,
          isPublic: editIsPublic,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCollection(updated);
        setIsEditing(false);
        addToast('Collection updated', 'success');
      } else {
        const error = await response.json();
        addToast(error.error || 'Failed to update collection', 'error');
      }
    } catch (error) {
      addToast('Failed to update collection', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/collections?id=${collectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        addToast('Collection deleted', 'success');
        router.push('/dashboard/collections');
      } else {
        addToast('Failed to delete collection', 'error');
      }
    } catch (error) {
      addToast('Failed to delete collection', 'error');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!collection) return;

    const newItems = collection.items.filter((item) => item.id !== itemId);
    
    try {
      const response = await fetch('/api/collections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: collectionId,
          items: newItems.map((item) => ({
            targetId: item.targetId,
            targetType: item.targetType,
          })),
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCollection(updated);
        addToast('Item removed from collection', 'success');
      } else {
        addToast('Failed to remove item', 'error');
      }
    } catch (error) {
      addToast('Failed to remove item', 'error');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-50">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-50">Collection not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/collections"
          className="mb-4 inline-flex items-center gap-2 text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Link>
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Collection name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-2xl font-bold text-slate-100"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100"
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="public"
                    checked={editIsPublic}
                    onChange={(e) => setEditIsPublic(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="public" className="text-sm text-slate-300">
                    Make this collection public (shareable)
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(collection.name);
                      setEditDescription(collection.description || '');
                      setEditIsPublic(collection.isPublic);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-slate-50">{collection.name}</h1>
                  <div title={collection.isPublic ? 'Public' : 'Private'}>
                    {collection.isPublic ? (
                      <Globe className="h-5 w-5 text-sky-400" />
                    ) : (
                      <Lock className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                </div>
                {collection.description && (
                  <p className="text-xl text-slate-400 mb-2">{collection.description}</p>
                )}
                <p className="text-sm text-slate-500">
                  {collection.items.length} {collection.items.length === 1 ? 'item' : 'items'}
                </p>
              </>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex items-center gap-2">
              {collection.isPublic && (
                <Link href={`/collections/${collection.id}`}>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    View Public
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      {collection.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-slate-800 p-6 mb-4">
            <Plus className="h-12 w-12 text-slate-500" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-200 mb-2">No items yet</h2>
          <p className="text-slate-400 mb-6">
            Start adding items to this collection from any content page
          </p>
          <div className="flex gap-3">
            <Link href="/prompts">
              <Button variant="outline">Browse Prompts</Button>
            </Link>
            <Link href="/instructions">
              <Button variant="outline">Browse Instructions</Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline">Browse Agents</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collection.items.map((item) => {
            if (!item.content) return null;

            return (
              <Card
                key={item.id}
                className="transition duration-150 hover:scale-[1.01] hover:shadow-[0_0_18px_rgba(56,189,248,0.25)] hover:border-sky-500/40"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getTypeIcon(item.targetType)}
                      <CardTitle className="text-lg line-clamp-2">
                        {item.content.title || item.content.name || 'Untitled'}
                      </CardTitle>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove from collection"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {item.content.description || item.content.shortDescription || ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Link
                      href={getTypePath(item.targetType, item.content.slug)}
                      className="text-sm text-sky-400 hover:text-sky-300"
                    >
                      View details →
                    </Link>
                    <Badge variant="outline" className="capitalize">
                      {item.targetType}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

