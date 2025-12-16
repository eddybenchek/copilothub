'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TargetType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { analytics } from '@/lib/analytics';

interface FavoriteButtonProps {
  targetId: string;
  targetType: TargetType;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'primary';
  showLabel?: boolean;
}

export function FavoriteButton({
  targetId,
  targetType,
  size = 'sm',
  variant = 'ghost' as const,
  showLabel = false,
}: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if favorited on mount
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/favorites/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetIds: [targetId], targetType }),
      });
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data[targetId] || false);
      }
    } catch (error) {
      // Silently fail - user might not be logged in
    }
  };
      checkFavoriteStatus();
    }
  }, [status, session, targetId, targetType]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated' || !session?.user) {
      addToast('Please sign in to save favorites', 'error');
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
      await signIn('github', { callbackUrl: currentPath });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, targetType }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.favorited);
        addToast(data.favorited ? 'Saved to favorites' : 'Removed from favorites', 'success');
        
        // Track analytics
        const contentType = targetType.toLowerCase() as 'prompt' | 'instruction' | 'agent' | 'mcp' | 'tool';
        analytics.trackFavorite(contentType, targetId, data.favorited ? 'added' : 'removed');
      } else {
        const error = await response.json();
        addToast(error.error || 'Failed to update favorite', 'error');
      }
    } catch (error) {
      addToast('Failed to update favorite', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={isFavorited ? 'text-red-400 hover:text-red-300' : ''}
    >
      <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
      {showLabel && (
        <span className="ml-2">{isFavorited ? 'Saved' : 'Save'}</span>
      )}
    </Button>
  );
}

