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
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const JOB_LISTINGS: any[] = [];

export default function JobsBoardPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = JOB_LISTINGS.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">Find Work</h1>
          <p className="text-muted-foreground">Available opportunities for skilled workers in Malawi.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-10 h-12 rounded-full shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

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
                <Button className="w-full sm:w-auto rounded-full px-6" asChild>
                  <a href={`mailto:${job.applicationEmail}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Apply via Email
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground">No matching job listings found.</p>
          </div>
        )}
      </section>

      <Card className="border-none bg-primary/5 text-primary text-center p-8 rounded-[2.5rem]">
        <h3 className="font-bold text-xl mb-2">Want to post a job?</h3>
        <p className="text-sm opacity-80 mb-6">Reach thousands of verified skilled workers across Malawi.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="outline" className="rounded-full border-primary" asChild>
            <a href="https://wa.me/0987066051" target="_blank">
              <MessageSquare className="mr-2 h-4 w-4" /> Message on WhatsApp
            </a>
          </Button>
          <Button variant="outline" className="rounded-full border-primary" asChild>
            <a href="mailto:globlync.pro@gmail.com">
              <Mail className="mr-2 h-4 w-4" /> Email globlync.pro@gmail.com
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}