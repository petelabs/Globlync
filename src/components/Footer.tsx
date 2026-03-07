
"use client";

import Link from "next/link";
import { Logo } from "@/components/Navigation";
import { MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary/5 py-16 border-t mt-auto px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          <div className="space-y-6 text-center md:text-left">
            <Logo className="justify-center md:justify-start" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto md:mx-0">
              Building a verifiable labor market for every professional across the globe.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
              <MapPin className="h-3 w-3" /> HQ: Mulanje, Malawi (Global Support)
            </div>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Platform</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Find Professionals</Link>
              <Link href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Find Work</Link>
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Advertising</Link>
            </nav>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Support</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
              <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            </nav>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Office</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Petediano Tech<br/>
              Dzenje Village, Mulanje<br/>
              Republic of Malawi
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          <p>© 2026 Petediano Tech • Global</p>
          <div className="flex gap-6">
            <Link href="/contact" className="hover:text-primary transition-colors">Report an Ad</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
