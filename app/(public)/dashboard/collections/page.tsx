'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FolderPlus, Globe, Lock, Trash2, Edit2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';

type Collection = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  items?: any[];
  createdAt: string;
  updatedAt: string;
};

export default function CollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [newCollectionPublic, setNewCollectionPublic] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      addToast('Failed to load collections', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      addToast('Collection name is required', 'error');
      return;
    }

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDesc,
          isPublic: newCollectionPublic,
        }),
      });

      if (response.ok) {
        const newCollection = await response.json();
        // Ensure items array exists
        if (!newCollection.items) {
          newCollection.items = [];
        }
        setCollections([newCollection, ...collections]);
        setShowCreateModal(false);
        setNewCollectionName('');
        setNewCollectionDesc('');
        setNewCollectionPublic(false);
        addToast('Collection created!', 'success');
      } else {
        const error = await response.json();
        addToast(error.error || 'Failed to create collection', 'error');
      }
    } catch (error) {
      addToast('Failed to create collection', 'error');
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) {
      return;
    }

    try {
      const response = await fetch(`/api/collections?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCollections(collections.filter((c) => c.id !== id));
        addToast('Collection deleted', 'success');
      } else {
        addToast('Failed to delete collection', 'error');
      }
    } catch (error) {
      addToast('Failed to delete collection', 'error');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-50">My Collections</h1>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-50">My Collections</h1>
          <p className="text-slate-400 mt-2">
            Organize your favorites into shareable collections
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <FolderPlus className="h-4 w-4" />
          New Collection
        </Button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Collection</CardTitle>
              <CardDescription>Organize your favorites into a collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-200 mb-1 block">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., React Setup"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200 mb-1 block">
                  Description
                </label>
                <textarea
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={newCollectionPublic}
                  onChange={(e) => setNewCollectionPublic(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="public" className="text-sm text-slate-300">
                  Make this collection public (shareable)
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCollection}
                  className="flex-1"
                >
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewCollectionName('');
                    setNewCollectionDesc('');
                    setNewCollectionPublic(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderPlus className="h-16 w-16 text-slate-700 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-200 mb-2">No collections yet</h2>
          <p className="text-slate-400 mb-6">
            Create a collection to organize your favorites
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Collection
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Card 
              key={collection.id} 
              className="hover:border-sky-500/40 transition-colors cursor-pointer"
              onClick={() => router.push(`/dashboard/collections/${collection.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    {collection.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {collection.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1" title={collection.isPublic ? 'Public' : 'Private'}>
                    {collection.isPublic ? (
                      <Globe className="h-4 w-4 text-sky-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    {collection.items?.length || 0} items
                  </span>
                  <div className="flex items-center gap-2">
                    {collection.isPublic && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/collections/${collection.id}`);
                        }}
                      >
                        View Public
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

