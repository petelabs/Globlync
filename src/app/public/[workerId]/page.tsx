"use client";

import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  Star, 
  CheckCircle2, 
  Loader2, 
  MessageSquare,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser } from "@/firebase";

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

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(
    useMemoFirebase(() => jobsRef ? query(jobsRef, where("isVerified", "==", true), orderBy("createdAt", "desc")) : null, [jobsRef])
  );
  const { data: ratings } = useCollection(ratingsRef);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h1 className="text-2xl font-black">Professional Not Found</h1>
        <Button onClick={() => router.push("/search")}>Back to Directory</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Professional Evidence Log</h1>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Stats & Profile */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white text-center p-8">
            <Avatar className="h-32 w-32 mx-auto border-4 border-primary shadow-xl mb-4">
              <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
              <AvatarFallback className="text-2xl font-black">{worker.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-black">{worker.name}</h2>
            <p className="text-primary font-black text-xs uppercase tracking-widest mt-1">@{worker.username}</p>
            <Badge variant={worker.isAvailable ? "default" : "secondary"} className="mt-4 font-black">
              {worker.isAvailable ? "Available for Hire" : "Currently Busy"}
            </Badge>
            
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Trust Score</p>
                <p className="text-2xl font-black text-primary">{worker.trustScore || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Verified Jobs</p>
                <p className="text-2xl font-black text-primary">{jobs?.length || 0}</p>
              </div>
            </div>

            <Button className="w-full mt-8 rounded-full h-14 font-black shadow-lg" asChild>
              <Link href={`/messages/${workerId}`}>
                <MessageSquare className="mr-2 h-5 w-5" /> Secure Contact
              </Link>
            </Button>
          </Card>

          <Card className="border-none bg-muted/30 p-6 rounded-[2rem] space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <Star className="h-4 w-4 text-secondary fill-secondary" /> Professional Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {worker.isPro && <Badge className="bg-secondary text-white font-black">PRO VIP</Badge>}
              {worker.badgeIds?.map((id: string) => (
                <Badge key={id} variant="outline" className="bg-white border-2 border-primary/10 font-bold uppercase text-[9px]">{id.replace('-', ' ')}</Badge>
              ))}
              {!worker.badgeIds?.length && !worker.isPro && <p className="text-[10px] text-muted-foreground italic">No badges earned yet.</p>}
            </div>
          </Card>
        </div>

        {/* Right Column: Evidence & Bio */}
        <div className="md:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-2xl font-black tracking-tight">Professional Expertise</h3>
            <Card className="border-none shadow-sm rounded-[2rem] p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-xl text-primary"><Briefcase className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Primary Trade</p>
                  <p className="text-lg font-black mt-1">{worker.tradeSkill || "General Professional"}</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed font-medium">{worker.bio || "This professional is building their digital reputation through verified evidence logs."}</p>
            </Card>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black tracking-tight">Verified Evidence</h3>
              <Badge variant="outline" className="bg-white border-2 font-black">ALL LOGS</Badge>
            </div>

            {isJobsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin opacity-20" /></div>
            ) : jobs && jobs.length > 0 ? (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="border-none shadow-md rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-xl transition-all">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-xl font-black group-hover:text-primary transition-colors">{job.title}</CardTitle>
                          <p className="text-xs text-muted-foreground font-medium mt-1">Verified on {job.updatedAt?.toDate ? job.updatedAt.toDate().toLocaleDateString() : 'Recent'}</p>
                        </div>
                        <div className="bg-green-500/10 text-green-600 p-2 rounded-full shadow-inner">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-6">
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{job.description}</p>
                      {job.photoUrl && (
                        <div className="rounded-3xl overflow-hidden aspect-video border-2 border-muted/20 relative">
                          <img src={job.photoUrl} alt="Work proof" className="w-full h-full object-cover" />
                          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shadow-lg">
                            <ShieldCheck className="h-3.5 w-3.5" /> AI Verified Evidence
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed mx-2 flex flex-col items-center gap-4">
                <Briefcase className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No verified jobs yet</p>
              </div>
            )}
          </section>

          {ratings && ratings.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-2xl font-black tracking-tight">Client Feedback</h3>
              <div className="grid gap-4">
                {ratings.map((r) => (
                  <Card key={r.id} className="border-none shadow-sm rounded-2xl bg-white p-6 flex gap-4">
                    <div className="bg-amber-500/10 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-black text-sm">Rating: {r.score}/5</p>
                        <p className="text-[10px] text-muted-foreground font-bold">{r.ratedAt?.toDate ? r.ratedAt.toDate().toLocaleDateString() : 'Recent'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium italic">"{r.comment || 'No written feedback provided.'}"</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
