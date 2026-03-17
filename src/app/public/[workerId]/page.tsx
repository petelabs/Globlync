
"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Loader2, 
  MapPin, 
  Briefcase, 
  Clock, 
  MessageSquare,
  Award,
  Users,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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
    return query(jobsRef, orderBy("updatedAt", "desc"), limit(10));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Professional Evidence...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
        <div className="bg-destructive/10 p-6 rounded-[2.5rem] mb-2">
          <Users className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">Professional Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">This professional profile may have been removed or the ID is incorrect.</p>
        <Button variant="outline" className="rounded-full mt-4" asChild><Link href="/search">Return to Directory</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto px-4 pb-32">
      {/* Hero Profile Header */}
      <section className="flex flex-col md:flex-row items-center gap-8 md:items-start text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative">
          <Avatar className="h-40 w-40 border-4 border-primary shadow-2xl">
            <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black">{worker.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {worker.isPro && (
            <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground p-2 rounded-full shadow-xl animate-pulse">
              <Star className="h-6 w-6 fill-current" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{worker.name}</h1>
            <p className="text-primary font-black uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2">
              @{worker.username} {worker.isPro && <Badge className="bg-secondary text-secondary-foreground font-black text-[8px] uppercase">Verified VIP</Badge>}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl text-xs font-bold">
              <Briefcase className="h-4 w-4 text-primary" />
              {worker.tradeSkill || "General Pro"}
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-xl text-xs font-bold">
              <MapPin className="h-4 w-4 text-primary" />
              Malawi (Verified)
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl font-medium italic">
            "{worker.bio || `Professional expert in ${worker.tradeSkill || 'their craft'}. Building an evidence-based reputation on Globlync.`}"
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="rounded-full px-8 font-black shadow-lg" asChild>
              <Link href={`/messages/${workerId}`}>
                <MessageSquare className="mr-2 h-5 w-5" /> Secure Message
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 font-black border-2" onClick={() => {
              if (navigator.share) {
                navigator.share({ title: worker.name, url: window.location.href });
              }
            }}>
              Share Reputation
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none bg-primary/5 p-6 rounded-3xl text-center">
          <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-3 text-primary"><TrendingUp className="h-6 w-6" /></div>
          <p className="text-[10px] font-black uppercase text-muted-foreground">Trust Score</p>
          <p className="text-3xl font-black text-primary">{worker.trustScore || 0}</p>
        </Card>
        <Card className="border-none bg-primary/5 p-6 rounded-3xl text-center">
          <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-3 text-primary"><CheckCircle2 className="h-6 w-6" /></div>
          <p className="text-[10px] font-black uppercase text-muted-foreground">Jobs Logged</p>
          <p className="text-3xl font-black text-primary">{jobs?.filter(j => j.isVerified).length || 0}</p>
        </Card>
        <Card className="border-none bg-secondary/10 p-6 rounded-3xl text-center">
          <div className="p-3 bg-secondary/10 rounded-2xl w-fit mx-auto mb-3 text-secondary"><Star className="h-6 w-6 fill-current" /></div>
          <p className="text-[10px] font-black uppercase text-muted-foreground">Top Rank</p>
          <p className="text-3xl font-black text-secondary">#{(worker.trustScore || 0) > 50 ? '5' : '50+'}</p>
        </Card>
        <Card className="border-none bg-primary/5 p-6 rounded-3xl text-center">
          <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-3 text-primary"><Clock className="h-6 w-6" /></div>
          <p className="text-[10px] font-black uppercase text-muted-foreground">Member Since</p>
          <p className="text-sm font-black mt-2 uppercase">{worker.createdAt?.toDate ? formatDistanceToNow(worker.createdAt.toDate()) : 'Recent'}</p>
        </Card>
      </div>

      {/* Reputation & Evidence Section */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" />
              Verified Evidence Timeline
            </h2>
            <Badge variant="outline" className="font-bold border-primary/20 text-primary">Live Logs</Badge>
          </div>

          <div className="space-y-4">
            {isJobsLoading ? (
              [1, 2].map(i => <Card key={i} className="h-40 animate-pulse bg-muted/20 border-none rounded-3xl" />)
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl transition-all border-l-8 border-l-transparent hover:border-l-primary bg-white">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mt-1">
                          <Clock className="h-3 w-3" />
                          Logged {job.updatedAt?.toDate ? formatDistanceToNow(job.updatedAt.toDate(), { addSuffix: true }) : "recently"}
                        </p>
                      </div>
                      {job.isVerified ? (
                        <Badge className="bg-green-500 text-white font-black text-[8px] uppercase tracking-widest px-3 py-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Proof
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[8px] font-black uppercase">Pending Review</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-4">
                      {job.description}
                    </p>
                    {job.photoUrl && (
                      <div className="rounded-2xl overflow-hidden border-4 border-muted/30 aspect-video relative group/photo">
                        <img src={job.photoUrl} alt="Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-white animate-pulse" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-4 border-dashed flex flex-col items-center gap-4">
                <Briefcase className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No evidence logs found yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden sticky top-24">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                <Award className="h-5 w-5" />
                Verified Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {worker.badgeIds && worker.badgeIds.length > 0 ? (
                <div className="grid gap-3">
                  {worker.badgeIds.map((bid: string) => (
                    <div key={bid} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                      <div className="bg-secondary p-2 rounded-xl text-secondary-foreground shadow-lg">
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">{bid.replace(/-/g, ' ')}</p>
                        <p className="text-[9px] opacity-70">Verified Professionalism</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-black/10 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase opacity-50">Earning first badges...</p>
                </div>
              )}
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] font-medium leading-relaxed opacity-80 italic">
                  Globlync verification is powered by AI and community review to ensure total professional transparency.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
