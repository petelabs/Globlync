
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
  Filter,
  Building2,
  ChevronRight,
  Info,
  MessageSquare,
  Users,
  GraduationCap,
  Loader2,
  ExternalLink,
  Globe,
  Sparkles,
  X,
  ArrowDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";
import Link from "next/link";
import { getArbeitnowJobs } from "./actions";

const SUGGESTED_KEYWORDS = ["Developer", "Designer", "Engineer", "Sales", "Manager", "Marketing"];

export default function JobsBoardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [externalJobs, setExternalJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const NATIVE_AD_ID = "732a8eb1f93a972b628ecf38814db400";

  useEffect(() => {
    async function loadJobs() {
      setIsLoading(true);
      const jobs = await getArbeitnowJobs();
      setExternalJobs(jobs);
      setIsLoading(false);
    }
    loadJobs();
  }, []);

  const filteredJobs = externalJobs.filter(job => {
    const search = searchTerm.toLowerCase();
    const title = (job.title || "").toLowerCase();
    const company = (job.company_name || "").toLowerCase();
    const location = (job.location || "").toLowerCase();
    const description = (job.description || "").toLowerCase();

    return title.includes(search) || 
           company.includes(search) || 
           location.includes(search) ||
           description.includes(search);
  });

  const generateSchemaMarkup = (job: any) => {
    return {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description ? job.description.substring(0, 200) + "..." : "Professional job opportunity via Globlync Global.",
      "datePosted": job.created_at || new Date().toISOString(),
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company_name,
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
    <div className="flex flex-col gap-6 py-4 max-w-full mx-auto px-3 sm:px-4 overflow-x-hidden w-full box-border">
      <header className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-primary">Global Career Moves.</h1>
          <p className="text-muted-foreground text-sm font-medium">Explore remote roles and international vacancies verified for global professionals.</p>
        </div>
        
        <div className="space-y-4 w-full">
          <div className="relative group w-full">
            <Search className="absolute left-4 top-4 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search keywords (Developer, Designer, Engineer)..." 
              className="pl-12 h-16 rounded-2xl shadow-xl border-2 text-base w-full focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-5 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground self-center mr-2">Popular:</span>
            {SUGGESTED_KEYWORDS.map(kw => (
              <button
                key={kw}
                onClick={() => setSearchTerm(kw)}
                className="px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="my-2 w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
        <AdBanner id={NATIVE_AD_ID} className="w-full" />
        <div className="flex flex-col items-center gap-2 animate-bounce mt-4 text-primary">
          <span className="text-[10px] font-black uppercase tracking-widest">Scroll down to find Jobs</span>
          <ArrowDown className="h-5 w-5" />
        </div>
      </div>

      <section className="grid gap-4 w-full max-w-4xl mx-auto overflow-hidden">
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
              {searchTerm ? `Search Results for "${searchTerm}"` : "Active Global & Remote Listings"}
            </h2>
            <Badge variant="outline" className="text-[10px] font-bold">{filteredJobs.length}</Badge>
          </div>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>

        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, idx) => (
            <div key={job.slug || idx} className="w-full min-w-0">
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchemaMarkup(job)) }}
              />
              <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group w-full border-l-4 border-l-transparent hover:border-l-primary flex flex-col h-full box-border">
                <CardHeader className="pb-2 w-full min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 w-full min-w-0">
                    <div className="flex-1 min-w-0 w-full">
                      <CardTitle className="text-xl font-bold text-primary group-hover:underline cursor-pointer break-words leading-tight w-full">
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          {job.title}
                          <ExternalLink className="h-4 w-4 opacity-30 shrink-0" />
                        </a>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm font-medium mt-1 text-muted-foreground w-full">
                        <Building2 className="h-4 w-4 shrink-0" />
                        <span className="truncate">{job.company_name}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none uppercase text-[9px] font-black shrink-0 px-3 py-1 rounded-full whitespace-nowrap">
                      {job.remote ? "Remote" : "Global"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 w-full min-w-0">
                  <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-muted-foreground w-full">
                    <div className="flex items-center gap-1 font-bold text-[10px] uppercase bg-muted/50 px-2 py-1 rounded-md max-w-full">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[10px] uppercase bg-muted/50 px-2 py-1 rounded-md">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      <span>Updated</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3 opacity-80 break-words font-medium w-full">
                    {job.description ? job.description.replace(/<[^>]*>?/gm, '') : "Check full details on the application page."}
                  </p>
                </CardContent>
                <CardFooter className="bg-muted/30 flex justify-between items-center p-4 w-full min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary/60 uppercase">
                    <Sparkles className="h-3 w-3" /> Global Professional Listing
                  </div>
                </CardFooter>
              </Card>
            </div>
          ))
        ) : !isLoading ? (
          <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed mx-2 flex flex-col items-center gap-4">
            <div className="bg-white p-6 rounded-full shadow-inner">
              <Search className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground font-black text-lg px-4">No results for "{searchTerm}"</p>
              <p className="text-xs text-muted-foreground/60 px-4">Try searching for broader keywords like "Developer", "Designer", or "Engineer".</p>
            </div>
            <Button variant="ghost" className="mt-4 font-black uppercase tracking-tighter" onClick={() => setSearchTerm("")}>Show all listings</Button>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-48 animate-pulse bg-muted/20 border-none rounded-3xl w-full" />
            ))}
          </div>
        )}
      </section>

      <div className="mt-4 w-full max-w-4xl mx-auto">
        <AdBanner id={NATIVE_AD_ID} className="w-full" />
      </div>

      <Card className="border-none bg-primary text-primary-foreground p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group w-full max-w-4xl mx-auto">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Sparkles className="h-48 w-48 md:h-64 md:w-64" />
        </div>
        <div className="relative z-10 space-y-6 w-full">
          <div className="space-y-2">
            <h3 className="font-black text-3xl md:text-4xl tracking-tighter leading-none">Hire Global <br/><span className="text-secondary italic">Excellence.</span></h3>
            <p className="text-sm md:text-base opacity-80 max-w-md leading-relaxed">
              Reach thousands of verified professionals worldwide. Advertise your brand or post vacancies directly on our network.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button variant="secondary" className="rounded-full font-black px-8 h-14 w-full sm:w-auto shadow-xl hover:scale-105 transition-transform" asChild>
              <a href="https://wa.me/0987066051" target="_blank">
                <MessageSquare className="mr-2 h-5 w-5" /> Contact Partnerships
              </a>
            </Button>
            <Button variant="outline" className="rounded-full font-black px-8 bg-transparent border-white hover:bg-white/10 h-14 w-full sm:w-auto" asChild>
              <a href="mailto:globlync+ads@gmail.com">
                <Mail className="mr-2 h-5 w-5" /> Ad Partnerships
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
