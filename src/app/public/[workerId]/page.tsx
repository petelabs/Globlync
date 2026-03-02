"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Calendar, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  Sparkles,
  Loader2,
  ChevronRight
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
    const verifiedJobs = jobs?.filter(j => j.isVerified) || [];
    const avgRating = ratings?.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 5.0;
    
    return {
      totalVerified: verifiedJobs.length,
      averageRating: avgRating.toFixed(1),
      trustScore: profile?.trustScore || 0,
      tier: (profile?.trustScore || 0) > 100 ? "Platinum" : (profile?.trustScore || 0) > 50 ? "Gold" : "Bronze",
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
        <Button asChild><a href="/">Go Home</a></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto px-4">
      {/* JSON-LD for AI Search Trust */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": profile.name,
            "jobTitle": profile.tradeSkill,
            "description": profile.bio,
            "image": profile.profilePictureUrl,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": stats.averageRating,
              "reviewCount": ratings?.length || 0,
              "bestRating": "5",
              "worstRating": "1"
            }
          })
        }}
      />

      <Card className="border-none shadow-xl overflow-hidden">
        <div className="h-32 bg-primary relative">
          <div className="absolute -bottom-12 left-8">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
              <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardContent className="pt-16 pb-6 px-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                  <ShieldCheck className="h-3 w-3 mr-1" /> VERIFIED PRO
                </Badge>
              </div>
              <p className="text-primary font-bold flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> {profile.tradeSkill}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Area Verified</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-secondary fill-secondary" /> {stats.averageRating} Rating</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border">
              <div className="text-center px-4">
                <p className="text-2xl font-black text-primary">{stats.trustScore}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Trust Score</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center px-4">
                <p className="text-2xl font-black text-secondary">{stats.totalVerified}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Verified Jobs</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Professional Bio</h3>
            <p className="text-muted-foreground leading-relaxed">
              {profile.bio || `Professional ${profile.tradeSkill} with a focus on quality, reliability, and client satisfaction. All work is logged and verified with AI proof.`}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3 mt-4">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Verified Job History</CardTitle>
              <CardDescription>Real work, verified by clients and AI analysis.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {isJobsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" />
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="flex gap-4 p-4 rounded-xl border bg-muted/5">
                    <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      <img src={job.photoUrl || `https://picsum.photos/seed/${job.id}/200/200`} alt={job.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold">{job.title}</h4>
                        {job.aiVerified && (
                          <Badge variant="outline" className="text-[8px] h-4 bg-primary/5 text-primary border-primary/20">
                            <Sparkles className="h-2 w-2 mr-1" /> AI VERIFIED
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{job.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(job.dateCompleted), "MMM yyyy")}</span>
                        <span className="flex items-center gap-1 text-primary"><CheckCircle2 className="h-3 w-3" /> Client Verified</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">No verified jobs logged yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Milestone Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.badgeIds?.length > 0 ? (
                profile.badgeIds.map((bid) => {
                  const b = MILESTONE_BADGES[bid];
                  if (!b) return null;
                  const Icon = b.icon;
                  return (
                    <div key={bid} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/30 border w-[calc(50%-4px)] text-center">
                      <Icon className={cn("h-6 w-6", b.color)} />
                      <span className="text-[8px] font-bold uppercase">{b.name}</span>
                    </div>
                  )
                })
              ) : (
                <p className="text-[10px] text-muted-foreground">Earning milestones...</p>
              )}
            </CardContent>
          </Card>

          {/* Monetag Native Banner for Public Profile */}
          <Card className="border-none bg-accent/10 border-dashed border-2">
            <CardHeader className="p-4 pb-0">
              <span className="text-[9px] font-bold uppercase text-muted-foreground">Recommended Pro Services</span>
            </CardHeader>
            <CardContent className="p-4">
              <div id="container-732a8eb1f93a972b628ecf38814db400" className="w-full min-h-[100px] flex items-center justify-center">
                <p className="text-[10px] text-muted-foreground italic">Loading...</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardContent className="p-6 text-center">
              <ShieldCheck className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <h3 className="font-bold mb-2">Hire with Confidence</h3>
              <p className="text-xs opacity-80 leading-relaxed mb-4">
                Globlync verifies manual work through photo evidence and direct client feedback loops.
              </p>
              <Button variant="secondary" className="w-full rounded-full text-xs font-bold" asChild>
                <a href="/login">Verify My Own Work</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}