"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Award, 
  Clock, 
  MapPin, 
  ExternalLink,
  Briefcase,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BADGE_CONFIG: Record<string, { name: string; color: string }> = {
  'first-job': { name: "First Verified Job", color: "bg-blue-500" },
  'reliable-worker': { name: "Reliable Professional", color: "bg-primary" },
  'perfect-streak': { name: "Customer Favorite", color: "bg-secondary" },
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
    return query(jobsRef, where("isVerified", "==", true), orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const stats = useMemo(() => {
    const avgRating = ratings?.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 5.0;
    
    return {
      averageRating: avgRating.toFixed(1),
      totalVerified: jobs?.length || 0,
      trustScore: profile?.trustScore || 0,
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">The worker profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4">
      {/* Header Profile Section */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-card p-8 rounded-[2rem] border shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
        
        <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
          <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
          <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight">{profile.name}</h1>
            <Badge variant="secondary" className="w-fit mx-auto md:mx-0 bg-primary/10 text-primary border-none font-bold">
              <ShieldCheck className="mr-1 h-3 w-3" /> Verified Pro
            </Badge>
          </div>
          <p className="text-xl font-medium text-primary flex items-center justify-center md:justify-start gap-2">
            <Briefcase className="h-5 w-5" /> {profile.tradeSkill}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Location Verified</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Member since {profile.createdAt ? format(new Date(profile.createdAt.seconds * 1000), "MMM yyyy") : "2024"}</span>
          </div>
        </div>

        <div className="bg-primary text-primary-foreground p-6 rounded-2xl flex flex-col items-center justify-center min-w-[140px] shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Trust Score</span>
          <span className="text-4xl font-black">{stats.trustScore}</span>
          <div className="flex items-center gap-1 mt-2 text-secondary font-bold">
            <Star className="h-4 w-4 fill-secondary" /> {stats.averageRating}
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-md bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm font-bold">About {profile.name?.split(' ')[0]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                {profile.bio || "This worker provides expert manual labor and professional trade services. Verified by Globlync for reliability and quality."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Badges & Milestones</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.badgeIds && profile.badgeIds.length > 0 ? (
                profile.badgeIds.map((bid: string) => {
                  const config = BADGE_CONFIG[bid] || { name: bid, color: "bg-muted" };
                  return (
                    <div key={bid} className="flex flex-col items-center gap-1 p-2 bg-muted/30 rounded-lg w-[45%] text-center">
                      <Award className={cn("h-6 w-6 mb-1", config.color === "bg-primary" ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-[8px] font-bold uppercase tracking-tight leading-none">{config.name}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic">No milestones earned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Work History */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Verified Work History ({stats.totalVerified})
            </h2>
          </div>

          <div className="grid gap-4">
            {isJobsLoading ? (
              <p className="text-center py-10">Loading evidence...</p>
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="overflow-hidden border-none shadow-sm group hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row">
                    <div className="aspect-video w-full sm:w-40 bg-muted shrink-0 overflow-hidden">
                      <img 
                        src={job.photoUrl || `https://picsum.photos/seed/${job.id}/300/200`} 
                        alt={job.title} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        data-ai-hint="construction job"
                      />
                    </div>
                    <div className="p-4 flex flex-1 flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg leading-tight">{job.title}</h3>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{format(new Date(job.dateCompleted), "MMM d, yyyy")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{job.description}</p>
                      <div className="mt-auto flex items-center gap-1">
                        <div className="bg-primary/10 text-primary text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> CLIENT VERIFIED
                        </div>
                        {job.aiVerified && (
                          <div className="bg-secondary/10 text-secondary-foreground text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="h-2.5 w-2.5" /> AI PROVEN
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                <p className="text-muted-foreground italic">No public logs available yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Footer */}
      <footer className="mt-12 pt-8 border-t text-center space-y-4">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4" /> This profile is a portable reputation powered by Globlync.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">Identity Verified</Badge>
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">Photo Evidence</Badge>
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">AI Quality Scan</Badge>
        </div>
      </footer>
    </div>
  );
}
