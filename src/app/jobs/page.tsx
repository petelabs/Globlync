
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Building2,
  ChevronRight,
  Loader2,
  ExternalLink,
  Globe,
  Sparkles,
  X,
  ArrowDown,
  Languages
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";
import { searchJoobleJobs } from "./actions";
import { formatDistanceToNow } from "date-fns";

const SUGGESTED_KEYWORDS = ["Accountant", "Driver", "Developer", "Sales", "Nurse", "Security"];

export default function JobsBoardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadInitialJobs() {
      setIsInitialLoading(true);
      try {
        const results = await searchJoobleJobs("");
        setAllJobs(results.sort((a: any, b: any) => b.createdAt - a.createdAt));
      } catch (err) {
        console.error("Error loading initial jobs:", err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadInitialJobs();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    try {
      const results = await searchJoobleJobs(searchTerm);
      setAllJobs(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const openTranslation = (text: string) => {
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const translateUrl = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(cleanText)}&op=translate`;
    window.open(translateUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-12 py-8 max-w-full mx-auto px-3 sm:px-4 overflow-x-hidden w-full">
      <header className="flex flex-col gap-10 w-full max-w-4xl mx-auto text-center py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">National Opportunity Engine</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
            Your Malawi <span className="text-primary">Career.</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            Search for verified vacancies across all 28 districts. Every listing is pulled from verified national and global sources.
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-6 w-full max-w-3xl mx-auto">
          <div className="relative group w-full">
            <Search className="absolute left-8 top-8 h-10 w-10 text-muted-foreground group-focus-within:text-primary transition-all scale-90" />
            <Input 
              placeholder="e.g. Driver, Sales, or Bank" 
              className="pl-20 h-24 rounded-[3rem] shadow-xl border-4 border-primary/5 text-2xl font-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-6 top-6 flex gap-2">
              <Button 
                type="submit" 
                className="h-12 md:h-14 rounded-full px-8 md:px-12 font-black uppercase shadow-2xl"
                disabled={isSearching}
              >
                {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : "Discovery"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {SUGGESTED_KEYWORDS.map(kw => (
              <button
                key={kw}
                type="button"
                onClick={() => { setSearchTerm(kw); handleSearch(); }}
                className="px-5 py-2.5 rounded-full bg-white border-2 border-primary/5 text-[10px] font-black text-primary hover:bg-primary hover:text-white transition-all uppercase shadow-sm"
              >
                {kw}
              </button>
            ))}
          </div>
        </form>
      </header>

      <section className="grid gap-6 w-full max-w-4xl mx-auto pb-20">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-lg font-black uppercase tracking-[0.2em] text-primary">
            {searchTerm ? `Results for "${searchTerm}"` : "Active National Vacancies"}
          </h2>
          {(isInitialLoading || isSearching) && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>

        {allJobs.length > 0 ? (
          allJobs.map((job) => (
            <Card key={job.id} className="border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group border-l-8 border-l-transparent hover:border-l-primary rounded-[2.5rem] bg-white">
              <CardHeader className="p-8 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-black text-primary group-hover:underline cursor-pointer">
                      <a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-base font-bold mt-2 text-muted-foreground">
                      <Building2 className="h-5 w-5 text-primary/40" />
                      <span>{job.company}</span>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black px-4 py-1.5 rounded-full">
                    {job.remote ? "Remote Pro" : "On-Site"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-6 space-y-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase bg-muted/50 px-3 py-1.5 rounded-xl">
                    <MapPin className="h-4 w-4 text-primary/60" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase bg-muted/50 px-3 py-1.5 rounded-xl">
                    <Clock className="h-4 w-4 text-primary/60" />
                    <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed line-clamp-3 text-muted-foreground font-medium">
                  {job.description ? job.description.replace(/<[^>]*>?/gm, '') : "View full description on the application page."}
                </p>
              </CardContent>
              <CardFooter className="bg-muted/30 p-6 flex justify-between items-center px-8">
                <Button variant="ghost" size="sm" onClick={() => openTranslation(job.description || job.title)} className="text-[10px] font-black uppercase text-primary/60">
                  <Languages className="h-3.5 w-3.5 mr-1.5" /> Translate
                </Button>
                <Button className="rounded-full font-black px-8 h-12 uppercase" asChild>
                  <a href={job.url} target="_blank">Apply Now <ChevronRight className="ml-2 h-4 w-4" /></a>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (!isInitialLoading && !isSearching) ? (
          <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed mx-2 flex flex-col items-center gap-6">
            <Search className="h-16 w-16 text-muted-foreground/20" />
            <p className="text-muted-foreground font-black text-2xl">No matching roles found in Malawi.</p>
            <Button variant="outline" className="rounded-full font-black px-10 h-14" onClick={() => window.location.reload()}>Refresh All Listings</Button>
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
