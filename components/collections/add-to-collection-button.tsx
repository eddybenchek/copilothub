'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Star, FolderPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { TargetType } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface AddToCollectionButtonProps {
  targetId: string;
  targetType: TargetType;
  targetTitle?: string;
}

type Collection = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  items?: any[];
};

export function AddToCollectionButton({
  targetId,
  targetType,
  targetTitle,
}: AddToCollectionButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [collectionCount, setCollectionCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Check collection count on mount and when target changes
  useEffect(() => {
    if (status === 'authenticated') {
      const checkCollections = async () => {
        setIsChecking(true);
        try {
          const response = await fetch('/api/collections');
          if (response.ok) {
            const data = await response.json();
            // Count how many collections contain this item
            const count = data.filter((col: Collection) =>
              col.items?.some((item: any) => item.targetId === targetId && item.targetType === targetType)
            ).length;
            setCollectionCount(count);
          }
        } catch (error) {
          // Silently fail - user might not be logged in
        } finally {
          setIsChecking(false);
        }
      };
      checkCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, targetId, targetType]);

  // Load collections when modal opens
  useEffect(() => {
    if (showModal && status === 'authenticated') {
      const loadCollections = async () => {
        try {
          const response = await fetch('/api/collections');
          if (response.ok) {
            const data = await response.json();
            setCollections(data);
            // Check which collections already contain this item
            const existing = new Set<string>();
            data.forEach((col: Collection) => {
              if (col.items?.some((item: any) => item.targetId === targetId && item.targetType === targetType)) {
                existing.add(col.id);
              }
            });
            setSelectedCollections(existing);
            setCollectionCount(existing.size);
          }
        } catch (error) {
          addToast('Failed to load collections', 'error');
        }
      };
      loadCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, status, targetId, targetType]);


  const handleToggleCollection = async (collectionId: string) => {
    if (!session?.user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      await signIn('github', { callbackUrl: currentPath });
      return;
    }

    setIsLoading(true);
    try {
      const collection = collections.find((c) => c.id === collectionId);
      if (!collection) return;

      const isCurrentlyInCollection = selectedCollections.has(collectionId);
      const currentItems = collection.items || [];
      
      let newItems;
      if (isCurrentlyInCollection) {
        // Remove item
        newItems = currentItems.filter(
          (item: any) => !(item.targetId === targetId && item.targetType === targetType)
        );
      } else {
        // Add item
        newItems = [
          ...currentItems,
          { targetId, targetType },
        ];
      }

      const response = await fetch('/api/collections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: collectionId,
          items: newItems,
        }),
      });

      if (response.ok) {
        if (isCurrentlyInCollection) {
          setSelectedCollections((prev) => {
            const next = new Set(prev);
            next.delete(collectionId);
            return next;
          });
          setCollectionCount((prev) => Math.max(0, prev - 1));
          addToast('Removed from collection', 'success');
        } else {
          setSelectedCollections((prev) => new Set(prev).add(collectionId));
          setCollectionCount((prev) => prev + 1);
          addToast('Added to collection', 'success');
        }
        // Refresh collections to get updated item counts
        const refreshResponse = await fetch('/api/collections');
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          setCollections(refreshedData);
        }
      } else {
        const error = await response.json();
        addToast(error.error || 'Failed to update collection', 'error');
      }
    } catch (error) {
      addToast('Failed to update collection', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    router.push('/dashboard/collections');
    setShowModal(false);
  };

  const handleClick = async () => {
    if (status !== 'authenticated') {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      await signIn('github', { callbackUrl: currentPath });
      return;
    }
    setShowModal(true);
  };

  const isInCollections = collectionCount > 0;
  const buttonText = isInCollections 
    ? `In ${collectionCount} ${collectionCount === 1 ? 'Collection' : 'Collections'}`
    : 'Add to Collection';

  return (
    <>
      <Button 
        size="lg" 
        variant={isInCollections ? 'primary' : 'outline'}
        onClick={handleClick}
        disabled={isChecking}
      >
        <Star className={`mr-2 h-5 w-5 ${isInCollections ? 'fill-current' : ''}`} />
        {buttonText}
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {collectionCount > 0 ? 'Manage Collections' : 'Add to Collection'}
                </CardTitle>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-200"
                  aria-label="Close collection modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {targetTitle && (
                <p className="text-sm text-slate-400 mt-2">
                  {collectionCount > 0 ? 'Managing' : 'Adding'}: <span className="text-slate-200">{targetTitle}</span>
                </p>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {collections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No collections yet</p>
                  <Button onClick={handleCreateNew}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create Your First Collection
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {collections.map((collection) => {
                    const isSelected = selectedCollections.has(collection.id);
                    return (
                      <div
                        key={collection.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-sky-500/50 bg-sky-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                        onClick={() => handleToggleCollection(collection.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-200">{collection.name}</h3>
                            {collection.isPublic && (
                              <span className="text-xs text-sky-400">Public</span>
                            )}
                          </div>
                          {collection.description && (
                            <p className="text-sm text-slate-400 mt-1">{collection.description}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            {collection.items?.length || 0} items
                          </p>
                        </div>
                        <div className="ml-4">
                          {isSelected ? (
                            <div className="rounded-full bg-sky-500 p-1">
                              <Star className="h-4 w-4 fill-white text-white" />
                            </div>
                          ) : (
                            <div className="rounded-full border border-slate-600 p-1">
                              <Star className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    onClick={handleCreateNew}
                    className="w-full mt-4"
                  >
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create New Collection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

