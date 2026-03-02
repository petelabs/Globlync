
"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Star, ShieldCheck, MapPin, Briefcase, Award, Sparkles, Loader2, Info } from "lucide-react";
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

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, where("isVerified", "==", true), orderBy("dateCompleted", "desc"));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: verifiedJobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);

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
        <p className="text-muted-foreground">The worker profile you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto px-4">
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <Avatar className="h-32 w-32 border-4 border-primary shadow-xl">
          <AvatarImage src={profile.profilePictureUrl} />
          <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <Badge variant="secondary" className="w-fit mx-auto md:mx-0 bg-primary/10 text-primary border-primary/20">
              <ShieldCheck className="mr-1 h-3 w-3" /> Trust Score: {profile.trustScore}
            </Badge>
          </div>
          <p className="text-xl font-semibold text-primary">{profile.tradeSkill}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Location Verified</span>
            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {verifiedJobs?.length || 0} Verified Jobs</span>
          </div>
        </div>
      </section>

      {/* Bio */}
      <Card className="border-none shadow-sm bg-accent/20">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold mb-2">About {profile.name?.split(' ')[0]}</h2>
          <p className="text-muted-foreground leading-relaxed">{profile.bio || "No bio provided."}</p>
        </CardContent>
      </Card>

      {/* Achievements */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-secondary" /> Verified Achievements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {profile.badgeIds && profile.badgeIds.length > 0 ? (
            profile.badgeIds.map((badgeId: string) => {
              const badge = MILESTONE_BADGES[badgeId];
              if (!badge) return null;
              const Icon = badge.icon;
              return (
                <div key={badgeId} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white shadow-sm border text-center transition-transform hover:scale-105">
                  <Icon className={cn("h-8 w-8", badge.color)} />
                  <span className="text-xs font-bold">{badge.name}</span>
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-2xl">Building reputation...</p>
          )}
        </div>
      </section>

      {/* Verified Job History */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" /> Verified Job Log
        </h2>
        <div className="grid gap-4">
          {isJobsLoading ? (
            <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>
          ) : verifiedJobs && verifiedJobs.length > 0 ? (
            verifiedJobs.map((job) => (
              <Card key={job.id} className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {job.photoUrl && (
                      <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0">
                        <img src={job.photoUrl} alt={job.title} className="h-full w-full object-cover" />
                        {job.aiVerified && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                            <Sparkles className="h-2 w-2" /> AI Verified
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{job.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-0.5 text-secondary">
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                            <Star className="h-4 w-4 fill-current" />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Verified {format(new Date(job.dateCompleted), "MMM yyyy")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed">
              <p className="text-muted-foreground">No verified jobs logged yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer Ad Slot: Professional & Non-Scammy */}
      <section className="mt-12 pt-8 border-t">
        <div className="flex flex-col md:flex-row gap-6 items-center bg-muted/30 p-6 rounded-3xl border border-dashed">
          <div className="shrink-0">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground block mb-2 text-center md:text-left">Promotion</span>
            <div className="h-24 w-40 rounded-xl overflow-hidden bg-white shadow-sm">
              <img 
                src="https://picsum.photos/seed/workwear-ad/320/192" 
                alt="Ad" 
                className="h-full w-full object-cover"
                data-ai-hint="construction boots"
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold">Heavy Duty Gear for Professionals</h3>
            <p className="text-sm text-muted-foreground mb-3">Work smarter and safer with Globlync-approved gear. Verified members get special pricing.</p>
            <Button size="sm" variant="secondary" className="rounded-full px-6 text-xs font-bold">Shop Now</Button>
          </div>
        </div>
      </section>

      <footer className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-primary opacity-50 mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-bold tracking-widest uppercase">Globlync Verified</span>
        </div>
        <p className="text-[10px] text-muted-foreground">Reputation powered by evidence-based trust and AI verification.</p>
      </footer>
    </div>
  );
}
