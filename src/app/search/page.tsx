
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Hammer,
  Home,
  Wrench,
  BookOpen,
  Car,
  Laptop
} from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const SKILL_CATEGORIES = [
  { name: "Construction", icon: Hammer, skills: ["Mason", "Carpenter", "Welder", "Painter", "Bricklayer"] },
  { name: "Home Services", icon: Home, skills: ["Plumber", "Electrician", "Solar Tech", "Gardener", "Housekeeper"] },
  { name: "Technical", icon: Laptop, skills: ["Mechanic", "IT Support", "Phone Repair", "Tailor"] },
  { name: "Professional", icon: BookOpen, skills: ["Tutor", "Accountant", "Sales Agent", "Driver"] },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const db = useFirestore();

  // Limited query for performance and Spark plan safety
  const workersRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "workerProfiles");
  }, [db]);

  const discoveryQuery = useMemoFirebase(() => {
    if (!workersRef) return null;
    return query(workersRef, orderBy("createdAt", "desc"), limit(30));
  }, [workersRef]);

  const { data: allWorkers, isLoading } = useCollection(discoveryQuery);

  // Filter for newcomers (24 hours)
  const newcomers = useMemo(() => {
    if (!allWorkers) return [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return allWorkers.filter(w => {
      const created = w.createdAt?.seconds ? w.createdAt.seconds * 1000 : new Date(w.createdAt).getTime();
      return created > oneDayAgo;
    });
  }, [allWorkers]);

  // Main filtered list based on search and category
  const filteredWorkers = useMemo(() => {
    if (!allWorkers) return [];
    return allWorkers.filter(w => {
      const matchesSearch = searchTerm === "" || 
        w.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        w.tradeSkill?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        SKILL_CATEGORIES.find(c => c.name === selectedCategory)?.skills.some(s => 
          w.tradeSkill?.toLowerCase().includes(s.toLowerCase())
        );

      return matchesSearch && matchesCategory;
    });
  }, [allWorkers, searchTerm, selectedCategory]);

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      <header className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-primary">Discover Professionals</h1>
          <p className="text-muted-foreground">Find AI-verified skilled workers across Malawi.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Who are you looking for? (e.g. Plumber)" 
              className="pl-12 h-12 rounded-2xl shadow-sm border-2 focus-visible:ring-primary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SKILL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(isActive ? null : cat.name)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                  isActive 
                    ? "bg-primary border-primary text-primary-foreground shadow-lg scale-105" 
                    : "bg-card border-muted hover:border-primary/30"
                )}
              >
                <Icon className={cn("h-6 w-6", isActive ? "text-primary-foreground" : "text-primary")} />
                <span className="text-xs font-bold uppercase tracking-wider">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 24 Hour Newcomers Section - High Discovery */}
      {newcomers.length > 0 && !searchTerm && !selectedCategory && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-secondary/20 p-1.5 rounded-lg">
              <Sparkles className="h-5 w-5 text-secondary fill-secondary" />
            </div>
            <h2 className="text-xl font-bold">New Talent Today</h2>
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-black">24H BOOST</Badge>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {newcomers.map((worker) => (
              <Link key={worker.id} href={`/public/${worker.id}`} className="shrink-0">
                <Card className="w-48 border-none shadow-md hover:shadow-xl transition-shadow overflow-hidden bg-primary/5">
                  <div className="h-32 w-full bg-muted relative">
                    <img src={worker.profilePictureUrl || `https://picsum.photos/seed/${worker.id}/200/200`} alt={worker.name} className="h-full w-full object-cover" />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-full flex items-center gap-0.5 text-[10px] font-bold text-primary shadow-sm">
                      <ShieldCheck className="h-3 w-3" /> {worker.trustScore || 0}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-bold text-sm truncate">{worker.name}</h3>
                    <p className="text-[10px] text-primary font-bold uppercase">{worker.tradeSkill}</p>
                    <div className="mt-2 flex items-center gap-1 text-[8px] text-muted-foreground font-bold">
                      <Clock className="h-2 w-2" /> 
                      {worker.createdAt ? formatDistanceToNow(new Date(worker.createdAt.seconds * 1000), { addSuffix: true }) : "recently joined"}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Results */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {searchTerm || selectedCategory ? "Search Results" : "All Professionals"}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </h2>

        <div className="grid gap-4">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker) => (
              <Link key={worker.id} href={`/public/${worker.id}`}>
                <Card className="group hover:border-primary/50 transition-all border-none shadow-sm cursor-pointer overflow-hidden active:scale-[0.98]">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-24 w-24 rounded-2xl bg-muted overflow-hidden shrink-0 border-2 border-muted group-hover:border-primary/20 transition-colors">
                      <img 
                        src={worker.profilePictureUrl || `https://picsum.photos/seed/${worker.id}/150/150`} 
                        alt={worker.name} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-bold truncate">{worker.name}</h3>
                        <div className="flex items-center gap-1 text-primary font-black bg-primary/5 px-2 py-1 rounded-lg">
                          <ShieldCheck className="h-4 w-4" /> {worker.trustScore || 0}
                        </div>
                      </div>
                      <p className="text-sm text-primary font-bold uppercase tracking-tight">{worker.tradeSkill}</p>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Location Verified</span>
                        <span className="flex items-center gap-1 text-foreground"><Star className="h-3 w-3 text-secondary fill-secondary" /> 5.0 Rating</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {worker.badgeIds?.slice(0, 2).map((b: string) => (
                          <Badge key={b} variant="secondary" className="text-[9px] py-0 px-2 uppercase font-black tracking-tighter">
                            {b.replace('-', ' ')}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-[9px] py-0 px-2 uppercase font-black border-primary/20 text-primary">Verified Pro</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-[2rem] border-2 border-dashed">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground font-medium">No professionals found. Try a different skill!</p>
              <Button variant="link" onClick={() => {setSearchTerm(""); setSelectedCategory(null);}} className="mt-2 text-primary">Clear all filters</Button>
            </div>
          )}
        </div>
      </section>

      {/* Malawi Specific Help */}
      {!searchTerm && !selectedCategory && (
        <Card className="border-none bg-primary text-primary-foreground p-8 rounded-[2.5rem] shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <MapPin className="h-32 w-32" />
          </div>
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-black italic">Supporting Malawi's Workforce</h3>
            <p className="text-primary-foreground/80 leading-relaxed text-sm max-w-lg">
              Globlync is dedicated to helping independent workers in Lilongwe, Blantyre, Mzuzu, and across Malawi build a reputation that opens doors to better opportunities.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-xl p-3 flex-1 text-center">
                <span className="block text-xl font-black">100%</span>
                <span className="text-[9px] uppercase font-bold opacity-70">Verified Pros</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 flex-1 text-center">
                <span className="block text-xl font-black">AI</span>
                <span className="text-[9px] uppercase font-bold opacity-70">Powered Logs</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
