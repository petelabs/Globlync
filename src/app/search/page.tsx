
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  ShieldCheck, 
  Loader2, 
  Sparkles,
  Clock,
  Home,
  Laptop,
  GraduationCap,
  Hammer,
  X,
  Trophy,
  Medal,
  ChevronRight,
  Globe,
  Zap,
  Briefcase,
  MessageSquare,
  Construction,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, limit, orderBy, doc } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { AdBanner } from "@/components/AdBanner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SKILL_CATEGORIES = [
  { name: "Tech & Dev", icon: Laptop, skills: ["Developer", "Designer", "IT", "Engineer", "Web", "Mobile"] },
  { name: "Global Services", icon: Briefcase, skills: ["Accountant", "Sales", "Tutor", "Virtual Assistant", "Writer"] },
  { name: "Expert Pros", icon: GraduationCap, skills: ["Consultant", "Manager", "Analyst", "Marketing"] },
  { name: "Specialized", icon: Construction, skills: ["Electrician", "Solar", "Architecture", "Technician", "Mechanic"] },
];

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLockDialogOpen] = useState(false);
  
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const currentUserRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: currentUserProfile } = useDoc(currentUserRef);

  const workersRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "workerProfiles");
  }, [db]);

  const discoveryQuery = useMemoFirebase(() => {
    if (!workersRef) return null;
    return query(workersRef, orderBy("trustScore", "desc"), limit(100));
  }, [workersRef]);

  const { data: allWorkers, isLoading } = useCollection(discoveryQuery);

  const filteredWorkers = useMemo(() => {
    if (!allWorkers) return [];
    return allWorkers.filter(w => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = search === "" || 
        (w.name || "").toLowerCase().includes(search) || 
        (w.tradeSkill || "").toLowerCase().includes(search) ||
        (w.bio || "").toLowerCase().includes(search);
      
      const categorySkills = SKILL_CATEGORIES.find(c => c.name === selectedCategory)?.skills || [];
      const matchesCategory = !selectedCategory || 
        categorySkills.some(s => (w.tradeSkill || "").toLowerCase().includes(s.toLowerCase()));

      return matchesSearch && matchesCategory;
    });
  }, [allWorkers, searchTerm, selectedCategory]);

  const [localIsLockDialogOpen, setLocalIsLockDialogOpen] = useState(false);

  const handleMessageClick = (workerId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const referralCount = currentUserProfile?.referralCount || 0;
    if (referralCount < 1) {
      setLocalIsLockDialogOpen(true);
      return;
    }

    router.push(`/public/${workerId}`);
  };

  const NATIVE_AD_ID = "732a8eb1f93a972b628ecf38814db400";

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto px-3 sm:px-4 overflow-x-hidden w-full">
      <header className="flex flex-col gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Globe className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Discovery Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Discover <span className="text-primary">Top Talent.</span></h1>
          <p className="text-muted-foreground text-sm font-medium">Connect with verified remote professionals and local experts worldwide.</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-6 top-7 h-8 w-8 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by skill, name, or role worldwide..." 
            className="pl-16 h-20 rounded-[2rem] shadow-2xl border-2 focus-visible:ring-primary text-xl font-black" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-6 top-7 bg-muted p-1.5 rounded-full">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SKILL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(isActive ? null : cat.name)}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all gap-3 shadow-sm",
                  isActive 
                    ? "bg-primary border-primary text-primary-foreground shadow-2xl scale-105" 
                    : "bg-card border-muted hover:border-primary/30 hover:shadow-md"
                )}
              >
                <Icon className={cn("h-8 w-8", isActive ? "text-primary-foreground" : "text-primary")} />
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </header>

      <AdBanner id={NATIVE_AD_ID} className="w-full" />

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black flex items-center gap-3">
            {searchTerm || selectedCategory ? "Search Results" : "Verified Pros Everywhere"}
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </h2>
          <Badge variant="outline" className="font-black text-[10px] uppercase">{filteredWorkers.length} Found</Badge>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker) => (
              <Card key={worker.id} className="hover:border-primary/50 transition-all border-none shadow-sm hover:shadow-2xl overflow-hidden rounded-[2.5rem] h-full flex flex-col group">
                <Link href={`/public/${worker.id}`} className="block h-48 w-full bg-muted relative shrink-0">
                  <img 
                    src={worker.profilePictureUrl || `https://picsum.photos/seed/${worker.id}/400/300`} 
                    alt={worker.name} 
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-white/95 backdrop-blur text-primary font-black shadow-xl rounded-full border-none">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> {worker.trustScore}
                    </Badge>
                    {worker.isPro && (
                      <Badge className="bg-secondary text-secondary-foreground font-black shadow-xl rounded-full border-none">
                        <Zap className="h-3.5 w-3.5 mr-1" /> VIP
                      </Badge>
                    )}
                  </div>
                </Link>
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex-1">
                    <Link href={`/public/${worker.id}`}>
                      <h3 className="text-xl font-black group-hover:text-primary transition-colors">{worker.name}</h3>
                    </Link>
                    <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1 mb-3">{worker.tradeSkill || "Professional Expert"}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 font-medium leading-relaxed">{worker.bio || "No professional summary provided."}</p>
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                        <Globe className="h-3.5 w-3.5" /> 
                        {worker.serviceAreas?.[0] || "Remote / Global"}
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase opacity-50">{worker.profileViews || 0} Views</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" asChild className="rounded-full font-black text-[10px] h-9">
                        <Link href={`/public/${worker.id}`}>View Profile</Link>
                      </Button>
                      <Button variant="secondary" size="sm" className="rounded-full font-black text-[10px] h-9" onClick={() => handleMessageClick(worker.id)}>
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !isLoading && (
            <div className="col-span-full text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted/20">
              <Search className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-10" />
              <p className="text-muted-foreground font-bold text-lg">No professionals match your criteria.</p>
              <Button variant="ghost" className="mt-4 font-black text-primary" onClick={() => {setSearchTerm(""); setSelectedCategory(null);}}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </section>

      <Dialog open={localIsLockDialogOpen} onOpenChange={setLocalIsLockDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
          <div className="bg-primary p-10 text-center space-y-6">
            <div className="bg-white/20 p-6 rounded-[2rem] shadow-2xl backdrop-blur-md w-fit mx-auto">
              <Lock className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black tracking-tight text-white leading-none">Unlock Networking</DialogTitle>
              <DialogDescription className="text-white/80 font-medium text-sm">To maintain professional privacy, messaging is only available to active Globlync members.</DialogDescription>
            </div>
          </div>
          <CardContent className="p-10 text-center space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Invite just <b>1 professional</b> to join Globlync. Once they sign up, you unlock direct messaging with the entire global network.
            </p>
            <Button size="lg" className="w-full rounded-full h-16 text-lg font-black shadow-xl" asChild>
              <Link href="/referrals">Invite & Unlock Now <ChevronRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button variant="ghost" className="text-xs font-bold text-muted-foreground" onClick={() => setLocalIsLockDialogOpen(false)}>Return to Search</Button>
          </CardContent>
        </DialogContent>
      </Dialog>

      <AdBanner id={NATIVE_AD_ID} className="w-full mt-8" />
    </div>
  );
}
