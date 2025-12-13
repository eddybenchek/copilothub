'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function ShareButton() {
  const { addToast } = useToast();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(() => {
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Link copied to clipboard!', 'success');
  };

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className="flex items-center gap-2"
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
}

