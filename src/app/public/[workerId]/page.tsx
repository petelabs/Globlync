
"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  Briefcase, 
  MapPin, 
  MessageSquare, 
  ArrowLeft,
  Loader2,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Award
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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
    return query(collection(db, "workerProfiles", workerId, "jobs"), orderBy("createdAt", "desc"));
  }, [db, workerId]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsRef);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">This professional profile may have been removed or the ID is incorrect.</p>
        <Button onClick={() => router.push("/search")} variant="outline" className="rounded-full mt-4 border-2">Return to Directory</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full h-12 w-12" asChild>
          <Link href="/search"><ArrowLeft className="h-6 w-6" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Professional Profile
            {worker.isPro && <Award className="h-5 w-5 text-secondary fill-secondary" />}
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">National Reputation Registry</p>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden text-center bg-white border-2 border-primary/5">
            <div className="h-24 bg-primary/5 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
            </div>
            <CardContent className="px-6 pb-8 -mt-12 relative z-10 space-y-4">
              <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-2xl">
                <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-3xl font-black">{worker.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">{worker.name}</h2>
                <p className="text-primary font-black text-xs uppercase tracking-tighter">@{worker.username}</p>
              </div>
              <Badge variant={worker.isAvailable ? "default" : "secondary"} className="rounded-full font-black px-4 py-1">
                {worker.isAvailable ? "Available for Hire" : "Currently Busy"}
              </Badge>
              <div className="pt-4 grid grid-cols-2 gap-3">
                <div className="bg-muted/30 p-3 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Trust Score</p>
                  <p className="text-xl font-black text-primary">{worker.trustScore || 0}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Views</p>
                  <p className="text-xl font-black text-primary">{worker.profileViews || 0}</p>
                </div>
              </div>
              <Button className="w-full h-14 rounded-full font-black shadow-lg" asChild>
                <Link href="/messages"><MessageSquare className="mr-2 h-5 w-5" /> Secure Message</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] p-6 bg-muted/30">
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 opacity-60">Professional Identity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm"><Briefcase className="h-4 w-4 text-primary" /></div>
                <div><p className="text-[9px] font-black uppercase opacity-40">Main Skill</p><p className="text-sm font-bold">{worker.tradeSkill || "General Expert"}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm"><MapPin className="h-4 w-4 text-primary" /></div>
                <div><p className="text-[9px] font-black uppercase opacity-40">Service Area</p><p className="text-sm font-bold">Malawi (National)</p></div>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-xl font-black tracking-tight">Professional Bio</h3>
            <Card className="border-none shadow-sm rounded-[2rem] p-8 bg-white">
              <p className="text-muted-foreground leading-relaxed font-medium">
                {worker.bio || `${worker.name} is a verified professional on Globlync specializing in ${worker.tradeSkill || 'their field'}. They have maintained a high level of integrity and skill evidence.`}
              </p>
            </Card>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Evidence Timeline
              </h3>
              <Badge variant="outline" className="font-black uppercase text-[10px] border-2 border-primary/10">
                {jobs?.length || 0} Verified Logs
              </Badge>
            </div>

            <div className="space-y-4">
              {isJobsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary/20" /></div>
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <Card key={job.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-md transition-all border-2 border-transparent hover:border-primary/5">
                    <CardContent className="p-6 flex gap-6">
                      {job.photoUrl ? (
                        <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md">
                          <img src={job.photoUrl} alt="Work evidence" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center shrink-0 border-2 border-white shadow-inner">
                          <Briefcase className="h-8 w-8 opacity-10" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-black text-lg truncate group-hover:text-primary transition-colors">{job.title}</h4>
                          <span className="text-[10px] font-black uppercase text-muted-foreground shrink-0 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> {job.createdAt ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true }) : "recently"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium line-clamp-2 mt-1 leading-relaxed">{job.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase rounded-lg">Verified Evidence</Badge>
                          {job.aiVerified && <div className="flex items-center gap-1 text-[9px] font-black text-secondary uppercase"><Sparkles className="h-3 w-3" /> AI Protected</div>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 bg-muted/20 rounded-[2.5rem] border-4 border-dashed border-muted">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No evidence logs found</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
