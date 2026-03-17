
"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  Loader2, 
  Users, 
  Globe,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Lock
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
    return query(jobsRef, orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pulling Reputation Data...</p>
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
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 pb-32">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full" asChild>
          <Link href="/search"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight">Professional Reputation</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">National Directory Verified</p>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-white">
            <div className="h-24 bg-primary/5 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-5"><Globe className="h-48 w-48 -translate-x-1/2 -translate-y-1/2" /></div>
              <Avatar className="h-20 w-20 border-4 border-white shadow-xl relative top-8">
                <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
                <AvatarFallback className="bg-primary/5 font-black text-xl">{worker.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <CardContent className="pt-12 pb-8 text-center px-6">
              <h2 className="text-2xl font-black">{worker.name}</h2>
              <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">@{worker.username}</p>
              <div className="mt-4 flex flex-col gap-2">
                <Badge variant="secondary" className="mx-auto bg-primary/5 text-primary border-none font-black uppercase text-[10px] py-1 px-4">{worker.tradeSkill || 'Professional'}</Badge>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Based in Malawi</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Trust Score</p>
                  <p className="text-2xl font-black text-primary">{worker.trustScore || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Logs Verified</p>
                  <p className="text-2xl font-black text-primary">{jobs?.filter(j => j.isVerified).length || 0}</p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button className="w-full rounded-full h-12 font-black shadow-lg opacity-50 cursor-not-allowed" disabled>
                  <Lock className="mr-2 h-4 w-4" /> Messaging Locked
                </Button>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Direct link coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Star className="h-5 w-5 text-primary fill-primary/20" />
              Professional Narrative
            </h3>
            <Card className="border-none shadow-sm bg-white rounded-[2rem] p-6">
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {worker.bio || `This professional is a verified specialist in ${worker.tradeSkill || 'their field'} within the Malawian national network.`}
              </p>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Verified Evidence Logs
              </h3>
              <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">Public View</Badge>
            </div>

            <div className="grid gap-4">
              {isJobsLoading ? (
                [1, 2].map(i => <Card key={i} className="h-32 animate-pulse bg-muted/20 border-none rounded-2xl" />)
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <Card key={job.id} className="border-none shadow-sm bg-white overflow-hidden group rounded-[1.5rem] border-l-4 border-l-transparent hover:border-l-primary transition-all">
                    <CardContent className="p-6 flex gap-6 items-start">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-lg leading-none">{job.title}</h4>
                            <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                              {job.createdAt?.seconds ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true }) : "Recent"}
                            </p>
                          </div>
                          {job.isVerified ? (
                            <Badge className="bg-green-500 text-white border-none uppercase text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Verified Evidence
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="uppercase text-[8px] font-black px-2 py-0.5 rounded-full">Pending Verification</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2 italic">
                          "{job.description}"
                        </p>
                      </div>
                      {job.photoUrl && (
                        <div className="h-20 w-28 rounded-xl overflow-hidden border-2 border-muted shrink-0 shadow-inner">
                          <img src={job.photoUrl} alt="Evidence" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 bg-muted/10 rounded-[2rem] border-2 border-dashed flex flex-col items-center gap-3">
                  <ShieldCheck className="h-10 w-10 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No logs verified yet</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
