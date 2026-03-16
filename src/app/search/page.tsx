
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  ShieldCheck, 
  Loader2, 
  X,
  Zap,
  Globe,
  MessageSquare,
  Lock,
  UserPlus,
  QrCode,
  TrendingUp,
  MapPin,
  ChevronRight,
  Users
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, getDoc, query, limit, orderBy } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundWorker, setFoundWorker] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const professionalsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "workerProfiles");
  }, [db]);

  const recommendedQuery = useMemoFirebase(() => {
    if (!professionalsRef) return null;
    return query(professionalsRef, orderBy("trustScore", "desc"), limit(10));
  }, [professionalsRef]);

  const { data: directory, isLoading: isDirLoading } = useCollection(recommendedQuery);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim() || !db) return;

    setIsSearching(true);
    setFoundWorker(null);

    try {
      const cleanId = searchTerm.trim().toLowerCase().replace('@', '');
      const usernameRef = doc(db, "usernames", cleanId);
      const usernameSnap = await getDoc(usernameRef);

      if (usernameSnap.exists()) {
        const uid = usernameSnap.data().uid;
        const profileRef = doc(db, "workerProfiles", uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setFoundWorker({ ...profileSnap.data(), id: uid });
        }
      } else {
        toast({ variant: "destructive", title: "ID Not Found", description: "No professional matches this unique ID." });
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Search Failed" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 py-4 max-w-4xl mx-auto px-4 overflow-x-hidden w-full">
      <header className="flex flex-col gap-6 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full text-primary border border-primary/10">
            <Globe className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Professional Directory</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Discover <span className="text-primary">Experts.</span></h1>
          <p className="text-muted-foreground text-sm font-medium max-w-md mx-auto">
            Browse verified profiles or enter a specific professional ID to connect securely.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto w-full">
          <Search className="absolute left-6 top-7 h-8 w-8 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by @username (e.g. @john_pro)" 
            className="pl-16 h-20 rounded-[2rem] shadow-2xl border-2 focus-visible:ring-primary text-xl font-black placeholder:text-muted-foreground/30" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-4 top-4">
            <Button 
              type="submit" 
              className="h-12 rounded-2xl px-6 font-black uppercase tracking-tighter shadow-lg"
              disabled={isSearching || !searchTerm.trim()}
            >
              {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
            </Button>
          </div>
        </form>
      </header>

      <section className="space-y-8 min-h-[400px]">
        {foundWorker ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-center text-primary mb-6">Match Found</h2>
            <ProfessionalCard worker={foundWorker} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Top Professionals
              </h2>
              <Badge variant="outline" className="font-bold">Verified Only</Badge>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {isDirLoading ? (
                [1, 2, 3, 4].map(i => <Card key={i} className="h-32 animate-pulse bg-muted/20 border-none rounded-3xl" />)
              ) : directory && directory.length > 0 ? (
                directory.map(worker => (
                  <Link key={worker.id} href={`/public/${worker.id}`}>
                    <Card className="border-none shadow-sm hover:shadow-xl transition-all rounded-[2rem] group overflow-hidden bg-white">
                      <CardContent className="p-6 flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/5 group-hover:scale-110 transition-transform">
                          <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
                          <AvatarFallback className="font-black">{worker.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-lg truncate leading-tight">{worker.name}</h3>
                          <p className="text-[10px] font-black text-primary uppercase tracking-tight truncate">@{worker.username}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{worker.trustScore} Trust Score</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-muted/10 rounded-[2.5rem] border-4 border-dashed flex flex-col items-center gap-4">
                  <Users className="h-12 w-12 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No professionals listed yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ProfessionalCard({ worker }: { worker: any }) {
  return (
    <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white group hover:scale-[1.01] transition-transform max-w-md mx-auto">
      <div className="h-32 bg-primary/5 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 group-hover:scale-110 transition-transform duration-1000">
          <Globe className="h-64 w-64 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <Avatar className="h-20 w-20 border-4 border-white shadow-xl relative z-10">
          <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
          <AvatarFallback className="text-xl font-black">{worker.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <CardContent className="p-8 text-center">
        <div className="space-y-1 mb-6">
          <h3 className="text-2xl font-black">{worker.name}</h3>
          <p className="text-xs text-primary font-bold uppercase tracking-widest">@{worker.username}</p>
          <p className="text-sm text-muted-foreground font-medium mt-2">{worker.tradeSkill || "Professional Expert"}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="rounded-full font-black h-12 border-2" asChild>
            <Link href={`/public/${worker.id}`}>View Portfolio</Link>
          </Button>
          <Button className="rounded-full font-black h-12 shadow-lg" asChild>
            <Link href={`/messages/${worker.id}`}><MessageSquare className="mr-2 h-4 w-4" /> Secure Message</Link>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>{worker.trustScore} Trust</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-muted" />
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground">
            <Zap className="h-4 w-4 text-secondary" />
            <span>{worker.isPro ? "VIP" : "Standard"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
