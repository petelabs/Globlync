
"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 border-t mt-auto px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] text-center md:text-left">
          <p>© 2026 Petediano Tech • Global Professional Network</p>
          <div className="flex gap-6">
            <Link href="/settings" className="hover:text-primary transition-colors">Platform Info</Link>
            <Link href="/settings" className="hover:text-primary transition-colors">Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
