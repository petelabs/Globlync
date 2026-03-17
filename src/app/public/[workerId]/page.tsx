
"use client";

import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  ArrowLeft,
  Loader2,
  Sparkles,
  Award,
  CheckCircle2,
  Globe
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const { user } = useUser();
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

  if (isWorkerLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Opening Professional Dossier...</p>
    </div>
  );

  if (!worker) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
      <div className="bg-destructive/10 p-6 rounded-[2.5rem] mb-2">
        <Users className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-2xl font-black tracking-tight">Professional Not Found</h1>
      <p className="text-muted-foreground text-sm max-w-xs mx-auto">This professional profile may have been removed or the ID is incorrect.</p>
      <Button onClick={() => router.push("/search")} className="rounded-full mt-4 bg-primary px-8">Return to Directory</Button>
    </div>
  );

  const chatId = user ? [user.uid, worker.id].sort().join("_") : null;

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 pb-32">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="rounded-full">
          <Link href="/search"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory</Link>
        </Button>
        <Badge variant="outline" className="font-black uppercase text-[9px] tracking-widest bg-primary/5 text-primary border-primary/10">Verified Identity</Badge>
      </header>

      <section className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden text-center pt-10">
            <CardContent className="flex flex-col items-center gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                  <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
                  <AvatarFallback className="text-3xl font-black bg-primary/5">{worker.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                {worker.isPro && (
                  <div className="absolute -top-2 -right-2 bg-secondary p-2 rounded-full border-4 border-white shadow-xl animate-pulse">
                    <Award className="h-5 w-5 text-white fill-white" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight leading-none">{worker.name}</h2>
                <p className="text-primary font-black uppercase text-xs tracking-widest">@{worker.username}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase px-3">{worker.tradeSkill || "General Pro"}</Badge>
                {worker.isAvailable && <Badge className="bg-green-500 text-white font-black text-[9px] uppercase px-3 shadow-sm shadow-green-500/20">Active Now</Badge>}
              </div>
              
              <div className="w-full pt-4 border-t grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Trust Score</p>
                  <p className="text-xl font-black text-primary">{worker.trustScore || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Verifications</p>
                  <p className="text-xl font-black text-primary">{jobs?.filter(j => j.isVerified).length || 0}</p>
                </div>
              </div>
            </CardContent>
            <div className="p-6 bg-muted/30 border-t">
              {chatId ? (
                <Button className="w-full rounded-full h-14 font-black shadow-lg" asChild>
                  <Link href={`/messages/${chatId}`}>
                    <MessageSquare className="mr-2 h-5 w-5" /> Secure Message
                  </Link>
                </Button>
              ) : (
                <Button className="w-full rounded-full h-14 font-black shadow-lg" asChild>
                  <Link href="/login">Sign In to Message</Link>
                </Button>
              )}
            </div>
          </Card>

          <Card className="border-none bg-primary text-primary-foreground rounded-[2rem] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-32 w-32" />
            </div>
            <CardContent className="p-8 space-y-4 relative z-10">
              <h3 className="font-black text-sm uppercase tracking-widest">Global Evidence</h3>
              <p className="text-xs opacity-80 leading-relaxed font-medium">This professional's reputation is built on real-world logs verified by Globlync's high-trust network.</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Professional Bio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {worker.bio || `${worker.name} is a verified professional specialized in ${worker.tradeSkill || 'their field'}. Building a high-trust digital legacy in Malawi.`}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" /> Verified Evidence Logs
              </h3>
              <Badge variant="secondary" className="bg-primary/5 text-primary font-black">{jobs?.length || 0} Total</Badge>
            </div>

            <div className="grid gap-4">
              {isJobsLoading ? (
                [1, 2].map(i => <Card key={i} className="h-32 animate-pulse bg-muted/20 border-none rounded-2xl" />)
              ) : jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <Card key={job.id} className={`border-none shadow-sm rounded-3xl overflow-hidden group transition-all hover:shadow-md ${job.isVerified ? 'bg-white' : 'bg-muted/10 opacity-60'}`}>
                    <CardContent className="p-6 flex gap-6">
                      {job.photoUrl && (
                        <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                          <img src={job.photoUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-lg truncate leading-tight">{job.title}</h4>
                          {job.isVerified && <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] font-black uppercase">Verified</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium line-clamp-2">{job.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Sparkles className="h-3 w-3 text-primary/40" />
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            {job.createdAt?.seconds ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true }) : "Recent"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 bg-muted/10 rounded-[3rem] border-4 border-dashed">
                  <Briefcase className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-[9px]">No verified jobs logged yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
