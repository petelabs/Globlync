
"use client";

import { useState } from "react";
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
  GraduationCap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";
import Link from "next/link";

const JOB_LISTINGS: any[] = [];

export default function JobsBoardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const NATIVE_AD_ID = "732a8eb1f93a972b628ecf38814db400";

  const filteredJobs = JOB_LISTINGS.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">National Job Board</h1>
          <p className="text-muted-foreground">Opportunities for formal & informal skilled workers across all 28 districts of Malawi.</p>
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
              placeholder="Search by trade or district (e.g. Mzuzu, Mason)..." 
              className="pl-12 h-14 rounded-2xl shadow-sm border-2 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <AdBanner id={NATIVE_AD_ID} className="w-full mb-4" />

      <section className="grid gap-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm font-medium mt-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {job.employer}
                    </div>
                  </div>
                  <Badge variant="secondary">{job.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{job.description}</p>
              </CardContent>
              <CardFooter className="bg-muted/30 flex flex-col sm:flex-row gap-3 p-4">
                <Button className="w-full sm:w-auto rounded-full px-6 font-bold" asChild>
                  <a href={`mailto:${job.applicationEmail}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Apply via Email
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed">
            <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground font-medium">No active listings currently. Join as a professional to build your reputation and be ready when they open!</p>
            <Button variant="ghost" className="mt-4 text-primary font-bold" asChild>
              <Link href="/login">Create My Profile <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        )}
      </section>

      <AdBanner id={NATIVE_AD_ID} className="w-full mt-4" />

      <Card className="border-none bg-primary text-primary-foreground p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-32 w-32" />
        </div>
        <div className="relative z-10 space-y-4">
          <h3 className="font-black text-2xl tracking-tighter">Are you an Employer or Advertiser?</h3>
          <p className="text-sm opacity-80 max-w-lg">Reach thousands of verified professionals and job seekers across Malawi. Advertise your brand or post vacancies directly on our national network.</p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button variant="secondary" className="rounded-full font-black px-8" asChild>
              <a href="https://wa.me/0987066051" target="_blank">
                <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Us
              </a>
            </Button>
            <Button variant="outline" className="rounded-full font-black px-8 bg-transparent border-white hover:bg-white/10" asChild>
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
