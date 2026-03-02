
"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Award, 
  ExternalLink,
  ChevronRight,
  Loader2,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    return query(jobsRef, orderBy("dateCompleted", "desc"), limit(10));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const stats = useMemo(() => {
    if (!ratings) return { avg: 0, count: 0 };
    const count = ratings.length;
    const avg = count > 0 ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / count : 0;
    return { avg: avg.toFixed(1), count };
  }, [ratings]);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">This worker profile may be private or deleted.</p>
        <Button asChild><a href="/">Go Home</a></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto">
      {/* AI Structured Data for Trust */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": worker.name,
            "image": worker.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`,
            "description": worker.bio || `${worker.name} is a verified ${worker.tradeSkill} on Globlync.`,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": stats.avg,
              "reviewCount": stats.count || 1
            },
            "hasCredential": worker.badgeIds?.map((b: string) => ({
              "@type": "EducationalOccupationalCredential",
              "name": b.replace('-', ' ')
            }))
          })
        }}
      />

      <header className="relative">
        <div className="h-32 w-full bg-primary/10 rounded-3xl" />
        <div className="absolute -bottom-12 left-8 flex flex-col sm:flex-row items-end sm:items-center gap-4 sm:gap-6">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage src={worker.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
            <AvatarFallback>{worker.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="pb-2 sm:pb-0">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {worker.name}
              <ShieldCheck className="h-6 w-6 text-primary" />
            </h1>
            <p className="text-lg text-primary font-semibold">{worker.tradeSkill}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 mt-16 md:grid-cols-12">
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Reputation Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trust Score</span>
                <span className="text-xl font-bold text-primary">{worker.trustScore || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="text-sm font-bold">{stats.avg} ({stats.count})</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> Location Verified
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {worker.badgeIds?.map((badgeId: string) => (
                <Badge key={badgeId} variant="secondary" className="capitalize">
                  <Award className="h-3 w-3 mr-1" /> {badgeId.replace('-', ' ')}
                </Badge>
              ))}
              {!worker.badgeIds?.length && <p className="text-xs text-muted-foreground">Building reputation...</p>}
            </CardContent>
          </Card>

          {/* Ad Slot Sidebar */}
          <div id="monetag-ad-slot-sidebar" className="rounded-2xl bg-accent/30 p-4 border border-dashed text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Sponsored Content</p>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center border">
               <span className="text-[10px] text-muted-foreground p-4 italic">Professional trade tools & equipment</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-4">About the Professional</h2>
            <p className="text-muted-foreground leading-relaxed bg-white p-6 rounded-2xl shadow-sm border">
              {worker.bio || "This worker has verified their identity and skills with Globlync but hasn't updated their bio yet."}
            </p>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Verified Work History</h2>
              <Badge variant="outline" className="rounded-full">{jobs?.length || 0} Jobs Logged</Badge>
            </div>
            
            <div className="grid gap-4">
              {isJobsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted" />
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <Card key={job.id} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      <div className="h-40 sm:w-48 bg-muted shrink-0 relative">
                        <img 
                          src={job.photoUrl || `https://picsum.photos/seed/${job.id}/300/200`} 
                          alt={job.title} 
                          className="h-full w-full object-cover"
                          data-ai-hint="verified work"
                        />
                        {job.aiVerified && (
                          <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <Sparkles className="h-2 w-2" /> AI Verified
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-lg">{job.title}</h3>
                            {job.isVerified ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <Clock className="h-5 w-5 text-amber-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{job.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            {format(new Date(job.dateCompleted), "MMM d, yyyy")}
                          </span>
                          <Badge variant="outline" className="text-[8px] font-bold py-0">EVIDENCE-BASED</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground italic">No jobs logged in this history yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-12 pt-12 border-t text-center space-y-4">
        <p className="text-sm text-muted-foreground">Globlync: Portable, Verifiable Trust for Skilled Workers.</p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <a href="/login">Create Your Profile</a>
          </Button>
          <Button size="sm" className="rounded-full" asChild>
            <a href="/search">Find More Pros</a>
          </Button>
        </div>
      </footer>
    </div>
  );
}
