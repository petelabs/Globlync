
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Home, 
  Briefcase, 
  User, 
  Bell, 
  Search, 
  ShieldCheck, 
  LogIn,
  Settings,
  LogOut,
  LayoutDashboard,
  ClipboardCheck,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [logoError, setLogoError] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
      toast({
        title: "Signed Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
      });
    }
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Jobs", href: "/jobs", icon: Briefcase },
    { label: "Log Work", href: "/work-log", icon: ClipboardCheck, authRequired: true },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-card/80 backdrop-blur-lg h-16">
        <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0 group">
            {!logoError ? (
              <Image 
                src="/logo.png" 
                alt="Globlync Logo" 
                width={36} 
                height={36} 
                className="rounded-lg shadow-sm"
                onError={() => setLogoError(true)}
              />
            ) : (
              <ShieldCheck className="h-7 w-7 text-primary" />
            )}
            <span className="text-2xl font-black tracking-tighter italic animate-shimmer-text hidden sm:block">
              Globlync
            </span>
          </Link>
          
          <div className="flex-1 flex justify-center px-4 max-w-md">
            <Button 
              variant="outline" 
              className="w-full justify-start text-muted-foreground rounded-full h-10 px-4 bg-muted/30 hover:bg-muted/50 transition-all border-2"
              onClick={() => router.push('/search')}
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Search verified pros...</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {user && (
              <>
                <Link href="/notifications" className="relative p-2 hover:bg-muted rounded-full transition-colors hidden xs:flex">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground border-2 border-card">
                    3
                  </span>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted transition-all outline-none border border-transparent focus:border-primary/20">
                      <Avatar className="h-9 w-9 border-2 border-primary/20 ring-2 ring-primary/5">
                        <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2 p-2 rounded-2xl shadow-2xl border-none" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal px-2 py-3">
                      <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10">
                          <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
                        </Avatar>
                        <div className="flex flex-col space-y-0.5">
                          <p className="text-sm font-bold leading-none">{user.displayName || "Professional"}</p>
                          <p className="text-[10px] font-medium leading-none text-muted-foreground mt-1 truncate max-w-[140px]">{user.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="mx-[-8px] my-2" />
                    <div className="space-y-1">
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
                          <span className="font-semibold">Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                        <Link href="/work-log">
                          <ClipboardCheck className="mr-3 h-4 w-4 text-primary" />
                          <span className="font-semibold">Log New Work</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                        <Link href="/profile">
                          <User className="mr-3 h-4 w-4 text-primary" />
                          <span className="font-semibold">My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                        <Link href="/settings">
                          <Settings className="mr-3 h-4 w-4 text-primary" />
                          <span className="font-semibold">Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="mx-[-8px] my-2" />
                    <DropdownMenuItem 
                      className="text-destructive font-bold cursor-pointer rounded-lg py-2.5 focus:bg-destructive/5 focus:text-destructive" 
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!user && (
              <Button asChild className="rounded-full shadow-lg font-bold px-6" size="sm">
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/90 backdrop-blur-xl md:hidden h-16">
        <div className="flex h-full items-center justify-around px-4">
          {navItems.map((item) => {
            if (item.authRequired && !user) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
                <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
              </Link>
            );
          })}
          
          {user && (
            <Link
              href="/notifications"
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                pathname === "/notifications" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                  3
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-tight uppercase">Inbox</span>
            </Link>
          )}

          {!user && (
            <Link
              href="/search"
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                pathname === "/search" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Search className="h-6 w-6" />
              <span className="text-[10px] font-bold tracking-tight uppercase">Search</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Desktop Sub Nav */}
      <div className="hidden md:flex fixed top-16 left-0 right-0 h-12 bg-background/50 border-b items-center justify-center gap-8 z-40 backdrop-blur-sm">
        {navItems.map((item) => {
          if (item.authRequired && !user) return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-xs font-black uppercase tracking-widest transition-colors",
                isActive ? "text-primary border-b-2 border-primary h-full flex items-center" : "text-muted-foreground hover:text-primary"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
