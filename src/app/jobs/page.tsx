
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Mail, 
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
import { getArbeitnowJobs, searchJoobleJobs } from "./actions";
import { formatDistanceToNow } from "date-fns";

const SUGGESTED_KEYWORDS = ["Developer", "Designer", "Engineer", "Sales", "Manager", "Marketing"];

export default function JobsBoardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const NATIVE_AD_ID = "732a8eb1f93a972b628ecf38814db400";

  // Initial Load: Combine both sources
  useEffect(() => {
    async function loadInitialJobs() {
      setIsInitialLoading(true);
      try {
        const [aJobs, jJobs] = await Promise.all([
          getArbeitnowJobs(),
          searchJoobleJobs("remote")
        ]);
        setAllJobs([...aJobs, ...jJobs].sort((a, b) => b.createdAt - a.createdAt));
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
    if (!searchTerm.trim()) return;

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

  const handleQuickSearch = async (kw: string) => {
    setSearchTerm(kw);
    setIsSearching(true);
    try {
      const results = await searchJoobleJobs(kw);
      setAllJobs(results);
    } catch (err) {
      console.error("Quick search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const openTranslation = (text: string) => {
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const translateUrl = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(cleanText)}&op=translate`;
    window.open(translateUrl, '_blank');
  };

  const generateSchemaMarkup = (job: any) => {
    return {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description ? job.description.substring(0, 200) + "..." : "Professional job opportunity via Globlync Global.",
      "datePosted": new Date(job.createdAt).toISOString(),
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company,
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location,
          "addressCountry": "US" 
        }
      }
    };
  };

  return (
    <div className="flex flex-col gap-12 py-8 max-w-full mx-auto px-3 sm:px-4 overflow-x-hidden w-full box-border">
      {/* Hero Search Section - Undistracted Focus */}
      <header className="flex flex-col gap-10 w-full max-w-4xl mx-auto text-center py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-secondary">
            <div className="h-2 w-2 rounded-full bg-secondary animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">100+ Global Roles Posted Hourly</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
            Find Your <span className="text-primary">Next Move.</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            The world's largest remote career engine. Search the entire internet for high-value professional roles in one clean place.
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-6 w-full max-w-3xl mx-auto">
          <div className="relative group w-full">
            <Search className="absolute left-8 top-8 h-10 w-10 text-muted-foreground group-focus-within:text-primary transition-all scale-90 group-focus-within:scale-100" />
            <Input 
              placeholder="Job title, skill, or global company..." 
              className="pl-20 h-24 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border-4 border-primary/5 focus-visible:border-primary/20 text-2xl font-black w-full focus-visible:ring-0 transition-all placeholder:text-muted-foreground/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-6 top-6 flex gap-2">
              {searchTerm && !isSearching && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    window.location.reload();
                  }}
                  className="p-4 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-8 w-8 text-muted-foreground" />
                </button>
              )}
              <Button 
                type="submit" 
                className="h-12 md:h-14 rounded-full px-8 md:px-12 font-black uppercase tracking-tighter shadow-2xl hover:scale-105 transition-transform"
                disabled={isSearching || !searchTerm}
              >
                {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : "Search Jobs"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground self-center mr-2">Quick Search:</span>
            {SUGGESTED_KEYWORDS.map(kw => (
              <button
                key={kw}
                type="button"
                onClick={() => handleQuickSearch(kw)}
                className="px-5 py-2.5 rounded-full bg-white border-2 border-primary/5 text-[10px] font-black text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-tight shadow-sm"
              >
                {kw}
              </button>
            ))}
          </div>
        </form>
      </header>

      <div className="my-2 w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
        <AdBanner id={NATIVE_AD_ID} className="w-full" />
        <div className="flex flex-col items-center gap-2 animate-bounce mt-8 text-primary">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Scroll to Explore Results</span>
          <ArrowDown className="h-5 w-5" />
        </div>
      </div>

      <section className="grid gap-6 w-full max-w-4xl mx-auto overflow-hidden pb-20">
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black uppercase tracking-[0.2em] text-primary">
              {searchTerm ? `Results for "${searchTerm}"` : "Active Global Opportunities"}
            </h2>
            <Badge variant="secondary" className="text-[10px] font-black bg-primary/10 text-primary border-none">{allJobs.length}</Badge>
          </div>
          {(isInitialLoading || isSearching) && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>

        {allJobs.length > 0 ? (
          allJobs.map((job, idx) => (
            <div key={job.id} className="w-full min-w-0">
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchemaMarkup(job)) }}
              />
              <Card className="border-none shadow-sm hover:shadow-2xl transition-all overflow-hidden group w-full border-l-8 border-l-transparent hover:border-l-primary flex flex-col h-full box-border rounded-[2.5rem] bg-white">
                <CardHeader className="p-8 pb-4 w-full min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full min-w-0">
                    <div className="flex-1 min-w-0 w-full">
                      <CardTitle className="text-2xl font-black text-primary group-hover:underline cursor-pointer break-words leading-tight w-full">
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          {job.title}
                          <ExternalLink className="h-5 w-5 opacity-20 shrink-0" />
                        </a>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-base font-bold mt-2 text-muted-foreground w-full">
                        <Building2 className="h-5 w-5 shrink-0 text-primary/40" />
                        <span className="truncate">{job.company}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none uppercase text-[10px] font-black shrink-0 px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm">
                        {job.type === 'jooble' ? "Global Web" : job.remote ? "Remote Pro" : "On-Site"}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openTranslation(job.description || job.title)}
                        className="h-8 rounded-full text-[9px] font-black uppercase text-primary/60 hover:text-primary hover:bg-primary/5 flex items-center gap-1.5"
                      >
                        <Languages className="h-3.5 w-3.5" /> Translate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-6 space-y-6 flex-1 w-full min-w-0">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground w-full">
                    <div className="flex items-center gap-2 font-black text-[10px] uppercase bg-muted/50 px-3 py-1.5 rounded-xl max-w-full">
                      <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 font-black text-[10px] uppercase bg-muted/50 px-3 py-1.5 rounded-xl">
                      <Clock className="h-4 w-4 shrink-0 text-primary/60" />
                      <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <p className="text-base leading-relaxed line-clamp-3 opacity-80 break-words font-medium w-full text-muted-foreground">
                    {job.description ? job.description.replace(/<[^>]*>?/gm, '') : "Check full details on the application page."}
                  </p>
                </CardContent>
                <CardFooter className="bg-muted/30 flex justify-between items-center p-6 w-full min-w-0 px-8">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary/40 uppercase tracking-widest">
                    <Sparkles className="h-4 w-4" /> Professional Opportunity
                  </div>
                  <Button className="rounded-full font-black px-8 h-12 uppercase tracking-tighter shadow-lg hover:scale-105 transition-transform" asChild>
                    <a href={job.url} target="_blank">Apply Now <ChevronRight className="ml-2 h-4 w-4" /></a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))
        ) : (!isInitialLoading && !isSearching) ? (
          <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed mx-2 flex flex-col items-center gap-6">
            <div className="bg-white p-8 rounded-full shadow-2xl">
              <Search className="h-16 w-16 text-muted-foreground/20" />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground font-black text-2xl px-4">No matching roles found.</p>
              <p className="text-sm text-muted-foreground/60 px-4 max-w-md mx-auto">Try searching for broader titles like "React", "Manager", or "Designer" to see more global results.</p>
            </div>
            <Button variant="outline" className="mt-4 font-black uppercase tracking-widest border-2 rounded-full h-14 px-10" onClick={() => {setSearchTerm(""); window.location.reload();}}>View All Listings</Button>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-64 animate-pulse bg-muted/20 border-none rounded-[2.5rem] w-full" />
            ))}
          </div>
        )}
      </section>

      <Card className="border-none bg-primary text-primary-foreground p-10 md:p-16 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,121,107,0.4)] relative overflow-hidden group w-full max-w-4xl mx-auto text-center md:text-left">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <Sparkles className="h-64 w-64 md:h-96 md:w-96" />
        </div>
        <div className="relative z-10 space-y-8 w-full">
          <div className="space-y-4">
            <h3 className="font-black text-4xl md:text-6xl tracking-tighter leading-none">Hire Verified <br/>Global Excellence.</h3>
            <p className="text-lg md:text-xl opacity-80 max-w-2xl font-medium leading-relaxed mx-auto md:mx-0">
              Reach thousands of verified remote professionals. Post your vacancies directly on our network to find high-trust talent.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            <Button variant="secondary" className="rounded-full font-black px-10 h-16 w-full sm:w-auto shadow-2xl hover:scale-105 transition-transform text-lg" asChild>
              <a href="https://wa.me/0987066051" target="_blank">
                <Mail className="mr-3 h-6 w-6" /> Contact Partnerships
              </a>
            </Button>
            <Button variant="outline" className="rounded-full font-black px-10 bg-transparent border-white hover:bg-white/10 h-16 w-full sm:w-auto text-lg" asChild>
              <a href="mailto:globlync+ads@gmail.com">
                <Globe className="mr-3 h-6 w-6" /> Ad Inquiries
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
