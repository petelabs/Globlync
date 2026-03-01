
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Filter, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const db = useFirestore();

  const workersRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "workerProfiles");
  }, [db]);

  const workersQuery = useMemoFirebase(() => {
    if (!workersRef) return null;
    return query(workersRef, limit(50));
  }, [workersRef]);

  const { data: workers, isLoading } = useCollection(workersQuery);

  const filteredWorkers = workers?.filter(w => 
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.tradeSkill?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col gap-6 py-4">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Find Skilled Workers</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by skill or name (e.g. Plumber)..." 
              className="pl-10 h-12 rounded-full shadow-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <section className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted" />
          </div>
        ) : filteredWorkers.length > 0 ? (
          filteredWorkers.map((worker) => (
            <Link key={worker.id} href={`/public/${worker.id}`}>
              <Card className="hover:border-primary/50 transition-all border-none shadow-sm cursor-pointer overflow-hidden active:scale-[0.98]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border">
                    <img src={worker.profilePictureUrl || `https://picsum.photos/seed/${worker.id}/100/100`} alt={worker.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">{worker.name}</h3>
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <ShieldCheck className="h-4 w-4" /> {worker.trustScore || 0}
                      </div>
                    </div>
                    <p className="text-sm text-primary font-semibold">{worker.tradeSkill}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Location Verified</span>
                      <span className="flex items-center gap-1 font-medium text-foreground"><Star className="h-3 w-3 text-secondary fill-secondary" /> 5.0 Rating</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {worker.badgeIds?.slice(0, 2).map((b: string) => (
                        <Badge key={b} variant="secondary" className="text-[10px] py-0 capitalize">{b.replace('-', ' ')}</Badge>
                      ))}
                      <Badge variant="outline" className="text-[10px] py-0">Verified Pro</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No workers found matching your search.</p>
          </div>
        )}
      </section>
    </div>
  );
}
