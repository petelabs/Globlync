"use client";

import { useState, useEffect } from "react";
import { Fan, Smile, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function WinterFanDecoration() {
  const [isPaused, setIsPaused] = useState(false);
  const [snowflakes, setSnowflakes] = useState<{ id: number; delay: number; duration: number; left: number; size: number }[]>([]);

  useEffect(() => {
    // Generate random snowflakes
    const flakes = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 10,
      left: Math.random() * 100,
      size: 2 + Math.random() * 6
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed top-20 left-4 z-[60] flex items-center gap-2 group pointer-events-none">
      <div className="relative pointer-events-auto">
        <div className={cn(
          "bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border-2 border-primary/20 transition-all duration-500",
          !isPaused && "animate-float"
        )}>
          <Fan className={cn(
            "h-10 w-10 text-primary transition-all duration-300",
            !isPaused && "animate-spin"
          )} style={{ animationDuration: '2s' }} />
        </div>
        
        {/* Smiling Toy Avatar */}
        <div className="absolute -right-6 -bottom-2 bg-secondary p-1.5 rounded-full shadow-md border-2 border-white animate-bounce pointer-events-none">
          <Smile className="h-5 w-5 text-secondary-foreground" />
        </div>

        {/* Pause/Play Controls */}
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute -top-4 -right-4 h-8 w-8 rounded-full shadow-xl border-2 border-white pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3 fill-current" />}
        </Button>
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary drop-shadow-sm">System Cooling</span>
        <span className="text-[8px] font-bold text-muted-foreground opacity-60">Globlync Visual FX</span>
      </div>

      {/* Snow Particles */}
      {!isPaused && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen">
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="absolute bg-white rounded-full opacity-0 animate-snow blur-[1px]"
              style={{
                left: `${flake.left}%`,
                top: `-20px`,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
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