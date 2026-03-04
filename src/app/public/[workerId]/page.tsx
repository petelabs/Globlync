
"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  Loader2,
  Award,
  MessageSquare,
  Share2,
  Sparkles,
  Quote
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const MILESTONE_BADGES: Record<string, { name: string; icon: any; color: string }> = {
  'first-job': { name: "First Verified Job", icon: Award, color: "text-blue-500" },
  'reliable-worker': { name: "Reliable Pro", icon: Award, color: "text-primary" },
  'perfect-streak': { name: "Customer Favorite", icon: Award, color: "text-secondary" },
  'growth-champion': { name: "Growth Champion", icon: Award, color: "text-pink-500" },
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

  const recentJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(10));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs } = useCollection(recentJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const stats = useMemo(() => {
    if (!profile) return { avgRating: 0, verifiedCount: 0 };
    const avg = ratings?.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 5.0;
    const verified = jobs?.filter(j => j.isVerified).length || 0;
    return {
      avgRating: avg.toFixed(1),
      verifiedCount: verified
    };
  }, [profile, jobs, ratings]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name} on Globlync`,
          text: `Check out ${profile?.name}'s verified professional reputation!`,
          url: window.location.href,
        });
      } catch (e) {}
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <Button variant="outline" asChild><a href="/">Go Home</a></Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero Header */}
      <section className="relative rounded-[2.5rem] bg-primary text-primary-foreground p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="h-64 w-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <Avatar className="h-40 w-40 border-8 border-white/20 shadow-2xl">
              <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/300/300`} />
              <AvatarFallback className="text-4xl">{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {profile.trustScore > 50 && (
              <div className="absolute -bottom-2 -right-2 bg-secondary p-3 rounded-full shadow-lg">
                <ShieldCheck className="h-8 w-8 text-secondary-foreground" />
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left space-y-3 flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight">{profile.name}</h1>
              <Badge variant={profile.isAvailable ? "secondary" : "outline"} className="w-fit mx-auto md:mx-0 bg-white/20 text-white border-white/30">
                {profile.isAvailable ? "Available" : "Busy"}
              </Badge>
            </div>
            <p className="text-xl font-bold text-secondary flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest text-sm">
              <Briefcase className="h-5 w-5" />
              {profile.tradeSkill || "Skilled Professional"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Star className="h-5 w-5 fill-secondary text-secondary" />
                <span>{stats.avgRating} Rating</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="h-5 w-5 text-secondary" />
                <span>{stats.verifiedCount} Jobs Done</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-5 w-5 text-secondary" />
                <span>{profile.trustScore} Trust Score</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button size="lg" className="rounded-full bg-secondary text-secondary-foreground font-black px-8 h-14 text-lg hover:scale-105" asChild>
              <a href={`https://wa.me/0987066051?text=${encodeURIComponent(`Hi ${profile.name}, I saw your verified profile on Globlync and I'd like to hire you.`)}`} target="_blank">
                <MessageSquare className="mr-2 h-5 w-5" /> Hire on WhatsApp
              </a>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10" onClick={handleShare}>
              <Share2 className="mr-2 h-5 w-5" /> Share Profile
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Left Column: About & Areas */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Professional Bio</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground italic">
              "{profile.bio || "No professional summary provided yet."}"
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.serviceAreas && profile.serviceAreas.length > 0 ? (
                profile.serviceAreas.map(area => (
                  <Badge key={area} variant="secondary" className="rounded-full bg-primary/5 text-primary border-primary/10">
                    {area}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Contact for location details.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Reputation Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {profile.badgeIds && profile.badgeIds.length > 0 ? (
                profile.badgeIds.map(badgeId => {
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
                <p className="text-xs text-muted-foreground">Building reputation points...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Evidence Log */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight">Evidence Log</h2>
            <Badge variant="outline" className="border-primary/20 text-primary">
              <Sparkles className="h-3 w-3 mr-1" /> AI Verified Proof
            </Badge>
          </div>

          <div className="grid gap-4">
            {jobs && jobs.filter(j => j.isVerified).length > 0 ? (
              jobs.filter(j => j.isVerified).map((job) => (
                <Card key={job.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0">
                      <img 
                        src={job.photoUrl || `https://picsum.photos/seed/${job.id}/400/300`} 
                        alt={job.title} 
                        className="h-full w-full object-cover" 
                      />
                      {job.aiVerified && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <CheckCircle2 className="h-3 w-3" /> VERIFIED
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{job.title}</h3>
                        <div className="flex text-secondary">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 text-xs font-bold text-foreground">5.0</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                      <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Client Confirmed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground">Verified job logs will appear here soon.</p>
              </div>
            )}
          </div>

          {ratings && ratings.length > 0 && (
            <div className="space-y-4 pt-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Quote className="h-6 w-6 text-primary" />
                Client Feedback
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {ratings.map((r) => (
                  <Card key={r.id} className="border-none shadow-sm bg-accent/20">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex text-secondary">
                        {[...Array(r.score)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs italic text-muted-foreground leading-relaxed">
                        "{r.comment || "Great professional, highly recommended!"}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
