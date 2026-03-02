
"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Briefcase, 
  Award, 
  MapPin, 
  Calendar,
  Sparkles,
  ExternalLink,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const MILESTONE_BADGES: Record<string, { name: string; icon: any; color: string; desc: string }> = {
  'first-job': { name: "First Verified Job", icon: Award, color: "text-blue-500", desc: "Awarded for completing the first verified job on Globlync." },
  'reliable-worker': { name: "Reliable Pro", icon: Award, color: "text-primary", desc: "Successfully completed over 5 verified jobs with positive feedback." },
  'perfect-streak': { name: "Customer Favorite", icon: Award, color: "text-secondary", desc: "Maintained a consistent 5-star rating over multiple assignments." },
};

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const db = useFirestore();

  const workerRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return doc(db, "workerProfiles", workerId);
  }, [db, workerId]);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "jobs");
  }, [db, workerId]);

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("dateCompleted", "desc"));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);

  const verifiedJobs = useMemo(() => jobs?.filter(j => j.isVerified) || [], [jobs]);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">The worker profile you are looking for does not exist or has been moved.</p>
        <Button className="mt-4 rounded-full" asChild>
          <a href="/">Go to Home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-8">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-primary px-6 py-12 text-primary-foreground overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="h-48 w-48" />
        </div>
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <Avatar className="h-32 w-32 border-4 border-white/20 shadow-xl">
            <AvatarImage src={worker.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
            <AvatarFallback className="text-2xl text-primary font-bold">{worker.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-4xl font-black tracking-tight">{worker.name}</h1>
              <Badge className="bg-secondary text-secondary-foreground font-bold px-3 py-1">
                <ShieldCheck className="mr-1 h-3 w-3" /> Trust Score: {worker.trustScore || 0}
              </Badge>
            </div>
            <p className="text-xl font-medium text-primary-foreground/90 flex items-center justify-center md:justify-start gap-2">
              <Briefcase className="h-5 w-5" /> {worker.tradeSkill}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm opacity-80">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Location Verified</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-secondary text-secondary" /> 5.0 Avg Rating</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar: Bio & Badges */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-accent/30">
            <CardHeader>
              <CardTitle className="text-lg">Professional Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                "{worker.bio || `Professional ${worker.tradeSkill} dedicated to providing high-quality service and customer satisfaction.`}"
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {worker.badgeIds && worker.badgeIds.length > 0 ? (
                worker.badgeIds.map((bid: string) => {
                  const b = MILESTONE_BADGES[bid];
                  if (!b) return null;
                  return (
                    <div key={bid} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                      <b.icon className={cn("h-6 w-6 mt-1", b.color)} />
                      <div className="text-xs">
                        <p className="font-bold">{b.name}</p>
                        <p className="text-muted-foreground">{b.desc}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-4">Achievements are awarded after verified work milestones.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Ad Space: Monetag Sidebar Placeholder */}
          <div id="monetag-ad-slot-sidebar" className="rounded-xl border-2 border-dashed border-muted p-4 bg-muted/10 text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Promotion</span>
            <div className="aspect-square bg-muted/30 rounded flex items-center justify-center">
              <p className="text-[10px] text-muted-foreground italic p-2">Sponsors help us keep the platform free for workers.</p>
            </div>
          </div>
        </div>

        {/* Main Content: Verified History */}
        <div className="md:col-span-2 space-y-6">
          <header className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" /> Verified Job History
            </h2>
            <Badge variant="outline" className="font-bold">{verifiedJobs.length} Jobs Logged</Badge>
          </header>

          <div className="grid gap-4">
            {isJobsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted" /></div>
            ) : verifiedJobs.length > 0 ? (
              verifiedJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0 border-r">
                        <img 
                          src={job.photoUrl || `https://picsum.photos/seed/${job.id}/300/200`} 
                          alt={job.title} 
                          className="h-full w-full object-cover"
                        />
                        {job.aiVerified && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <Sparkles className="h-2 w-2" /> AI Verified
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold">{job.title}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{job.description}</p>
                          </div>
                          <div className="flex items-center gap-1 text-secondary font-bold">
                            <Star className="h-4 w-4 fill-secondary" /> 5.0
                          </div>
                        </div>
                        <div className="mt-auto flex items-center gap-4 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1 uppercase tracking-widest font-bold">
                            <Calendar className="h-3 w-3" /> {format(new Date(job.dateCompleted), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground">This professional is just getting started on Globlync. Check back soon for verified logs!</p>
              </div>
            )}
          </div>
          
          {/* Ad Space: Monetag Footer Placeholder */}
          <div id="monetag-ad-slot-footer" className="mt-12 rounded-xl border border-muted bg-muted/5 p-4 text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Marketplace Offers</span>
            <div className="h-24 bg-muted/20 rounded-lg flex items-center justify-center border border-dashed">
              <p className="text-xs text-muted-foreground italic">Ads help support our mission to verify skilled labor globally.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
