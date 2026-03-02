"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Award, 
  Briefcase,
  Loader2,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BADGE_CONFIG: Record<string, { name: string; color: string; icon: any }> = {
  'first-job': { name: "Early Adopter", color: "bg-blue-500", icon: Award },
  'reliable-worker': { name: "Reliable Pro", color: "bg-primary", icon: ShieldCheck },
  'perfect-streak': { name: "Top Rated", color: "bg-secondary", icon: Star },
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

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(10));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const stats = useMemo(() => {
    if (!jobs || !ratings) return { verifiedCount: 0, avgRating: 0 };
    const verified = jobs.filter(j => j.isVerified).length;
    const avg = ratings.length ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length : 0;
    return { verifiedCount: verified, avgRating: avg.toFixed(1) };
  }, [jobs, ratings]);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">This worker profile might have been removed or is private.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Schema.org Structured Data for AI Trust */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": worker.name,
            "jobTitle": worker.tradeSkill,
            "description": worker.bio || `Professional ${worker.tradeSkill} verified on Globlync.`,
            "image": worker.profilePictureUrl,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": stats.avgRating,
              "reviewCount": ratings?.length || 0,
              "bestRating": "5",
              "worstRating": "1"
            }
          })
        }}
      />

      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-24 bg-primary"></div>
            <CardContent className="pt-0 -mt-12 text-center">
              <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-lg">
                <AvatarImage src={worker.profilePictureUrl || `https://picsum.photos/seed/${worker.id}/200/200`} />
                <AvatarFallback>{worker.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="mt-4">
                <h1 className="text-2xl font-bold">{worker.name}</h1>
                <p className="text-primary font-semibold flex items-center justify-center gap-1">
                  <Briefcase className="h-3 w-3" /> {worker.tradeSkill}
                </p>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold">{worker.trustScore}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Trust Score</p>
                  </div>
                  <div className="h-8 w-px bg-border"></div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{stats.avgRating}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Rating</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {worker.badgeIds?.length > 0 ? (
                worker.badgeIds.map((bid: string) => {
                  const config = BADGE_CONFIG[bid] || { name: bid, color: "bg-muted", icon: Award };
                  const Icon = config.icon;
                  return (
                    <Badge key={bid} className={cn("rounded-full py-1 pr-3 flex items-center gap-1", config.color)}>
                      <div className="bg-white/20 p-1 rounded-full"><Icon className="h-3 w-3" /></div>
                      {config.name}
                    </Badge>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">Building professional achievements...</p>
              )}
            </CardContent>
          </Card>

          {/* Ad Slot Placeholder */}
          <div id="monetag-ad-slot-sidebar" className="rounded-2xl bg-accent/30 p-4 border-2 border-dashed flex flex-col items-center justify-center text-center gap-2">
             <span className="text-[8px] font-bold opacity-40 uppercase">Sponsored Content</span>
             <p className="text-[10px] italic text-muted-foreground">Professional offers for {worker.tradeSkill}s</p>
             <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                <ExternalLink className="h-4 w-4 text-muted" />
             </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Professional Biography
            </h2>
            <Card className="border-none shadow-sm bg-muted/20">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed italic">
                  {worker.bio || "This worker has not yet provided a detailed biography."}
                </p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Verified Work History
            </h2>
            <div className="grid gap-4">
              {isJobsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
              ) : jobs && jobs.length > 0 ? (
                jobs.filter(j => j.isVerified).map((job) => (
                  <Card key={job.id} className="border-none shadow-sm transition-transform hover:scale-[1.01]">
                    <CardContent className="p-4 flex gap-4">
                      <div className="relative h-20 w-20 rounded-xl bg-muted overflow-hidden shrink-0 border">
                        <img 
                          src={job.photoUrl || `https://picsum.photos/seed/${job.id}/100/100`} 
                          alt={job.title} 
                          className="h-full w-full object-cover" 
                        />
                        {job.aiVerified && (
                          <div className="absolute top-1 left-1 bg-primary text-[8px] font-black text-white px-1 rounded flex items-center gap-0.5">
                            <Sparkles className="h-2 w-2" /> AI
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg">{job.title}</h4>
                          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {format(new Date(job.dateCompleted), "MMM yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{job.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px] h-4 bg-green-50 text-green-700 border-green-200">
                            CLIENT VERIFIED
                          </Badge>
                          {job.aiVerified && (
                             <Badge variant="outline" className="text-[8px] h-4 bg-blue-50 text-blue-700 border-blue-200">
                                EVIDENCE-BASED PROOF
                             </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl opacity-50">
                  <p>No verified jobs to display yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
