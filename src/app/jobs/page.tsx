
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Building2,
  ChevronRight,
  Loader2,
  Search,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { searchJoobleJobs } from "./actions";
import { useToast } from "@/hooks/use-toast";

export default function JobsBoardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("Malawi");
  const { toast } = useToast();

  const fetchJobs = async (initial: boolean = false) => {
    if (!initial) setIsSearching(true);
    try {
      const results = await searchJoobleJobs(keywords, location);
      setJobs(results);
    } catch (err) {
      toast({ 
        variant: "destructive", 
        title: "Search Error", 
        description: "Could not connect to the global job engine." 
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchJobs(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="flex flex-col gap-12 py-8 max-w-full mx-auto px-3 sm:px-4 overflow-x-hidden w-full">
      <header className="flex flex-col gap-10 w-full max-w-4xl mx-auto text-center py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global Career Gateway</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
            Find Your <span className="text-primary">Opportunity.</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            Discover Malawian vacancies and global remote roles. Connect your verified Globlync reputation to your next milestone.
          </p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] p-4 bg-white max-w-2xl mx-auto w-full mt-4">
          <form onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <div className="relative group">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Job title or skill..." 
                className="pl-12 h-12 rounded-2xl border-none bg-muted/50 focus-visible:ring-primary font-bold"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <div className="relative group">
              <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Location (e.g. Malawi)" 
                className="pl-12 h-12 rounded-2xl border-none bg-muted/50 focus-visible:ring-primary font-bold"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-12 rounded-2xl px-8 font-black uppercase tracking-tighter shadow-lg" disabled={isSearching}>
              {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search Jobs"}
            </Button>
          </form>
        </Card>
      </header>

      <section className="grid gap-6 w-full max-w-4xl mx-auto pb-20">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-lg font-black uppercase tracking-[0.2em] text-primary">
            {location ? `Latest Listings in ${location}` : 'Latest Global Listings'}
          </h2>
          {isSearching && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>

        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id} className="border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group border-l-8 rounded-[2.5rem] bg-white border-l-transparent hover:border-l-primary">
              <CardHeader className="p-8 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-black text-primary group-hover:underline cursor-pointer">
                      <a href={job.url} target="_blank" dangerouslySetInnerHTML={{ __html: job.title }} />
                    </CardTitle>
                    <div className="flex items-center gap-2 text-base font-bold mt-2 text-muted-foreground">
                      <Building2 className="h-5 w-5 text-primary/40" />
                      <span dangerouslySetInnerHTML={{ __html: job.company }} />
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-full font-black text-[10px] uppercase border-2 py-1 px-4 bg-primary/5 text-primary">
                    <Clock className="mr-1.5 h-3 w-3" /> {job.updated ? formatDistanceToNow(new Date(job.updated), { addSuffix: true }) : 'active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-6 space-y-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase bg-muted/50 px-3 py-1.5 rounded-xl">
                    <MapPin className="h-4 w-4 text-primary/60" />
                    <span dangerouslySetInnerHTML={{ __html: job.location }} />
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-2 font-black text-[10px] uppercase bg-green-500/10 text-green-700 px-3 py-1.5 rounded-xl">
                      <Sparkles className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                </div>
                <p 
                  className="text-sm leading-relaxed line-clamp-3 text-muted-foreground font-medium"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </CardContent>
              <CardFooter className="bg-muted/30 p-6 flex justify-between items-center px-8">
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <Globe className="h-3.5 w-3.5 opacity-40" /> Apply via global partner
                </div>
                <Button className="rounded-full font-black px-8 h-12 uppercase shadow-lg group-hover:scale-105 transition-transform" asChild>
                  <a href={job.url} target="_blank">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : !isLoading ? (
          <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed mx-2 flex flex-col items-center gap-6">
            <Briefcase className="h-16 w-16 text-muted-foreground/20" />
            <p className="text-muted-foreground font-black text-2xl">No vacancies matching "{keywords}"</p>
            <p className="text-muted-foreground text-sm font-medium -mt-4">Try searching for broader skills or different locations.</p>
            <Button variant="outline" className="rounded-full font-black border-2" onClick={() => {setKeywords(""); setLocation("Malawi"); fetchJobs();}}>
              Reset Filter
            </Button>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {[1, 2, 3].map(i => <Card key={i} className="h-64 animate-pulse bg-muted/20 border-none rounded-[2.5rem]" />)}
          </div>
        )}
      </section>
    </div>
  );
}
