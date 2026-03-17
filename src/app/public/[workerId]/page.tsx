
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
  MessageSquare, 
  CheckCircle2, 
  TrendingUp,
  Award,
  Loader2,
  Users,
  ArrowLeft,
  Crown,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const { user: currentUser } = useUser();
  const db = useFirestore();

  const workerRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return doc(db, "workerProfiles", workerId);
  }, [db, workerId]);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "jobs");
  }, [db, workerId]);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const jobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Retrieving Evidence...</p>
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

  const isPro = worker.isPro || worker.activeBenefits?.some((b: any) => new Date(b.expiresAt) > new Date());
  const verifiedJobs = jobs?.filter(j => j.isVerified) || [];
  const chatId = currentUser ? [currentUser.uid, workerId].sort().join("_") : null;

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 pb-32">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="rounded-full">
          <Link href="/search"><ArrowLeft className="mr-2 h-4 w-4" /> Directory</Link>
        </Button>
        {isPro && (
          <Badge className="bg-secondary text-secondary-foreground font-black px-4 py-1 rounded-full uppercase text-[10px]">
            <Crown className="h-3 w-3 mr-1.5 fill-current" /> Verified Pro
          </Badge>
        )}
      </header>

      <section className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="relative group">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary shadow-2xl">
            <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black">{worker.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {isPro && (
            <div className="absolute -top-2 -right-2 bg-secondary p-2 rounded-full shadow-xl animate-pulse">
              <Crown className="h-5 w-5 text-white fill-white" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
              {worker.name}
            </h1>
            <p className="text-primary font-black uppercase tracking-widest text-sm mt-1">@{worker.username}</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <Badge variant="secondary" className="rounded-full bg-primary/5 text-primary border-none px-4 py-1 font-bold">
              <Briefcase className="h-3 w-3 mr-1.5" /> {worker.tradeSkill || "General Pro"}
            </Badge>
            <Badge variant="outline" className="rounded-full px-4 py-1 border-2 font-bold">
              <ShieldCheck className="h-3 w-3 mr-1.5 text-primary" /> {worker.trustScore || 0} Trust Points
            </Badge>
          </div>

          <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl">
            {worker.bio || "Building a verifiable professional reputation on Globlync. Expert in their field with verified evidence logs."}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            {chatId ? (
              <Button className="rounded-full h-14 px-10 font-black text-lg shadow-xl flex-1" asChild>
                <Link href={`/messages/${chatId}`}>
                  <MessageSquare className="mr-2 h-5 w-5" /> Secure Message
                </Link>
              </Button>
            ) : (
              <Button className="rounded-full h-14 px-10 font-black text-lg shadow-xl flex-1" asChild>
                <Link href="/login">
                  <MessageSquare className="mr-2 h-5 w-5" /> Join to Message
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <Card className="border-none shadow-sm bg-primary/5 p-6 rounded-[2rem] text-center">
          <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profile Reach</p>
          <p className="text-3xl font-black">{worker.profileViews || 0}</p>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 p-6 rounded-[2rem] text-center">
          <CheckCircle2 className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verified Logs</p>
          <p className="text-3xl font-black">{verifiedJobs.length}</p>
        </Card>
        <Card className="border-none shadow-sm bg-secondary/10 p-6 rounded-[2rem] text-center">
          <Star className="h-6 w-6 text-secondary mx-auto mb-2 fill-secondary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg Rating</p>
          <p className="text-3xl font-black">
            {ratings && ratings.length > 0 
              ? (ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length).toFixed(1) 
              : "5.0"}
          </p>
        </Card>
      </div>

      <section className="space-y-6 mt-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" /> Verified Evidence Timeline
          </h2>
          <Badge variant="outline" className="font-bold">{jobs?.length || 0} Total Logs</Badge>
        </div>

        <div className="grid gap-4">
          {isJobsLoading ? (
            [1, 2].map(i => <Card key={i} className="h-32 animate-pulse bg-muted/20 border-none rounded-2xl" />)
          ) : jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-shadow">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  {job.photoUrl && (
                    <div className="w-full sm:w-48 h-48 sm:h-auto relative overflow-hidden shrink-0">
                      <img src={job.photoUrl} alt={job.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      {job.aiVerified && (
                        <div className="absolute top-2 left-2 bg-primary text-white p-1 rounded-full shadow-lg">
                          <Sparkles className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-6 flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold leading-tight">{job.title}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase mt-1">
                          <Clock className="h-3 w-3" /> {job.createdAt?.seconds ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true }) : "Recent"}
                        </div>
                      </div>
                      {job.isVerified ? (
                        <Badge className="bg-green-500/10 text-green-600 border-none uppercase text-[8px] font-black">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Verified Proof
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="uppercase text-[8px] font-black opacity-50">Pending Proof</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-[2.5rem] border-4 border-dashed flex flex-col items-center gap-4 opacity-40">
              <Briefcase className="h-12 w-12 text-muted-foreground" />
              <p className="text-[10px] font-black uppercase tracking-widest">No work logs uploaded yet.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center py-12 border-t mt-12 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">
          Globlync Evidence-Based Verification • v2.1
        </p>
      </footer>
    </div>
  );
}
