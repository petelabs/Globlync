"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Award, 
  Briefcase, 
  Calendar,
  Loader2,
  ExternalLink,
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
    return query(jobsRef, orderBy("dateCompleted", "desc"));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const stats = useMemo(() => {
    const verifiedJobs = jobs?.filter(j => j.isVerified) || [];
    const avgRating = ratings?.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 5.0;
    
    return {
      totalVerified: verifiedJobs.length,
      averageRating: avgRating.toFixed(1),
      trustScore: profile?.trustScore || 0,
      badges: profile?.badgeIds || []
    };
  }, [jobs, ratings, profile]);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">This worker profile may be private or deleted.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="h-48 w-48" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <Avatar className="h-40 w-40 border-4 border-white/20 shadow-xl">
            <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
            <AvatarFallback className="text-4xl">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-4xl font-black tracking-tight">{profile.name}</h1>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-bold">
                <ShieldCheck className="mr-1 h-3 w-3" /> Verified Pro
              </Badge>
            </div>
            <p className="text-xl opacity-90 flex items-center justify-center md:justify-start gap-2 mb-4">
              <Briefcase className="h-5 w-5" /> {profile.tradeSkill}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Trust Score</p>
                <p className="text-2xl font-black">{stats.trustScore}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Rating</p>
                <p className="text-2xl font-black flex items-center gap-1">
                  {stats.averageRating} <Star className="h-5 w-5 fill-secondary text-secondary" />
                </p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Verified Jobs</p>
                <p className="text-2xl font-black">{stats.totalVerified}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          {/* Bio Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              About Professional
            </h2>
            <Card className="border-none shadow-sm bg-muted/30">
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed italic">
                  "{profile.bio || "This professional prefers to let their verified work history speak for itself."}"
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Verified Work History */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              Verified Work History
            </h2>
            <div className="grid gap-4">
              {isJobsLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-muted" /></div>
              ) : jobs && jobs.length > 0 ? (
                jobs.filter(j => j.isVerified).map((job) => (
                  <Card key={job.id} className="overflow-hidden border-none shadow-sm group hover:shadow-md transition-all">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative aspect-video w-full sm:w-40 bg-muted shrink-0 overflow-hidden">
                          <img 
                            src={job.photoUrl || `https://picsum.photos/seed/${job.id}/300/200`} 
                            alt={job.title} 
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            data-ai-hint="construction work"
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
                              <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                            </div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="mt-auto flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {format(new Date(job.dateCompleted), "MMM d, yyyy")}
                            </span>
                            <span className="text-primary flex items-center gap-1">
                              Verified Completion
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground">Work history is currently being verified.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Badges & Ads */}
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-4">Achievements</h2>
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6 flex flex-wrap gap-4">
                {stats.badges.length > 0 ? (
                  stats.badges.map((badgeId: string) => (
                    <div key={badgeId} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/30 border border-accent w-[calc(50%-8px)] text-center transition-transform hover:scale-105">
                      <Award className="h-8 w-8 text-primary" />
                      <span className="text-[10px] font-black leading-tight uppercase tracking-tighter">{badgeId.replace('-', ' ')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center w-full py-4">Achievements unlocked through verified performance.</p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Monetag Ad Slot: Sidebar */}
          <Card className="border-none bg-accent/30 shadow-sm overflow-hidden border-dashed border-2">
            <CardHeader className="pb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sponsored</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div id="monetag-ad-slot-sidebar" className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center border overflow-hidden">
                <div className="text-center p-4">
                  <p className="text-[10px] text-muted-foreground italic">Ads support the Globlync community.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs h-8 rounded-full">
                Learn More <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
