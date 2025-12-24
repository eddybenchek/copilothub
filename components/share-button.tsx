'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface ShareButtonProps {
  url?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
  showLabel?: boolean;
}

export function ShareButton({ 
  url, 
  title, 
  size = 'lg', 
  variant = 'ghost',
  showLabel = true 
}: ShareButtonProps) {
  const { addToast } = useToast();

  const handleShare = async () => {
    // Use provided URL or current page URL
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareTitle = title || (typeof window !== 'undefined' ? document.title : '');

    // Try native Web Share API first (mobile/desktop with support)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return;
      } catch (error: any) {
        // User cancelled or error occurred, fall back to clipboard
        if (error.name !== 'AbortError') {
          // Only log non-cancellation errors
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        addToast('Link copied to clipboard!', 'success');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        addToast('Link copied to clipboard!', 'success');
      }
    } catch (error) {
      addToast('Failed to copy link', 'error');
    }
  };

  return (
    <Button 
      size={size} 
      variant={variant} 
      onClick={handleShare}
      aria-label={showLabel ? undefined : 'Share'}
    >
      <Share2 className="mr-2 h-5 w-5" />
      {showLabel && 'Share'}
    </Button>
  );
}

