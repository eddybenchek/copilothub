'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { TargetType } from '@prisma/client';

interface VoteButtonProps {
  targetId: string;
  targetType: TargetType;
  initialVoteCount?: number;
  initialUserVote?: number | null; // 1 for upvote, -1 for downvote, null for no vote
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  showCount?: boolean;
}

export function VoteButton({
  targetId,
  targetType,
  initialVoteCount = 0,
  initialUserVote = null,
  size = 'md',
  orientation = 'horizontal',
  showCount = true,
}: VoteButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's vote on mount if authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user && initialUserVote === undefined) {
      fetchUserVote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, targetId, targetType]);

  const fetchUserVote = async () => {
    try {
      const response = await fetch(`/api/votes?targetId=${targetId}&targetType=${targetType}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.value !== undefined) {
          setUserVote(data.value);
        }
      }
    } catch (error) {
      // Silently fail - user might not be logged in
    }
  };

  const handleVote = async (value: 1 | -1) => {
    if (status !== 'authenticated' || !session?.user) {
      addToast('Please sign in to vote', 'error');
      router.push('/api/auth/signin');
      return;
    }

    setIsLoading(true);
    const previousVote = userVote;
    const previousCount = voteCount;

    // Optimistic update
    let newCount = voteCount;
    if (previousVote === value) {
      // User is removing their vote
      setUserVote(null);
      newCount = voteCount - value;
      setVoteCount(newCount);
    } else if (previousVote === -value) {
      // User is changing from upvote to downvote or vice versa
      setUserVote(value);
      newCount = voteCount + (value * 2); // Remove old vote (-value) and add new vote (+value)
      setVoteCount(newCount);
    } else {
      // User is adding a new vote
      setUserVote(value);
      newCount = voteCount + value;
      setVoteCount(newCount);
    }

    try {
      if (previousVote === value) {
        // Remove vote
        const response = await fetch(`/api/votes?targetId=${targetId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove vote');
        }
      } else {
        // Create or update vote
        const response = await fetch('/api/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetId,
            targetType,
            value,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to vote');
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setUserVote(previousVote);
      setVoteCount(previousCount);
      addToast('Failed to vote. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  const isUpvoted = userVote === 1;
  const isDownvoted = userVote === -1;

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 p-3">
        <Button
          variant="ghost"
          size={size}
          className={`${sizeClasses[size]} p-0 rounded-md border transition-all ${
            isUpvoted
              ? 'border-sky-500 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 hover:border-sky-400'
              : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-300'
          }`}
          onClick={() => handleVote(1)}
          disabled={isLoading}
          aria-label="Upvote"
        >
          <ThumbsUp className={iconSizes[size]} />
        </Button>
      {showCount && (
        <span className={`text-base font-bold min-w-[2ch] text-center ${
          voteCount > 0 ? 'text-sky-400' : voteCount < 0 ? 'text-red-400' : 'text-slate-300'
        }`}>
          {voteCount > 0 ? `+${voteCount}` : voteCount}
        </span>
      )}
        <Button
          variant="ghost"
          size={size}
          className={`${sizeClasses[size]} p-0 rounded-md border transition-all ${
            isDownvoted
              ? 'border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:border-red-400'
              : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-300'
          }`}
          onClick={() => handleVote(-1)}
          disabled={isLoading}
          aria-label="Downvote"
        >
          <ThumbsDown className={iconSizes[size]} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2">
      <Button
        variant="ghost"
        size={size}
        className={`${sizeClasses[size]} p-0 rounded-md border transition-all ${
          isUpvoted
            ? 'border-sky-500 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 hover:border-sky-400'
            : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-300'
        }`}
        onClick={() => handleVote(1)}
        disabled={isLoading}
        aria-label="Upvote"
      >
        <ThumbsUp className={iconSizes[size]} />
      </Button>
      {showCount && (
        <span className={`text-base font-bold min-w-[3ch] text-center ${
          voteCount > 0 ? 'text-sky-400' : voteCount < 0 ? 'text-red-400' : 'text-slate-300'
        }`}>
          {voteCount > 0 ? `+${voteCount}` : voteCount}
        </span>
      )}
      <Button
        variant="ghost"
        size={size}
        className={`${sizeClasses[size]} p-0 rounded-md border transition-all ${
          isDownvoted
            ? 'border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:border-red-400'
            : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-300'
        }`}
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        aria-label="Downvote"
      >
        <ThumbsDown className={iconSizes[size]} />
      </Button>
    </div>
  );
}

