"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, ShieldCheck, MapPin, Award, Clock, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const MILESTONE_BADGES: Record<string, { name: string; icon: any; color: string }> = {
  'first-job': { name: "First Verified Job", icon: Award, color: "text-blue-500" },
  'reliable-worker': { name: "Reliable Pro", icon: Award, color: "text-primary" },
  'perfect-streak': { name: "Customer Favorite", icon: Award, color: "text-secondary" },
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
    return query(jobsRef, orderBy("dateCompleted", "desc"));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">This worker profile may have been removed or the link is incorrect.</p>
      </div>
    );
  }

  const avgRating = ratings?.length 
    ? (ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length).toFixed(1)
    : "0.0";

  const verifiedJobs = jobs?.filter(j => j.isVerified) || [];

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left bg-primary/5 p-8 rounded-3xl border border-primary/10">
        <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
          <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
          <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-4xl font-black tracking-tight">{profile.name}</h1>
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xl font-bold text-primary">{profile.tradeSkill}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 font-bold text-foreground">
              <Star className="h-4 w-4 fill-secondary text-secondary" /> {avgRating} Rating
            </span>
            <span className="flex items-center gap-1 font-bold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> {verifiedJobs.length} Verified Jobs
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-4 w-4 text-primary" /> Trust Score: {profile.trustScore || 0}
            </span>
          </div>
          <p className="text-muted-foreground max-w-xl line-clamp-3">
            {profile.bio || "A dedicated professional building a verified reputation on Globlync."}
          </p>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Achievements */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {(profile.badgeIds || []).length > 0 ? (
                profile.badgeIds.map((badgeId: string) => {
                  const badge = MILESTONE_BADGES[badgeId];
                  if (!badge) return null;
                  const Icon = badge.icon;
                  return (
                    <div key={badgeId} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/30 border w-20 text-center">
                      <Icon className={cn("h-6 w-6", badge.color)} />
                      <span className="text-[8px] font-bold leading-tight">{badge.name}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic">No badges earned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Work History */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold">Verified Work History</h2>
          {isJobsLoading ? (
            <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted" /></div>
          ) : verifiedJobs.length > 0 ? (
            verifiedJobs.map((job) => (
              <Card key={job.id} className="overflow-hidden border-none shadow-sm transition-transform hover:scale-[1.01]">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative aspect-video w-full sm:w-40 bg-muted shrink-0">
                      <img 
                        src={job.photoUrl || `https://picsum.photos/seed/${job.id}/200/200`} 
                        alt={job.title} 
                        className="h-full w-full object-cover"
                        data-ai-hint="construction proof"
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
                          <p className="text-xs text-muted-foreground line-clamp-1">{job.description}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="mt-auto flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="uppercase tracking-widest">{format(new Date(job.dateCompleted), "MMM yyyy")}</span>
                        <div className="flex items-center gap-1 text-foreground font-bold">
                          <Star className="h-3 w-3 fill-secondary text-secondary" /> 5.0
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed">
              <p className="text-muted-foreground">No verified jobs yet. This professional is just getting started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
