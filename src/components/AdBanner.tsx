
"use client";

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  id: string;
  className?: string;
}

/**
 * Reusable Adsterra Ad Component.
 * Optimized for the user's specific Native Banner script.
 */
export function AdBanner({ id, className }: AdBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We only run this on the client and in production
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev && adContainerRef.current) {
      adContainerRef.current.innerHTML = `
        <div class="w-full h-[150px] bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center text-center p-4">
          <span class="text-[8px] font-black uppercase tracking-widest text-primary/40 mb-1">Production Ad Placement</span>
          <span class="text-[10px] font-bold text-muted-foreground">Native Banner Zone: ${id}</span>
        </div>
      `;
      return;
    }

    // In production, we inject the specific Adsterra script provided by the user
    // The script expects a container with id="container-[id]"
    const scriptId = `ad-script-${id}`;
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      // Using the user's specific native banner domain
      script.src = `https://walkingdrunkard.com/${id}/invoke.js`;
      document.body.appendChild(script);
    }
  }, [id]);

  return (
    <div className={className}>
      {/* Adsterra Native Banner container ID format: container-[ZONE_ID] */}
      <div id={`container-${id}`} className="w-full mx-auto min-h-[50px]" />
    </div>
  );
}
