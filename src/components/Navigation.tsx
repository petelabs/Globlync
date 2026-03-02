"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ClipboardCheck
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

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

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
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary hidden sm:block">Globlync</span>
          </Link>
          
          <div className="flex-1 flex justify-center px-4 max-w-md">
            <Button 
              variant="outline" 
              className="w-full justify-start text-muted-foreground rounded-full h-10 px-4 bg-muted/30"
              onClick={() => router.push('/search')}
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-sm">Search workers...</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {user && (
              <>
                <Link href="/notifications" className="relative p-2 hover:bg-muted rounded-full transition-colors">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground border-2 border-card">
                    3
                  </span>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/work-log" className="cursor-pointer">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        <span>Log New Work</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!user && (
              <Button asChild className="rounded-full shadow-md" size="sm">
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
                "text-sm font-bold uppercase tracking-wider transition-colors",
                isActive ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-primary"
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
