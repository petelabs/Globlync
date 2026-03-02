"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Award, 
  Calendar as CalendarIcon,
  Loader2,
  ExternalLink,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    return query(jobsRef, orderBy("dateCompleted", "desc"), limit(10));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const stats = useMemo(() => {
    if (!ratings) return { avg: "0.0", count: 0 };
    const count = ratings.length;
    const avg = count > 0 
      ? (ratings.reduce((acc, r) => acc + (r.score || 0), 0) / count).toFixed(1)
      : "0.0";
    return { avg, count };
  }, [ratings]);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground mt-2">The worker profile you are looking for does not exist or has been moved.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-6">
      {/* Header Profile Section */}
      <section className="relative">
        <div className="h-32 w-full bg-primary rounded-t-3xl shadow-inner" />
        <div className="px-6 -mt-16 flex flex-col md:flex-row md:items-end gap-4">
          <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
            <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
            <AvatarFallback className="text-2xl">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <ShieldCheck className="h-6 w-6 text-primary fill-primary/10" />
            </div>
            <p className="text-primary font-semibold text-lg">{profile.tradeSkill}</p>
          </div>
          <div className="flex gap-2 pb-2">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Trust Score</p>
              <p className="text-xl font-black text-primary">{profile.trustScore || 0}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          {/* Bio Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              About Professional
            </h2>
            <Card className="border-none shadow-sm bg-muted/20">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed italic">
                  "{profile.bio || `I am a skilled ${profile.tradeSkill} committed to providing high-quality service and reliable results for my clients.`}"
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Verified Jobs Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Verified Work History
            </h2>
            <div className="grid gap-4">
              {isJobsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted" />
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <Card key={job.id} className="border-none shadow-sm overflow-hidden hover:bg-muted/10 transition-colors">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="aspect-video w-full sm:w-40 bg-muted shrink-0">
                        <img 
                          src={job.photoUrl || `https://picsum.photos/seed/${job.id}/400/300`} 
                          alt={job.title} 
                          className="h-full w-full object-cover" 
                          data-ai-hint="construction work"
                        />
                      </div>
                      <div className="p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{job.title}</h3>
                            {job.isVerified && <Badge variant="secondary" className="text-[8px] h-4">Verified</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1 uppercase font-bold tracking-tighter">
                            <CalendarIcon className="h-3 w-3" /> {format(new Date(job.dateCompleted), "MMM yyyy")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed">
                  <p className="text-sm text-muted-foreground">No verified jobs logged yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Rating Summary */}
          <section>
            <Card className="border-none shadow-md bg-secondary text-secondary-foreground">
              <CardContent className="p-6 text-center">
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Client Rating</p>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-5xl font-black">{stats.avg}</span>
                  <Star className="h-8 w-8 fill-current" />
                </div>
                <p className="text-xs font-medium opacity-70">Based on {stats.count} reviews</p>
              </CardContent>
            </Card>
          </section>

          {/* Badges Section */}
          <section>
            <h2 className="text-lg font-bold mb-4">Achievements</h2>
            <div className="grid grid-cols-2 gap-3">
              {profile.badgeIds && profile.badgeIds.length > 0 ? (
                profile.badgeIds.map((id: string) => {
                  const b = MILESTONE_BADGES[id];
                  if (!b) return null;
                  const Icon = b.icon;
                  return (
                    <div key={id} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border shadow-sm text-center">
                      <Icon className={cn("h-6 w-6", b.color)} />
                      <span className="text-[8px] font-bold uppercase leading-tight">{b.name}</span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-6 bg-muted/20 rounded-xl border border-dashed">
                  <p className="text-[10px] text-muted-foreground">Building reputation...</p>
                </div>
              )}
            </div>
          </section>

          {/* Ad Slot: Monetag Sidebar Placeholder */}
          <section>
            <Card className="border-dashed border-2 bg-accent/30 overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <span className="text-[8px] font-bold uppercase text-muted-foreground">Sponsored Offers</span>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex flex-col gap-3">
                <div id="monetag-ad-slot-sidebar" className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center border">
                  <div className="text-center p-4">
                    <p className="text-[10px] text-muted-foreground italic">Ads support skilled pros.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-[10px] h-7 rounded-full">
                  Partner Deals <ExternalLink className="ml-1 h-2 w-2" />
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Footer Ad Slot */}
      <section className="mt-8">
        <div id="monetag-ad-slot-footer" className="w-full h-24 bg-muted/20 rounded-2xl border border-dashed flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Native Promotion Space</p>
        </div>
      </section>
    </div>
  );
}
