
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Briefcase, 
  User, 
  Bell, 
  Search, 
  LogIn,
  Settings,
  LogOut,
  LayoutDashboard,
  ClipboardCheck,
  ChevronDown,
  Gift,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
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
import { collection, query, where, doc } from "firebase/firestore";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src="/logo.png" 
        alt="Globlync Logo" 
        className="h-8 w-auto object-contain" 
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
      <div className="flex items-center gap-1">
        <span className="text-2xl font-black tracking-tighter italic text-primary">Glob</span>
        <div className="relative flex items-center h-8 w-12 overflow-visible">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary absolute left-0 animate-link-left"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /></svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-secondary absolute right-0 animate-link-right"><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
        </div>
      </div>
    </div>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);

  const notificationsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "notifications");
  }, [db, user?.uid]);

  const unreadQuery = useMemoFirebase(() => {
    if (!notificationsRef) return null;
    return query(notificationsRef, where("isRead", "==", false));
  }, [notificationsRef]);

  const { data: unreadNotifications } = useCollection(unreadQuery);
  const unreadCount = unreadNotifications?.length || 0;
  const hasGrowthBadge = profile?.badgeIds?.includes('growth-champion');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
      toast({ title: "Signed Out" });
    } catch (error) {
      toast({ variant: "destructive", title: "Logout Failed" });
    }
  };

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Jobs", href: "/jobs", icon: Briefcase },
    { label: "Invite", href: "/referrals", icon: Gift, authRequired: true },
    { label: "Log Work", href: "/work-log", icon: ClipboardCheck, authRequired: true },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-card/80 backdrop-blur-lg h-16">
        <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-1 hover:opacity-90 transition-opacity shrink-0 group">
            <Logo />
          </Link>
          
          <div className="flex-1 flex justify-center px-4 max-w-md">
            <Button variant="outline" className="w-full justify-start text-muted-foreground rounded-full h-10 px-4 bg-muted/30 hover:bg-muted/50 transition-all border-2" onClick={() => router.push('/search')}>
              <Search className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Search verified pros...</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {user && (
              <>
                <Link href="/notifications" className="relative p-2 hover:bg-muted rounded-full transition-colors hidden xs:flex">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground border-2 border-card">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted transition-all outline-none relative group">
                      <div className="relative">
                        <Avatar className="h-9 w-9 border-2 border-primary/20">
                          <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        {hasGrowthBadge && (
                          <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-0.5 border-2 border-white shadow-sm">
                            <Award className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
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
                          <p className="text-[10px] font-medium text-muted-foreground mt-1 truncate max-w-[140px]">{user.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="mx-[-8px] my-2" />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                      <Link href="/dashboard"><LayoutDashboard className="mr-3 h-4 w-4 text-primary" />Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                      <Link href="/referrals"><Gift className="mr-3 h-4 w-4 text-secondary" />Invite & Earn</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                      <Link href="/profile"><User className="mr-3 h-4 w-4 text-primary" />My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                      <Link href="/settings"><Settings className="mr-3 h-4 w-4 text-primary" />Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="mx-[-8px] my-2" />
                    <DropdownMenuItem className="text-destructive font-bold cursor-pointer rounded-lg py-2.5" onClick={handleLogout}>
                      <LogOut className="mr-3 h-4 w-4" />Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!user && (
              <Button asChild className="rounded-full shadow-lg font-bold px-6" size="sm">
                <Link href="/login"><LogIn className="h-4 w-4 mr-2" />Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/90 backdrop-blur-xl md:hidden h-16">
        <div className="flex h-full items-center justify-around px-4">
          {navItems.map((item) => {
            if (item.authRequired && !user) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 transition-all duration-300", isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary")}>
                <Icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
                <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
