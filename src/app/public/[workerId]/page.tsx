
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Briefcase, 
  User as UserIcon,
  MessageSquare,
  Award,
  TrendingUp,
  MapPin,
  Calendar,
  Lock,
  Loader2,
  Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const db = useFirestore();
  const router = useRouter();

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
    return query(jobsRef, where("isVerified", "==", true), orderBy("updatedAt", "desc"));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Accessing Evidence Logs...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
        <div className="bg-destructive/10 p-6 rounded-[2.5rem] mb-2">
          <Users className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">Professional Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">This professional profile may have been removed or the ID is incorrect.</p>
        <Button onClick={() => router.push("/search")} className="rounded-full mt-4">Return to Directory</Button>
      </div>
    );
  }

  const isPro = profile.activeBenefits?.some((b: any) => new Date(b.expiresAt) > new Date()) || profile.isPro;

  return (
    <div className="flex flex-col gap-10 py-6 max-w-5xl mx-auto px-4 overflow-x-hidden">
      {/* Hero Profile Header */}
      <header className="relative w-full rounded-[3rem] bg-muted/30 p-8 md:p-12 overflow-hidden border-2 border-white shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck className="h-64 w-64" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <Avatar className="h-40 w-40 border-8 border-white shadow-2xl">
              <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
              <AvatarFallback className="text-4xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {isPro && (
              <div className="absolute -top-2 -right-2 bg-secondary p-2 rounded-full border-4 border-white shadow-xl animate-pulse">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter text-foreground">{profile.name}</h1>
                <Badge className="bg-primary/10 text-primary font-black border-none px-4 rounded-full uppercase text-[10px]">
                  @{profile.username}
                </Badge>
              </div>
              <p className="text-lg font-bold text-primary uppercase tracking-widest">{profile.tradeSkill || "Skilled Professional"}</p>
            </div>

            <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
              {profile.bio || `Evidence-based professional building a verifiable reputation in ${profile.tradeSkill || 'their craft'}. View verified logs below.`}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xl font-black">{profile.trustScore || 0}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase">Trust Score</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xl font-black">{jobs?.length || 0}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase">Verified Jobs</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-fit flex flex-col gap-3">
            <Button size="lg" className="w-full md:w-48 rounded-full h-14 font-black shadow-xl opacity-50 cursor-not-allowed" disabled>
              <MessageSquare className="mr-2 h-5 w-5" /> Secure Chat
            </Button>
            <Button variant="outline" size="lg" className="w-full md:w-48 rounded-full h-14 font-black border-2" asChild>
              <a href={`mailto:${profile.contactEmail || ''}`} target="_blank">
                Direct Inquiry
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-10 md:grid-cols-3">
        <aside className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-muted/30 rounded-[2.5rem] p-8">
            <h3 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Verified Achievement
            </h3>
            <div className="grid gap-4">
              {profile.badgeIds?.map((badge: string) => (
                <div key={badge} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border-2 border-primary/5">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase leading-tight">{badge.replace('-', ' ')}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Community Verified</p>
                  </div>
                </div>
              )) || (
                <p className="text-[10px] font-black text-muted-foreground uppercase text-center py-4 border-2 border-dashed rounded-2xl">Building Badges...</p>
              )}
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-primary text-primary-foreground rounded-[2.5rem] p-8">
            <div className="space-y-4">
              <div className="bg-white/20 p-3 rounded-2xl w-fit">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black leading-tight">National Availability</h3>
              <p className="text-xs font-medium opacity-80 leading-relaxed">
                This professional is verified to operate within the Malawian National Professional Directory.
              </p>
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] font-black uppercase">
                  <span>Registered Since</span>
                  <span>{profile.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString() : 'Active'}</span>
                </div>
              </div>
            </div>
          </Card>
        </aside>

        <section className="md:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              Verified Evidence Timeline
              <Badge variant="secondary" className="font-black bg-green-500/10 text-green-600 border-none">LIVE PROOF</Badge>
            </h2>
          </div>

          <div className="space-y-6">
            {isJobsLoading ? (
              [1, 2].map(i => <div key={i} className="h-48 w-full animate-pulse bg-muted rounded-[2.5rem]" />)
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-[2.5rem] overflow-hidden bg-white border-2 border-transparent hover:border-primary/5">
                  <div className="p-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-2xl font-black text-foreground">{job.title}</h4>
                          <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Verified {job.updatedAt ? formatDistanceToNow(new Date(job.updatedAt.seconds * 1000), { addSuffix: true }) : 'Recently'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-6">
                      {job.description}
                    </p>

                    {job.photoUrl && (
                      <div className="rounded-3xl overflow-hidden border-4 border-muted/20 aspect-video mb-6 relative group">
                        <img src={job.photoUrl} alt="Work proof" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                        <div className="absolute bottom-4 left-4 bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-xl">
                          <Lock className="h-3 w-3" /> Integrity Protected
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-dashed">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Job log verified by Globlync AI</span>
                      </div>
                      <Badge className="bg-secondary text-secondary-foreground font-black uppercase text-[9px] px-3">Official Record</Badge>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-4 border-dashed flex flex-col items-center gap-4">
                <Briefcase className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No verified jobs logged yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="mt-12 text-center py-10 border-t border-dashed">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Verified Malawian Identity • Globlync Professional Network</p>
          <Button variant="ghost" size="sm" asChild className="text-[9px] font-black uppercase">
            <Link href="/search">Return to National Registry</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
