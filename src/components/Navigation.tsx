"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, User, Bell, Search, ShieldCheck, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Dashboard", href: "/dashboard", icon: ShieldCheck, authRequired: true },
  { label: "Jobs", href: "/jobs", icon: ClipboardList, authRequired: true },
  { label: "Profile", href: "/profile", icon: User, authRequired: true },
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 backdrop-blur-lg md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <Link href="/" className="hidden items-center gap-2 md:flex hover:opacity-90 transition-opacity">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">CareerGoMW</span>
        </Link>
        
        <div className="flex w-full items-center justify-around md:w-auto md:justify-end md:gap-8">
          {navItems.map((item) => {
            if (item.authRequired && !user) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors hover:text-primary md:flex-row md:gap-2",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6 md:h-5 md:w-5" />
                <span className="text-[10px] font-medium md:text-sm">{item.label}</span>
              </Link>
            );
          })}
          
          {!user && (
            <Link
              href="/login"
              className={cn(
                "flex flex-col items-center gap-1 transition-colors hover:text-primary md:flex-row md:gap-2",
                pathname === "/login" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <LogIn className="h-6 w-6 md:h-5 md:w-5" />
              <span className="text-[10px] font-medium md:text-sm">Sign In</span>
            </Link>
          )}

          {user && (
            <Link href="/notifications" className="relative md:hidden">
              <Bell className="h-6 w-6 text-muted-foreground" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                3
              </span>
            </Link>
          )}
        </div>

        {user && (
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/notifications" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-secondary-foreground">
                3
              </span>
            </Link>
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </nav>
  );
}
