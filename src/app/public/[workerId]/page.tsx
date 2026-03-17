
"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Users,
  Award,
  Globe,
  MapPin,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const { user } = useUser();
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
    return query(jobsRef, orderBy("createdAt", "desc"), limit(10));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const chatId = useMemo(() => {
    if (!user || !workerId) return null;
    return [user.uid, workerId].sort().join("_");
  }, [user, workerId]);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verifying Identity...</p>
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
        <Button asChild className="rounded-full mt-4"><Link href="/search">Return to Directory</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 overflow-x-hidden pb-32">
      {/* Header Profile Card */}
      <Card className="border-none shadow-2xl overflow-hidden rounded-[3rem] bg-white relative">
        <div className="h-40 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Globe className="h-96 w-96 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="absolute bottom-4 right-8">
             <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-black text-[10px] uppercase px-4 py-1.5 rounded-full">
               Malawi National Directory
             </Badge>
          </div>
        </div>
        <CardContent className="pt-0 relative px-8 pb-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
            <Avatar className="h-32 w-32 border-8 border-white shadow-2xl">
              <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-3xl font-black">{worker.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1 space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-black tracking-tight">{worker.name}</h1>
                {worker.isPro && <CheckCircle2 className="h-6 w-6 text-primary fill-primary/10" />}
              </div>
              <p className="text-primary font-black uppercase text-xs tracking-widest">@{worker.username}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>{worker.trustScore || 0} Trust Score</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-muted" />
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary/40" />
                  <span>Malawi</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {chatId ? (
                <Button className="rounded-full font-black flex-1 md:flex-none h-14 px-8 shadow-xl" asChild>
                  <Link href={`/messages/${chatId}`}><MessageSquare className="mr-2 h-5 w-5" /> Secure Message</Link>
                </Button>
              ) : (
                <Button className="rounded-full font-black flex-1 md:flex-none h-14 px-8 shadow-xl" asChild>
                  <Link href="/login">Sign In to Message</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3 pt-6 border-t border-dashed">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Professional Bio</h3>
                <p className="text-sm font-medium leading-relaxed text-foreground/80 bg-muted/20 p-6 rounded-3xl italic">
                  "{worker.bio || `A skilled professional specializing in ${worker.tradeSkill || 'their craft'}. Focused on high-quality delivery and client trust.`}"
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Evidence Timeline</h3>
                  <Badge variant="outline" className="text-[8px] font-black uppercase">Verified Logs Only</Badge>
                </div>
                
                {isJobsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary/20" /></div>
                ) : jobs && jobs.length > 0 ? (
                  <div className="grid gap-4">
                    {jobs.map((job) => (
                      <Card key={job.id} className="border-none bg-muted/10 hover:bg-muted/20 transition-colors rounded-[2rem] overflow-hidden group">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-lg group-hover:text-primary transition-colors">{job.title}</h4>
                                {job.isVerified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                              </div>
                              <p className="text-xs text-muted-foreground font-medium line-clamp-2">{job.description}</p>
                              <div className="flex items-center gap-3 pt-2">
                                <span className="text-[10px] font-black uppercase text-primary/60 flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {job.createdAt?.seconds ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true }) : "Recent"}
                                </span>
                                {job.aiVerified && (
                                  <span className="text-[10px] font-black uppercase text-secondary flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> AI Protected
                                  </span>
                                )}
                              </div>
                            </div>
                            {job.photoUrl && (
                              <div className="h-16 w-16 rounded-2xl overflow-hidden shrink-0 shadow-sm border-2 border-white">
                                <img src={job.photoUrl} alt="Evidence" className="h-full w-full object-cover" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/10 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center gap-3">
                    <Briefcase className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No evidence logs found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/5 p-6 rounded-[2.5rem] border-2 border-primary/10">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4" /> Expertise
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Primary Trade</p>
                    <p className="font-black text-lg">{worker.tradeSkill || "General Professional"}</p>
                  </div>
                  <div className="pt-4 border-t border-primary/10">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-3">Trust Badges</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white border-primary/20 text-primary font-black text-[9px] py-1">IDENTITY VERIFIED</Badge>
                      {worker.isPro && <Badge className="bg-secondary text-secondary-foreground border-none font-black text-[9px] py-1">PIONEER PRO</Badge>}
                      <Badge variant="outline" className="text-[9px] font-black">LOCAL EXPERT</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {ratings && ratings.length > 0 && (
                <div className="bg-secondary/10 p-6 rounded-[2.5rem] border-2 border-secondary/20">
                  <h3 className="text-xs font-black uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-secondary" /> Client Reviews
                  </h3>
                  <div className="space-y-4">
                    {ratings.slice(0, 3).map((r, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex text-secondary">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={idx} className={`h-2.5 w-2.5 ${idx < r.score ? 'fill-current' : 'opacity-20'}`} />
                          ))}
                        </div>
                        <p className="text-[10px] font-medium leading-tight text-muted-foreground">"{r.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="text-center py-10 flex flex-col items-center gap-4">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Verified by Globlync Reputation Engine</p>
        <Button variant="ghost" size="sm" asChild className="text-[10px] font-black uppercase text-primary">
          <Link href="/search">Find More Professionals <ArrowRight className="ml-2 h-3 w-3" /></Link>
        </Button>
      </footer>
    </div>
  );
}
