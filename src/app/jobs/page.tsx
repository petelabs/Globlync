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
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";
import Link from "next/link";
import { getArbeitnowJobs } from "./actions";

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

  const filteredJobs = externalJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate JSON-LD Schema for Google Search
  const generateSchemaMarkup = (job: any) => {
    return {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description ? job.description.substring(0, 200) + "..." : "Professional job opportunity via Globlync.",
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
          "addressCountry": "MW" // Defaulting to Malawi for indexing or API location
        }
      }
    };
  };

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto px-4">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">National & Global Board</h1>
          <p className="text-muted-foreground">Local Malawian opportunities supplemented by verified global remote roles.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card className="p-4 bg-primary/5 border-none flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest">Informal Sector</div>
          </Card>
          <Card className="p-4 bg-primary/5 border-none flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest">Formal Sector</div>
          </Card>
          <Card className="p-4 bg-primary/5 border-none flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="bg-primary/10 p-2 rounded-lg">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest">Job Seekers</div>
          </Card>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by trade, company, or city..." 
              className="pl-12 h-14 rounded-2xl shadow-sm border-2 text-base w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <AdBanner id={NATIVE_AD_ID} className="w-full mb-4" />

      <section className="grid gap-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Active Listings</h2>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>

        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, idx) => (
            <div key={job.slug || idx} className="w-full">
              {/* Inject JSON-LD Schema for each job */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchemaMarkup(job)) }}
              />
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group w-full">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-bold text-primary group-hover:underline cursor-pointer break-words">
                        <a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm font-medium mt-1">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{job.company_name}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none uppercase text-[9px] font-black shrink-0">
                      {job.remote ? "Remote" : "On-Site"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 font-bold text-[10px] uppercase">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-[150px]">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[10px] uppercase">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>Updated recently</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[10px] uppercase text-primary/60">
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      <span>Arbeitnow Global</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3 opacity-80 break-words">
                    {job.description ? job.description.replace(/<[^>]*>?/gm, '') : "Check full details on the application page."}
                  </p>
                </CardContent>
                <CardFooter className="bg-muted/30 flex flex-col sm:flex-row gap-3 p-4">
                  <Button className="w-full sm:w-auto rounded-full px-8 font-black shadow-lg" asChild>
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Apply Now
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest text-muted-foreground" asChild>
                    <a href={`mailto:globlync+support@gmail.com?subject=Inquiry: ${job.title}`}>Report Issue</a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))
        ) : !isLoading ? (
          <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed mx-2">
            <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground font-medium px-4">No matches found. Try searching for broader terms like "Worker" or "Professional".</p>
            <Button variant="ghost" className="mt-4 text-primary font-bold" onClick={() => {setSearchTerm("");}}>View All Listings</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-48 animate-pulse bg-muted/20 border-none rounded-2xl" />
            ))}
          </div>
        )}
      </section>

      <AdBanner id={NATIVE_AD_ID} className="w-full mt-4" />

      <Card className="border-none bg-primary text-primary-foreground p-8 md:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden mx-2 sm:mx-0">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-32 w-32" />
        </div>
        <div className="relative z-10 space-y-4">
          <h3 className="font-black text-2xl tracking-tighter">Are you an Employer or Advertiser?</h3>
          <p className="text-sm opacity-80 max-w-lg">Reach thousands of verified professionals across Malawi. Advertise your brand or post vacancies directly on our national network.</p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button variant="secondary" className="rounded-full font-black px-8 h-12 w-full sm:w-auto" asChild>
              <a href="https://wa.me/0987066051" target="_blank">
                <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Us
              </a>
            </Button>
            <Button variant="outline" className="rounded-full font-black px-8 bg-transparent border-white hover:bg-white/10 h-12 w-full sm:w-auto" asChild>
              <a href="mailto:globlync+ads@gmail.com">
                <Mail className="mr-2 h-4 w-4" /> Advertising Inquiries
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
