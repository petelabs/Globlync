"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Filter, ShieldCheck } from "lucide-react";
import Link from "next/link";

const MOCK_WORKERS = [
  { id: "worker-1", name: "Alice Smith", trade: "House Painter", location: "Brooklyn", rating: 4.8, jobs: 42, image: "https://picsum.photos/seed/alice/100/100", badges: ["Verified", "Top Rated"] },
  { id: "worker-2", name: "Bob Wilson", trade: "Electrician", location: "Queens", rating: 4.9, jobs: 120, image: "https://picsum.photos/seed/bob/100/100", badges: ["Verified", "Quick Response"] },
  { id: "worker-3", name: "Charlie Davis", trade: "Carpenter", location: "Manhattan", rating: 4.5, jobs: 18, image: "https://picsum.photos/seed/charlie/100/100", badges: ["Verified"] },
  { id: "worker-4", name: "Diana Prince", trade: "Plumber", location: "Bronx", rating: 5.0, jobs: 65, image: "https://picsum.photos/seed/diana/100/100", badges: ["Verified", "Gold Tier"] },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWorkers = MOCK_WORKERS.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.trade.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredWorkers.length > 0 ? (
          filteredWorkers.map((worker) => (
            <Link key={worker.id} href={`/public/${worker.id}`}>
              <Card className="hover:border-primary/50 transition-colors border-none shadow-sm cursor-pointer overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-muted overflow-hidden shrink-0 border border-border">
                    <img src={worker.image} alt={worker.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">{worker.name}</h3>
                      <div className="flex items-center gap-1 text-secondary font-bold">
                        <Star className="h-4 w-4 fill-secondary" /> {worker.rating}
                      </div>
                    </div>
                    <p className="text-sm text-primary font-semibold">{worker.trade}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {worker.location}</span>
                      <span className="flex items-center gap-1 font-medium text-foreground"><ShieldCheck className="h-3 w-3 text-primary" /> {worker.jobs} verified jobs</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {worker.badges.map(b => (
                        <Badge key={b} variant="secondary" className="text-[10px] py-0">{b}</Badge>
                      ))}
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
