"use client";

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  id: string;
  format?: 'banner' | 'native' | 'social-bar';
  className?: string;
}

/**
 * Reusable Adsterra Ad Component.
 * Optimized for real-time script injection and React lifecycle.
 */
export function AdBanner({ id, format = 'banner', className }: AdBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adContainerRef.current) return;

    // Clear previous ad if any
    adContainerRef.current.innerHTML = '';

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      adContainerRef.current.innerHTML = `
        <div class="w-full h-[90px] bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center text-center p-4">
          <span class="text-[8px] font-black uppercase tracking-widest text-primary/40 mb-1">Production Ad Placement</span>
          <span class="text-[10px] font-bold text-muted-foreground">Ad ID: ${id}</span>
        </div>
      `;
      return;
    }

    // Production: Inject Adsterra Script
    try {
      const script = document.createElement('script');
      // Adsterra standard banner pattern (Replace with your actual script src if different)
      script.src = `//www.profitabledisplaynetwork.com/watchman?key=${id}`;
      script.async = true;
      script.type = 'text/javascript';
      
      adContainerRef.current.appendChild(script);
    } catch (e) {
      console.error('Ad injection failed:', e);
    }
  }, [id]);

  return (
    <div className={className}>
      <div ref={adContainerRef} className="w-full mx-auto overflow-hidden min-h-[90px]" />
    </div>
  );
}
