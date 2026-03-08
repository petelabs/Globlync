
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
  HardHat,
  X,
  Trophy,
  Medal,
  ChevronRight,
  Globe,
  Zap,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { AdBanner } from "@/components/AdBanner";

const SKILL_CATEGORIES = [
  { name: "Tech & Dev", icon: Laptop, skills: ["Developer", "Designer", "IT", "Engineer", "Web", "Mobile"] },
  { name: "Global Services", icon: Briefcase, skills: ["Accountant", "Sales", "Tutor", "Virtual Assistant", "Writer"] },
  { name: "Expert Pros", icon: GraduationCap, skills: ["Consultant", "Manager", "Analyst", "Marketing"] },
  { name: "Specialized", icon: HardHat, skills: ["Electrician", "Solar", "Architecture", "Technician"] },
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
              <Link key={worker.id} href={`/public/${worker.id}`} className="block group">
                <Card className="hover:border-primary/50 transition-all border-none shadow-sm hover:shadow-2xl cursor-pointer overflow-hidden rounded-[2.5rem] h-full flex flex-col">
                  <div className="h-48 w-full bg-muted relative shrink-0">
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
                  </div>
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 className="text-xl font-black group-hover:text-primary transition-colors">{worker.name}</h3>
                      <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1 mb-3">{worker.tradeSkill}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 font-medium leading-relaxed">{worker.bio || "No professional summary provided."}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                        <Globe className="h-3.5 w-3.5" /> 
                        {worker.serviceAreas?.[0] || "Remote / Global"}
                      </div>
                      <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-2 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
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

      <AdBanner id={NATIVE_AD_ID} className="w-full mt-8" />
    </div>
  );
}
