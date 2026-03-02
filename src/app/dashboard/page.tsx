
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { 
  PlusCircle, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  QrCode, 
  History, 
  Award,
  ChevronRight,
  Loader2,
  Sparkles,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const MILESTONE_BADGES: Record<string, { name: string; icon: any; color: string }> = {
  'first-job': { name: "First Verified Job", icon: Award, color: "text-blue-500" },
  'reliable-worker': { name: "Reliable Pro", icon: Award, color: "text-primary" },
  'perfect-streak': { name: "Customer Favorite", icon: Award, color: "text-secondary" },
};

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "jobs");
  }, [db, user?.uid]);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "ratings");
  }, [db, user?.uid]);

  const recentJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(5));
  }, [jobsRef]);

  const { data: profile } = useDoc(workerRef);
  const { data: allJobs } = useCollection(jobsRef);
  const { data: recentJobs, isLoading: isJobsLoading } = useCollection(recentJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const stats = useMemo(() => {
    const verifiedJobs = allJobs?.filter(j => j.isVerified) || [];
    const avgRating = ratings?.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 0;
    
    return {
      totalVerified: verifiedJobs.length,
      averageRating: avgRating.toFixed(1),
      trustScore: profile?.trustScore || 0,
      tier: (profile?.trustScore || 0) > 100 ? "Platinum" : (profile?.trustScore || 0) > 50 ? "Gold" : "Bronze",
      badges: profile?.badgeIds || []
    };
  }, [allJobs, ratings, profile]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 py-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.displayName?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Your reputation is growing. {stats.totalVerified} verified jobs logged.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href={`/public/${user.uid}`}>
              <QrCode className="mr-2 h-4 w-4" />
              Public Profile
            </Link>
          </Button>
          <Button size="sm" className="rounded-full shadow-lg" asChild>
            <Link href="/jobs">
              <PlusCircle className="mr-2 h-4 w-4" />
              Log New Job
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Trust Score Card */}
        <Card className="md:col-span-4 bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="h-24 w-24" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Trust Score</CardTitle>
            <CardDescription className="text-primary-foreground/70">Verified Reputation Level</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle className="text-white/20" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle 
                  className="text-secondary" 
                  strokeWidth="8" 
                  strokeDasharray={251.2} 
                  strokeDashoffset={251.2 * (1 - Math.min(stats.trustScore / 250, 1))} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black">{stats.trustScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{stats.tier}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <Star className="h-4 w-4 fill-secondary text-secondary" />
              <span className="text-lg font-bold">{stats.averageRating} Avg Rating</span>
            </div>
          </CardContent>
        </Card>

        {/* Badges/Achievements Card */}
        <Card className="md:col-span-8 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Milestone Achievements</CardTitle>
            <CardDescription>Earned based on verified work and client feedback</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {stats.badges.length > 0 ? (
              stats.badges.map((badgeId) => {
                const badge = MILESTONE_BADGES[badgeId];
                if (!badge) return null;
                const Icon = badge.icon;
                return (
                  <div key={badgeId} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border w-24 text-center">
                    <Icon className={cn("h-8 w-8", badge.color)} />
                    <span className="text-[10px] font-bold leading-tight">{badge.name}</span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-8 bg-muted/10 rounded-xl border border-dashed">
                <p className="text-xs text-muted-foreground">Complete jobs to unlock your first achievement!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ad Space: Professional Slot for Monetag/A-Ads */}
        <Card className="md:col-span-4 border-none bg-accent/30 shadow-sm overflow-hidden border-dashed border-2">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sponsored</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div id="monetag-ad-slot" className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
              <div className="text-center p-4">
                <p className="text-[10px] text-muted-foreground italic">Ads help keep Globlync free for professionals.</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold">Professional Offers</h4>
              <p className="text-xs text-muted-foreground">Exclusive deals for skilled tradespeople.</p>
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs h-8 rounded-full">
              Learn More <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card className="md:col-span-8 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Verified Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs">Full History <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isJobsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-muted" /></div>
            ) : recentJobs && recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-lg border p-4 shadow-sm transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border",
                      job.isVerified ? "text-primary border-primary/20" : "text-muted-foreground"
                    )}>
                      {job.isVerified ? <CheckCircle2 className="h-6 w-6" /> : <History className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{job.title}</h4>
                        {job.aiVerified && (
                          <span className="flex items-center gap-0.5 text-[8px] bg-primary/10 text-primary px-1 rounded-full font-bold">
                            <Sparkles className="h-2 w-2" /> AI
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.isVerified ? "Verified" : "Pending Client Review"} • {format(new Date(job.dateCompleted), "MMM d")}
                      </p>
                    </div>
                  </div>
                  {job.isVerified && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      <span className="text-sm font-bold">5.0</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-muted/20 rounded-xl border-2 border-dashed">
                <p className="text-sm text-muted-foreground">No recent jobs logged. Start by logging a job!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
