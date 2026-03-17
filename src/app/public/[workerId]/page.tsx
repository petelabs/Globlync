
"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  MessageSquare, 
  Users, 
  Briefcase, 
  Loader2, 
  ChevronRight, 
  CheckCircle2, 
  Award, 
  Globe,
  Clock,
  Crown,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage() {
  const params = useParams() as { workerId: string };
  const { user } = useUser();
  const db = useFirestore();
  const workerId = params.workerId;

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
    return query(jobsRef, where("isVerified", "==", true), orderBy("updatedAt", "desc"));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: verifiedJobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  const chatId = user && workerId && user.uid !== workerId ? [user.uid, workerId].sort().join("_") : null;

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
        <Button variant="outline" className="rounded-full mt-4 border-2 font-black h-12 px-8" asChild>
          <Link href="/search">Return to Directory</Link>
        </Button>
      </div>
    );
  }

  const isPro = worker.isPro || worker.activeBenefits?.some((b: any) => b.expiresAt && new Date(b.expiresAt) > new Date());

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 pb-32">
      {/* Header Profile Section */}
      <header className="relative">
        <Card className="border-none shadow-2xl overflow-hidden rounded-[3rem] bg-white">
          <div className="h-32 md:h-48 bg-primary/5 relative overflow-hidden">
             <div className="absolute inset-0 opacity-5">
                <Globe className="h-96 w-96 -translate-x-1/2 -translate-y-1/2" />
             </div>
          </div>
          <CardContent className="p-8 md:p-12 -mt-16 md:-mt-24 relative z-10">
            <div className="flex flex-col md:row items-center md:items-end justify-between gap-6">
              <div className="flex flex-col md:row items-center md:items-end gap-6 text-center md:text-left">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-8 border-white shadow-2xl">
                  <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
                  <AvatarFallback className="text-3xl font-black bg-primary/5">{worker.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">{worker.name}</h1>
                    {isPro && <div className="bg-secondary text-secondary-foreground p-1 rounded-full"><Crown className="h-4 w-4" /></div>}
                  </div>
                  <p className="text-primary font-bold uppercase tracking-widest text-sm">@{worker.username}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground font-medium">
                    <Briefcase className="h-4 w-4" />
                    <span>{worker.tradeSkill || "General Professional"}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                {chatId ? (
                  <Button className="flex-1 md:flex-none rounded-full font-black h-14 px-8 shadow-xl hover:scale-105 transition-transform" asChild>
                    <Link href={`/messages/${chatId}`}><MessageSquare className="mr-2 h-5 w-5" /> Secure Link</Link>
                  </Button>
                ) : !user ? (
                  <Button className="flex-1 md:flex-none rounded-full font-black h-14 px-8 shadow-xl hover:scale-105 transition-transform" asChild>
                    <Link href="/login">Join to Message</Link>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary/5 p-4 rounded-3xl text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Trust Score</p>
                <p className="text-2xl font-black text-primary">{worker.trustScore || 0}</p>
              </div>
              <div className="bg-secondary/10 p-4 rounded-3xl text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Verified Logs</p>
                <p className="text-2xl font-black text-secondary">{verifiedJobs?.length || 0}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-3xl text-center col-span-2 md:col-span-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Professional Status</p>
                <div className="flex items-center justify-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${worker.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
                  <p className="text-sm font-black uppercase tracking-tight">{worker.isAvailable ? "Ready for Hire" : "Currently Engaged"}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <h3 className="font-black text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Professional Story
              </h3>
              <p className="text-lg text-foreground/80 leading-relaxed font-medium italic border-l-4 border-primary/20 pl-6 py-2">
                "{worker.bio || `Highly skilled professional in ${worker.tradeSkill || 'their craft'} with a proven track record of excellence within the national directory.`}"
              </p>
            </div>
          </CardContent>
        </Card>
      </header>

      {/* Verified Jobs / Evidence Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Verified Evidence Logs
          </h2>
          <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black px-4 py-1">
            {verifiedJobs?.length || 0} PROOFS
          </Badge>
        </div>

        <div className="grid gap-6">
          {isJobsLoading ? (
            [1, 2].map(i => <Card key={i} className="h-40 animate-pulse bg-muted/20 border-none rounded-[2rem]" />)
          ) : verifiedJobs && verifiedJobs.length > 0 ? (
            verifiedJobs.map((job) => (
              <Card key={job.id} className="border-none shadow-sm hover:shadow-xl transition-all rounded-[2rem] overflow-hidden group border-l-8 border-l-primary/10 hover:border-l-primary bg-white">
                <CardContent className="p-8 flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-500/5 px-2 py-0.5 rounded-full">Independently Verified</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        {job.updatedAt?.seconds ? formatDistanceToNow(new Date(job.updatedAt.seconds * 1000), { addSuffix: true }) : ""}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-medium">{job.description}</p>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                       <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>+5 Trust Earned</span>
                       </div>
                       {job.aiVerified && (
                         <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary">
                            <Globe className="h-3.5 w-3.5" />
                            <span>AI Quality Assured</span>
                         </div>
                       )}
                    </div>
                  </div>
                  {job.photoUrl && (
                    <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shadow-inner border-4 border-white shrink-0 relative group">
                      <img src={job.photoUrl} alt="Evidence" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted flex flex-col items-center gap-4">
              <ShieldCheck className="h-12 w-12 text-muted-foreground/30" />
              <div className="space-y-1">
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No verified logs yet</p>
                <p className="text-[10px] text-muted-foreground/60 max-w-[200px] mx-auto leading-relaxed">This professional is currently building their evidence library.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="text-center py-10 opacity-40">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em]">
            <Globe className="h-3 w-3" /> Globlync Evidence Protocol v2.1
          </div>
          <p className="text-[8px] font-bold">Authenticated Identity • Non-Fungible Reputation</p>
        </div>
      </footer>
    </div>
  );
}
