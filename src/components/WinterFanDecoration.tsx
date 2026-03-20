"use client";

import { useState, useEffect } from "react";
import { Fan, Smile, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function WinterFanDecoration() {
  const [isPaused, setIsPaused] = useState(false);
  const [isGlobalDisabled, setIsGlobalDisabled] = useState(false);
  const [snowflakes, setSnowflakes] = useState<{ id: number; delay: number; duration: number; left: number; size: number; blur: number; opacity: number }[]>([]);

  useEffect(() => {
    // Check if animations are disabled in global settings
    const checkGlobalSettings = () => {
      const isDisabled = document.documentElement.classList.contains('no-animations');
      setIsGlobalDisabled(isDisabled);
    };

    checkGlobalSettings();
    
    // Listen for changes to global settings via a simple interval check (as DOM changes don't fire events)
    const interval = setInterval(checkGlobalSettings, 1000);

    // Generate random snowflakes with more "beautiful" attributes
    const flakes = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 12,
      left: Math.random() * 100,
      size: 2 + Math.random() * 8,
      blur: Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.5
    }));
    setSnowflakes(flakes);

    return () => clearInterval(interval);
  }, []);

  if (isGlobalDisabled) return null;

  return (
    <div className="fixed top-20 left-4 z-[60] flex items-center gap-2 group pointer-events-none">
      <div className="relative pointer-events-auto">
        <div className={cn(
          "bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border-2 border-primary/20 transition-all duration-500",
          !isPaused && "animate-float"
        )}>
          <Fan className={cn(
            "h-10 w-10 text-primary transition-all",
            !isPaused ? "animate-fun-spin" : "rotate-45 opacity-40"
          )} />
        </div>
        
        {/* Smiling Toy Avatar */}
        <div className={cn(
          "absolute -right-6 -bottom-2 bg-secondary p-1.5 rounded-full shadow-md border-2 border-white pointer-events-none transition-transform duration-500",
          !isPaused ? "animate-bounce" : "scale-90 grayscale opacity-50"
        )}>
          <Smile className="h-5 w-5 text-secondary-foreground" />
        </div>

        {/* Pause/Play Controls */}
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute -top-4 -right-4 h-8 w-8 rounded-full shadow-xl border-2 border-white pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-muted"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? <Play className="h-3 w-3 fill-current text-primary" /> : <Pause className="h-3 w-3 fill-current text-primary" />}
        </Button>
      </div>

      <div className="flex flex-col select-none">
        <span className={cn(
          "text-[10px] font-black uppercase tracking-widest text-primary drop-shadow-sm transition-opacity",
          isPaused && "opacity-40"
        )}>
          System Cooling
        </span>
        <span className="text-[8px] font-bold text-muted-foreground opacity-60">Globlync Visual FX</span>
      </div>

      {/* Snow Particles - Completely removed when paused for "disappearance" */}
      {!isPaused && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen transition-opacity duration-1000">
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="absolute bg-white rounded-full opacity-0 animate-snow"
              style={{
                left: `${flake.left}%`,
                top: `-20px`,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                filter: `blur(${flake.blur}px)`,
                opacity: flake.opacity,
                animationDelay: `${flake.delay}s`,
                animationDuration: `${flake.duration}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}