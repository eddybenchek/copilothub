'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Component to handle scrolling to hash anchors after navigation
 * This is needed because Next.js doesn't automatically scroll to hash fragments
 * when navigating client-side
 */
export function HashScrollHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash) {
        // Try multiple times with increasing delays to handle async content loading
        const scrollToHash = (attempt = 0) => {
          const element = document.getElementById(hash);
          if (element) {
            // Add offset for sticky header if needed
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          } else if (attempt < 10) {
            // Retry up to 10 times with increasing delays (markdown might take longer to render)
            setTimeout(() => scrollToHash(attempt + 1), 300 * (attempt + 1));
          }
        };
        scrollToHash();
      }
    };

    // Delay to ensure DOM and markdown content is ready
    // Markdown rendering can take time, especially with code blocks
    setTimeout(handleHashScroll, 300);
    
    // Also listen for hash changes (in case user clicks anchor link on same page)
    window.addEventListener('hashchange', handleHashScroll);
    
    return () => {
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, [pathname, searchParams]);

  return null;
}
