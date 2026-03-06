"use client";

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  id: string;
  format?: 'banner' | 'native' | 'social-bar';
  className?: string;
}

/**
 * Reusable Adsterra Ad Component.
 * Replace the 'src' and 'key' placeholders with your actual Adsterra script details.
 */
export function AdBanner({ id, format = 'banner', className }: AdBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This is a placeholder for the Adsterra script injection.
    // In production, you would replace this with the actual script provided by Adsterra.
    if (adContainerRef.current && !adContainerRef.current.firstChild) {
      const script = document.createElement('script');
      // Example Adsterra Banner Script Pattern:
      // script.src = `//www.profitabledisplaynetwork.com/watchman?key=${id}`;
      script.async = true;
      script.type = 'text/javascript';
      
      // Since we don't have the live script, we show a professional placeholder in dev
      if (process.env.NODE_ENV === 'development') {
        adContainerRef.current.innerHTML = `
          <div class="w-full h-full min-h-[90px] bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            Ad Placement: ${id}
          </div>
        `;
      } else {
        adContainerRef.current.appendChild(script);
      }
    }
  }, [id]);

  return (
    <div className={className}>
      <div ref={adContainerRef} className="w-full mx-auto overflow-hidden" />
    </div>
  );
}
