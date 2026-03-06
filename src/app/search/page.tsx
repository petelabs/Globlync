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
  Home,
  Laptop,
  GraduationCap,
  HardHat,
  X
} from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { AdBanner } from "@/components/AdBanner";

const SKILL_CATEGORIES = [
  { 
    name: "Construction", 
    icon: HardHat, 
    skills: ["Mason", "Carpenter", "Welder", "Painter", "Bricklayer", "Tiler", "Plasterer"] 
  },
  { 
    name: "Home Services", 
    icon: Home, 
    skills: ["Plumber", "Electrician", "Solar Tech", "Gardener", "Housekeeper", "Nanny", "Laundry"] 
  },
  { 
    name: "Technical", 
    icon: Laptop, 
    skills: ["Mechanic", "IT Support", "Phone Repair", "Tailor", "Cobbler", "Barber", "Beautician"] 
  },
  { 
    name: "Professional", 
    icon: GraduationCap, 
    skills: ["Tutor", "Accountant", "Sales Agent", "Driver", "Photographer", "Event Planner"] 
  },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const db = useFirestore();

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
      const name = w.name?.toLowerCase() || "";
      const trade = w.tradeSkill?.toLowerCase() || "";
      const bio = w.bio?.toLowerCase() || "";
      const username = w.username?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();

      const matchesSearch = search === "" || 
        name.includes(search) || 
        trade.includes(search) ||
        bio.includes(search) ||
        username.includes(search);
      
      const categorySkills = SKILL_CATEGORIES.find(c => c.name === selectedCategory)?.skills || [];
      const matchesCategory = !selectedCategory || 
        categorySkills.some(s => trade.includes(s.toLowerCase()));

      return matchesSearch && matchesCategory;
    });
  }, [allWorkers, searchTerm, selectedCategory]);

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      <header className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-primary">Discover Professionals</h1>
          <p className="text-muted-foreground text-sm">Search thousands of verified workers in Malawi.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Find a Plumber, Mason, or Electrician..." 
              className="pl-12 h-12 rounded-2xl shadow-sm border-2 focus-visible:ring-primary text-base" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-4 top-3.5">
                <X className="h-5 w-5 text-muted-foreground hover:text-primary" />
              </button>
            )}
          </div>
        </div>

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
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Ad placement 4: Search results top */}
      <AdBanner id="search-results-top-ad" className="w-full" />

      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {searchTerm || selectedCategory ? "Results" : "Top Verified Workers"}
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
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold truncate">{worker.name}</h3>
                          <p className="text-[10px] text-primary font-bold">@{worker.username}</p>
                        </div>
                        <div className="flex items-center gap-1 text-primary font-black bg-primary/5 px-2 py-1 rounded-lg">
                          <ShieldCheck className="h-4 w-4" /> {worker.trustScore || 0}
                        </div>
                      </div>
                      <p className="text-sm text-primary font-bold uppercase tracking-tight truncate mt-1">{worker.tradeSkill}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-[2rem] border-2 border-dashed">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground font-medium">No results found for your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Ad placement 5: Search Footer */}
      <AdBanner id="search-footer-ad" className="w-full mt-8" />
    </div>
  );
}
