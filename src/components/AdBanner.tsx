
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Gift, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AdBannerProps {
  id?: string;
  className?: string;
}

/**
 * Replaced Adsterra Banner with internal Reward Center promotion.
 * This drives traffic to the Adscend Media offer wall.
 */
export function AdBanner({ className }: AdBannerProps) {
  return (
    <div className={className}>
      <Card className="border-none bg-secondary text-secondary-foreground rounded-[2rem] overflow-hidden shadow-xl group hover:scale-[1.01] transition-transform">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="bg-white/20 p-3 rounded-2xl animate-pulse">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight uppercase tracking-tight">Unlock VIP for Free!</h3>
              <p className="text-xs opacity-80 font-medium">Complete one quick offer to get 2 days of Pro features.</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full bg-white text-secondary font-black border-none px-8 hover:bg-white/90" asChild>
            <Link href="/rewards">Start Earning</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
