
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  QrCode
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
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
        } else {
          toast({ variant: "destructive", title: "Profile Missing", description: "This ID exists but the profile is not set up." });
        }
      } else {
        toast({ variant: "destructive", title: "ID Not Found", description: "No professional matches this unique ID." });
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Search Failed", description: "Ensure you have a stable internet connection." });
    } finally {
      setIsSearching(false);
    }
  };

  const handleMessageClick = (workerId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(`/public/${workerId}`);
  };

  return (
    <div className="flex flex-col gap-8 py-4 max-w-2xl mx-auto px-4 overflow-x-hidden w-full">
      <header className="flex flex-col gap-6 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full text-primary border border-primary/10">
            <Lock className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Connection Hub</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Private <span className="text-primary">Connect.</span></h1>
          <p className="text-muted-foreground text-sm font-medium max-w-sm mx-auto">
            Browse is disabled for professional security. Enter a <b>Professional ID</b> or <b>Username</b> to start a secure conversation.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-6 top-7 h-8 w-8 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Enter Professional ID (e.g. @john_pro)" 
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
              {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify ID"}
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-4 py-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-dashed">
            <QrCode className="h-3 w-3" />
            Scan QR code
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-dashed">
            <UserPlus className="h-3 w-3" />
            Add by Phone
          </div>
        </div>
      </header>

      <section className="space-y-6 min-h-[300px]">
        {foundWorker ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-center text-primary mb-6">Professional Located</h2>
            <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white group hover:scale-[1.02] transition-transform">
              <div className="h-32 bg-primary/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <Globe className="h-64 w-64 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <img 
                  src={foundWorker.profilePictureUrl} 
                  alt={foundWorker.name} 
                  className="h-20 w-20 rounded-full border-4 border-white shadow-xl object-cover relative z-10" 
                />
              </div>
              <CardContent className="p-8 text-center">
                <div className="space-y-1 mb-6">
                  <h3 className="text-2xl font-black">{foundWorker.name}</h3>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest">@{foundWorker.username}</p>
                  <p className="text-sm text-muted-foreground font-medium mt-2">{foundWorker.tradeSkill || "Professional Expert"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="rounded-full font-black h-12 border-2" asChild>
                    <Link href={`/public/${foundWorker.id}`}>View Portfolio</Link>
                  </Button>
                  <Button className="rounded-full font-black h-12 shadow-lg" onClick={() => handleMessageClick(foundWorker.id)}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Secure Message
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{foundWorker.trustScore} Trust</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-muted" />
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground">
                    <Zap className="h-4 w-4 text-secondary" />
                    <span>{foundWorker.isPro ? "VIP" : "Standard"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !isSearching && searchTerm && (
          <div className="text-center py-20 bg-muted/10 rounded-[2.5rem] border-4 border-dashed flex flex-col items-center gap-4 opacity-50">
            <Search className="h-16 w-16 text-muted-foreground/20" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No professional matches this ID</p>
          </div>
        )}

        {!searchTerm && !isSearching && (
          <div className="text-center py-20 space-y-6">
            <div className="bg-primary/5 p-8 rounded-[3rem] border border-primary/10 max-w-sm mx-auto">
              <Lock className="h-12 w-12 text-primary/20 mx-auto mb-4" />
              <h4 className="font-black text-sm uppercase tracking-tight mb-2">Privacy Active</h4>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Globlync does not expose worker lists to unauthorized users. Ask your professional for their <b>Globlync ID</b> or <b>Username</b> to find them.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
