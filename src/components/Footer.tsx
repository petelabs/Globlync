
"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 border-t mt-auto px-6 bg-muted/5">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-center md:text-left">
          <div className="space-y-2">
            <p>© 2026 Petediano Tech • Global Professional Network</p>
            <p className="text-[8px] opacity-60">Built with purpose in Dzenje Village, Mulanje</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-primary transition-colors">Our Story</Link>
              <Link href="/settings" className="hover:text-primary transition-colors">Platform Info</Link>
              <Link href="/settings" className="hover:text-primary transition-colors">Legal</Link>
            </div>
            
            <a 
              href="https://peterdamiano.vercel.app" 
              target="_blank" 
              className="flex items-center gap-1.5 text-primary/60 hover:text-primary transition-colors border-l md:pl-6 border-muted"
            >
              Developer: Peter Damiano <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
