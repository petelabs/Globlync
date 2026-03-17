
"use client";

import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection, useUser } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  Clock, 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  ArrowLeft,
  Loader2,
  Users,
  Camera
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const { user: currentUser } = useUser();
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

  const jobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Fetching Reputation Data...</p>
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
        <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed font-medium">This professional profile may have been removed or the ID is incorrect.</p>
        <Button onClick={() => router.back()} variant="outline" className="rounded-full mt-4 border-2">Return to Directory</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 pb-20 overflow-x-hidden">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            Professional Profile
            {worker.isPro && <div className="bg-secondary p-1 rounded-full"><Star className="h-2 w-2 text-secondary-foreground fill-current" /></div>}
          </h1>
        </div>
      </header>

      {/* Hero Profile Card */}
      <Card className="border-none shadow-2xl overflow-hidden rounded-[3rem] bg-white relative">
        <div className="h-32 bg-primary/10 w-full relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/seed/bg/800/400')] bg-cover bg-center" />
        </div>
        <CardContent className="p-8 pt-0 text-center md:text-left">
          <div className="flex flex-col md:row items-center md:items-end gap-6 -mt-16 mb-6">
            <Avatar className="h-32 w-32 border-8 border-white shadow-2xl">
              <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
              <AvatarFallback className="text-2xl font-black">{worker.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1 text-center md:text-left pb-2">
              <h2 className="text-3xl font-black tracking-tighter leading-none">{worker.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold text-sm">
                <span className="uppercase tracking-widest text-[10px]">@{worker.username}</span>
                <div className="h-1 w-1 rounded-full bg-primary/30" />
                <span className="text-[10px] uppercase">{worker.tradeSkill || "General Pro"}</span>
              </div>
            </div>
            <div className="flex gap-3 pb-2">
              <Button className={cn("rounded-full font-black px-8 h-12 shadow-lg", !currentUser && "opacity-50 cursor-not-allowed")} disabled={!currentUser}>
                <MessageSquare className="mr-2 h-4 w-4" /> Secure Message
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-dashed border-muted">
            <div className="space-y-1 text-center">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Trust Score</p>
              <div className="flex items-center justify-center gap-1.5 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-xl font-black">{worker.trustScore || 0}</p>
              </div>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Verified Jobs</p>
              <div className="flex items-center justify-center gap-1.5 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-xl font-black">{jobs?.filter(j => j.isVerified).length || 0}</p>
              </div>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Invites</p>
              <div className="flex items-center justify-center gap-1.5 text-primary">
                <TrendingUp className="h-4 w-4" />
                <p className="text-xl font-black">{worker.referralCount || 0}</p>
              </div>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Status</p>
              <Badge variant={worker.isAvailable ? "default" : "secondary"} className="h-6 font-black uppercase text-[8px]">
                {worker.isAvailable ? "Available" : "Busy"}
              </Badge>
            </div>
          </div>

          <div className="py-8 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5" /> Professional Story
            </h3>
            <p className="text-muted-foreground font-medium leading-relaxed italic">
              "{worker.bio || `Passionate ${worker.tradeSkill || 'professional'} building a verifiable reputation in Malawi.`}"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Timeline */}
      <section className="space-y-6 mt-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            Verified Evidence Timeline
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 ml-2 font-black">
              {jobs?.filter(j => j.isVerified).length || 0} LOGS
            </Badge>
          </h3>
        </div>

        <div className="grid gap-4 relative pl-4 md:pl-0">
          <div className="absolute left-0 md:left-1/2 top-4 bottom-4 w-0.5 bg-muted-foreground/10 -translate-x-1/2" />
          
          {isJobsLoading ? (
            [1, 2].map(i => <div key={i} className="h-32 w-full bg-muted/20 animate-pulse rounded-3xl" />)
          ) : jobs && jobs.filter(j => j.isVerified).length > 0 ? (
            jobs.filter(j => j.isVerified).map((job, idx) => (
              <div key={job.id} className={cn(
                "relative flex flex-col md:flex-row gap-8 items-start md:items-center w-full",
                idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              )}>
                <div className="absolute left-[-1.2rem] md:left-1/2 top-2 h-4 w-4 rounded-full bg-primary border-4 border-white shadow-sm z-10 -translate-x-1/2" />
                
                <div className="w-full md:w-[calc(50%-2rem)]">
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-[2rem] overflow-hidden group">
                    <CardHeader className="bg-muted/30 p-6 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-black text-primary leading-tight">{job.title}</CardTitle>
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase mt-1">
                        <Clock className="h-3 w-3" />
                        {job.createdAt?.seconds ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true }) : 'Recently'}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
                      {job.photoUrl && (
                        <div className="mt-4 rounded-2xl overflow-hidden aspect-video border-2 border-white shadow-sm relative group">
                          <img src={job.photoUrl} alt="Job Proof" className="object-cover w-full h-full transition-transform group-hover:scale-110 duration-700" />
                          {job.aiVerified && (
                            <div className="absolute top-2 left-2 bg-primary/90 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                              <Sparkles className="h-2.5 w-2.5" /> AI Proven
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div className="hidden md:block w-[calc(50%-2rem)]" />
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted/30 w-full">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No verified jobs logged yet</p>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center py-10 opacity-40">
        <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest">
          <ShieldCheck className="h-3 w-3" /> Verified by Globlync Global Registry
        </div>
      </footer>
    </div>
  );
}
