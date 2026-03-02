
"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, MapPin, CheckCircle2, Award, Briefcase, ExternalLink, QrCode } from "lucide-react";
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

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);

  const verifiedJobs = jobs?.filter(j => j.isVerified) || [];
  
  if (isProfileLoading) return <div className="flex justify-center py-20">Loading profile...</div>;
  if (!profile) return <div className="text-center py-20">Worker profile not found.</div>;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-8">
      {/* Header / Hero */}
      <section className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left bg-primary p-8 rounded-3xl text-primary-foreground shadow-xl">
        <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl">
          <AvatarImage src={profile.profilePictureUrl} />
          <AvatarFallback className="text-4xl">{profile.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <Badge variant="secondary" className="w-fit mx-auto md:mx-0 bg-white/20 text-white border-none">
              <ShieldCheck className="mr-1 h-3 w-3" /> Verified Pro
            </Badge>
          </div>
          <p className="text-xl opacity-90 font-medium">{profile.tradeSkill}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm opacity-80 pt-2">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Location Verified</span>
            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {verifiedJobs.length} Verified Jobs</span>
            <span className="flex items-center gap-1 font-bold text-secondary"><Star className="h-4 w-4 fill-secondary" /> 5.0 Rating</span>
          </div>
        </div>
        <div className="bg-white/10 p-6 rounded-2xl text-center min-w-[140px]">
          <div className="text-4xl font-black">{profile.trustScore}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Trust Score</div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold mb-4">About the Professional</h2>
            <Card className="border-none shadow-sm bg-muted/30">
              <CardContent className="pt-6">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {profile.bio || "This professional is building their digital reputation through verified job logs."}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Verified History */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Verified Work History</h2>
            <div className="grid gap-4">
              {isJobsLoading ? (
                <p>Loading history...</p>
              ) : verifiedJobs.length > 0 ? (
                verifiedJobs.map((job) => (
                  <Card key={job.id} className="border-none shadow-sm overflow-hidden group">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="aspect-video w-full sm:w-40 bg-muted shrink-0 overflow-hidden">
                        <img 
                          src={job.photoUrl || `https://picsum.photos/seed/${job.id}/300/200`} 
                          alt={job.title} 
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-lg">{job.title}</h4>
                          <div className="flex items-center gap-1 text-primary">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase">Verified</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{job.description}</p>
                        <div className="mt-3 text-[10px] text-muted-foreground flex items-center gap-2">
                          {format(new Date(job.dateCompleted), "MMMM yyyy")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 bg-muted/20 rounded-xl border-2 border-dashed">
                  <p className="text-muted-foreground">No verified jobs logged yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <section>
            <h2 className="text-lg font-bold mb-4">Achievements</h2>
            <div className="grid grid-cols-2 gap-2">
              {profile.badgeIds?.length > 0 ? (
                profile.badgeIds.map((b: string) => (
                  <div key={b} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-accent/50 border border-accent text-center">
                    <Award className="h-6 w-6 text-primary" />
                    <span className="text-[10px] font-bold capitalize leading-tight">{b.replace('-', ' ')}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic col-span-2">No milestones earned yet.</p>
              )}
            </div>
          </section>

          {/* AD SLOT - Footer/Sidebar Style for Monetag/A-Ads */}
          <section className="pt-4">
            <Card className="border-dashed border-2 bg-muted/10 overflow-hidden">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sponsored</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div id="ad-slot-monetag" className="aspect-square w-full rounded-lg bg-white flex items-center justify-center text-center p-4 border">
                  <p className="text-[10px] text-muted-foreground">Curated offers for Globlync visitors.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold">Local Pro Offers</h4>
                  <p className="text-[10px] text-muted-foreground">Discounts on tools and hardware.</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
