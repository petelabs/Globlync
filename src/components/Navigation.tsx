
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
  Settings as SettingsIcon,
  LogOut,
  LayoutDashboard,
  ClipboardCheck,
  ChevronDown,
  Gift,
  Sparkles,
  Crown
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
      <Image 
        src="/logo.png" 
        alt="Globlync Logo" 
        width={32} 
        height={32} 
        className="rounded-xl shadow-lg shrink-0"
      />
      <div className="flex flex-col -space-y-1 text-left">
        <span className="text-xl font-black tracking-tighter text-primary">Globlync</span>
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-secondary">National Network</span>
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
  
  const isPro = profile?.activeBenefits?.some(b => new Date(b.expiresAt) > new Date()) || (profile?.referralCount || 0) >= 10;
  
  const displayPhoto = profile?.profilePictureUrl || user?.photoURL || "";

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
    { label: "Rewards", href: "/rewards", icon: Gift },
    { label: "Log Work", href: "/work-log", icon: ClipboardCheck, authRequired: true },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-md h-16 safe-top">
        <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-3 sm:px-4">
          <Link href="/" className="flex items-center gap-1 hover:opacity-90 transition-opacity shrink-0 group">
            <Logo className="scale-90 sm:scale-100" />
          </Link>
          
          <div className="flex-1 flex justify-center px-2 sm:px-4 md:px-8 max-w-md">
            <Button 
              variant="outline" 
              className="hidden sm:flex w-full justify-start text-muted-foreground rounded-full h-10 px-6 bg-muted/20 hover:bg-muted/40 transition-all border-2 border-primary/10 hover:border-primary/30 group" 
              onClick={() => router.push('/search')}
            >
              <Search className="h-4 w-4 mr-3 shrink-0 text-primary/60 group-hover:text-primary transition-colors" />
              <span className="text-sm font-bold tracking-tight truncate">Search national network...</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="sm:hidden rounded-full h-10 w-10 text-primary/60 hover:text-primary hover:bg-primary/5" 
              onClick={() => router.push('/search')}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            {user ? (
              <>
                {!isPro && (
                  <Button variant="ghost" size="sm" asChild className="hidden lg:flex text-secondary font-black hover:text-secondary hover:bg-secondary/10 rounded-full">
                    <Link href="/rewards">
                      <Gift className="mr-2 h-4 w-4 animate-bounce" />
                      Free VIP
                    </Link>
                  </Button>
                )}
                <Link href="/notifications" className="relative p-2 hover:bg-muted rounded-full transition-colors hidden sm:flex">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-secondary text-[9px] font-black text-secondary-foreground border-2 border-background">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild id="nav-user-menu">
                    <button className="flex items-center gap-1 p-0.5 rounded-full hover:bg-muted transition-all outline-none border border-transparent hover:border-border">
                      <div className="relative">
                        <Avatar className={cn("h-8 w-8 sm:h-10 sm:w-10 border-2 shadow-sm", isPro ? "border-secondary" : "border-primary/20")}>
                          <AvatarImage src={displayPhoto} className="object-cover" />
                          <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        {isPro && (
                          <div className="absolute -top-1 -right-1 rounded-full p-0.5 sm:p-1 border-2 border-white shadow-xl animate-pulse bg-secondary">
                            <Crown className="h-2 w-2 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 mt-2 p-3 rounded-[1.5rem] shadow-2xl border-none animate-in fade-in zoom-in-95" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-3 bg-muted/30 rounded-2xl mb-2">
                      <div className="flex items-center gap-4">
                        <Avatar className={cn("h-12 w-12 border-2", isPro ? "border-secondary" : "border-primary/10")}>
                          <AvatarImage src={displayPhoto} className="object-cover" />
                        </Avatar>
                        <div className="flex flex-col space-y-0.5">
                          <p className="text-sm font-black leading-none flex items-center gap-1.5">
                            {user.displayName || "Professional"}
                            {isPro && <Crown className="h-3 w-3 text-secondary fill-secondary" />}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest truncate max-w-[150px]">{profile?.tradeSkill || "New Worker"}</p>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="mx-[-8px] my-1" />
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 px-4 font-bold text-sm">
                      <Link href="/dashboard"><LayoutDashboard className="mr-3 h-5 w-5 text-primary" />Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 px-4 font-black text-sm text-secondary">
                      <Link href="/rewards"><Gift className="mr-3 h-5 w-5" />Earn Free VIP</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 px-4 font-bold text-sm">
                      <Link href="/profile"><User className="mr-3 h-5 w-5 text-primary" />My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 px-4 font-bold text-sm">
                      <Link href="/settings"><SettingsIcon className="mr-3 h-5 w-5 text-primary" />Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="mx-[-8px] my-1" />
                    <DropdownMenuItem className="text-destructive font-black cursor-pointer rounded-xl py-3 px-4 text-sm mt-1" onClick={handleLogout}>
                      <LogOut className="mr-3 h-5 w-5" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild className="rounded-full shadow-lg font-black px-4 sm:px-8 h-9 sm:h-11 text-[10px] sm:text-sm whitespace-nowrap" size="sm">
                <Link href="/login">Join Now</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/90 backdrop-blur-xl md:hidden h-18 safe-bottom">
        <div className="flex h-full items-center justify-around px-2">
          {navItems.map((item) => {
            if (item.authRequired && !user) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 transition-all flex-1 h-full", 
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn("p-2 rounded-xl transition-all duration-300", isActive && "bg-primary/10 scale-110")}>
                  <Icon className={cn("h-6 w-6", isActive && "fill-primary/20")} />
                </div>
                <span className="text-[9px] font-black tracking-tight uppercase">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
