"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Briefcase, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  Globe, 
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Lock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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

  const jobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authenticating Reputation...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
        <div className="bg-destructive/10 p-6 rounded-[2.5rem] mb-4">
          <ShieldCheck className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">Identity Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">This professional ID does not exist in the national registry.</p>
      </div>
    );
  }

  const isPro = profile.isPro || profile.activeBenefits?.some((b: any) => new Date(b.expiresAt) > new Date());

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto px-4 pb-32 overflow-x-hidden">
      {/* HEADER / COVER AREA */}
      <section className="relative">
        <div className="h-48 w-full bg-gradient-to-r from-primary to-accent rounded-[3rem] shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <Globe className="h-96 w-96 rotate-12" />
          </div>
        </div>
        
        <div className="px-8 -mt-20 flex flex-col md:flex-row items-end gap-6 relative z-10">
          <Avatar className="h-40 w-40 border-8 border-background shadow-2xl rounded-[3rem]">
            <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 pb-4 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tighter">{profile.name}</h1>
              {isPro && (
                <Badge className="bg-secondary text-secondary-foreground font-black px-3 py-1 rounded-full uppercase text-[10px] animate-pulse">
                  <Star className="mr-1 h-3 w-3 fill-current" /> Verified Pro
                </Badge>
              )}
            </div>
            <p className="text-xl font-bold text-primary">@{profile.username}</p>
          </div>

          <div className="pb-4 w-full md:w-auto">
            <Button className="w-full rounded-full font-black px-10 h-14 shadow-lg opacity-50 cursor-not-allowed" disabled>
              <Lock className="mr-2 h-4 w-4" /> Messaging Locked
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        {/* STATS & INFO */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-primary/5 p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2.5 rounded-xl shadow-sm"><ShieldCheck className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">National Trust Score</p>
                  <p className="text-2xl font-black">{profile.trustScore || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2.5 rounded-xl shadow-sm"><Briefcase className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Main Trade</p>
                  <p className="text-lg font-black">{profile.tradeSkill || "General Pro"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2.5 rounded-xl shadow-sm"><Users className="h-5 w-5 text-secondary" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Community Verify</p>
                  <p className="text-lg font-black">{profile.referralCount || 0} Endorsements</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-primary/10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">About the Pro</h4>
              <p className="text-sm font-medium leading-relaxed italic">"{profile.bio || `No detailed bio provided yet. Building a digital legacy in Malawi.`}"</p>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-secondary/10 p-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
              <Award className="h-4 w-4" /> Earned Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.badgeIds && profile.badgeIds.length > 0 ? (
                profile.badgeIds.map((bid: string) => (
                  <Badge key={bid} variant="secondary" className="bg-white border-2 border-secondary/20 font-black text-[9px] uppercase py-1.5 px-3">
                    {bid.replace('-', ' ')}
                  </Badge>
                ))
              ) : (
                <p className="text-[10px] font-bold text-muted-foreground italic">Reputation badges will appear here as work is verified.</p>
              )}
            </div>
          </Card>
        </div>

        {/* EVIDENCE TIMELINE */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Verified Evidence Timeline
            </h2>
            <Badge variant="outline" className="font-black text-[9px] uppercase bg-green-500/5 text-green-600 border-green-200">
              Live National Registry
            </Badge>
          </div>

          <div className="space-y-6">
            {isJobsLoading ? (
              [1, 2].map(i => <Card key={i} className="h-48 animate-pulse bg-muted/20 border-none rounded-[2.5rem]" />)
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="border-none shadow-sm rounded-[2.5rem] overflow-hidden group hover:shadow-xl transition-all bg-white border-2 border-transparent hover:border-primary/5">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2">
                      {job.photoUrl && (
                        <div className="h-full min-h-[200px] relative overflow-hidden">
                          <img src={job.photoUrl} alt={job.title} className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          {job.aiVerified && (
                            <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3" /> AI Protected
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-8 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Verified Milestone</span>
                            <span className="text-[9px] font-bold text-muted-foreground">
                              {job.createdAt ? formatDistanceToNow(job.createdAt.toDate(), { addSuffix: true }) : "recently"}
                            </span>
                          </div>
                          <h3 className="text-2xl font-black leading-tight text-foreground">{job.title}</h3>
                          <p className="text-sm text-muted-foreground font-medium line-clamp-3">{job.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-dashed">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Evidence Authenticated</span>
                          </div>
                          <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase">Verified Skill</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed flex flex-col items-center gap-4">
                <Briefcase className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Awaiting First Verified Job Entry</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center py-12 opacity-40">
        <div className="flex flex-col items-center gap-4">
          <Globe className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em]">Globlync Global • Evidence-Based Economy</p>
        </div>
      </footer>
    </div>
  );
}