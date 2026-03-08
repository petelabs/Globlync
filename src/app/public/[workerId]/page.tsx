
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, increment, serverTimestamp } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  Star, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  ExternalLink,
  Loader2,
  Award,
  Globe
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const db = useFirestore();
  const [hasViewed, setHasViewed] = useState(false);

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
  const { data: jobs } = useCollection(jobsRef);
  const { data: ratings } = useCollection(ratingsRef);

  useEffect(() => {
    if (workerRef && !hasViewed) {
      updateDocumentNonBlocking(workerRef, {
        profileViews: increment(1),
        updatedAt: serverTimestamp()
      });
      setHasViewed(true);
    }
  }, [workerRef, hasViewed]);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <Button asChild rounded-full><Link href="/">Return Home</Link></Button>
      </div>
    );
  }

  const verifiedJobs = jobs?.filter(j => j.isVerified) || [];

  return (
    <div className="flex flex-col gap-8 py-8 max-w-4xl mx-auto px-4">
      <Card className="border-none shadow-xl overflow-hidden rounded-[3rem]">
        <div className="h-32 bg-primary relative" />
        <CardContent className="pt-0 flex flex-col items-center text-center px-8 pb-10">
          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl -mt-16 bg-white">
            <AvatarImage src={worker.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-2xl font-black">{worker.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="mt-4 space-y-1">
            <h1 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
              {worker.name}
              {worker.isPro && <Zap className="h-5 w-5 text-secondary fill-secondary" />}
            </h1>
            <p className="text-primary font-black uppercase tracking-widest text-xs">@{worker.username}</p>
            <p className="text-muted-foreground font-bold text-lg">{worker.tradeSkill || "Verified Professional"}</p>
          </div>

          <div className="flex gap-4 mt-6">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black">{worker.trustScore}</span>
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Trust Score</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-black">{verifiedJobs.length}</span>
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Verified Jobs</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-black">{worker.profileViews || 0}</span>
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Views</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8">
            {worker.whatsappNumber && (
              <Button className="rounded-full h-14 font-black text-lg bg-[#25D366] hover:bg-[#128C7E] shadow-lg" asChild>
                <a href={`https://wa.me/${worker.whatsappNumber}`} target="_blank">
                  <WhatsAppIcon className="mr-2 h-6 w-6" /> Connect on WhatsApp
                </a>
              </Button>
            )}
            <Button variant="outline" className="rounded-full h-14 font-black border-2" asChild>
              <a href={`mailto:${worker.contactEmail || ""}`}>Message Professional</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 px-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Verified Evidence
            </h2>
            <div className="grid gap-4">
              {verifiedJobs.length > 0 ? (
                verifiedJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden border-none shadow-sm rounded-3xl group hover:shadow-xl transition-all">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      {job.photoUrl && (
                        <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0">
                          <img src={job.photoUrl} alt={job.title} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                          {job.aiVerified && <div className="absolute top-2 left-2 bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> AI VERIFIED</div>}
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-black text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{job.description}</p>
                        <div className="mt-4 flex items-center gap-3">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none font-black text-[9px] uppercase"><CheckCircle2 className="h-3 w-3 mr-1" /> Client Verified</Badge>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">{formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="p-12 text-center bg-muted/20 rounded-[2.5rem] border-2 border-dashed">
                  <p className="text-muted-foreground font-bold">No verified evidence yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-accent/30 p-6 space-y-4">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-primary">About Professional</h3>
            <p className="text-sm font-medium leading-relaxed opacity-80">{worker.bio || "No professional summary provided."}</p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Globe className="h-4 w-4 text-primary/60" />
                <span>{worker.serviceAreas?.join(", ") || "Remote / Global"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <Clock className="h-4 w-4 text-primary/60" />
                <span>Active on Globlync since {worker.createdAt?.toDate ? worker.createdAt.toDate().getFullYear() : '2026'}</span>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] p-6 space-y-4">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-primary">Badges & Awards</h3>
            <div className="flex flex-wrap gap-2">
              {worker.badgeIds?.length > 0 ? (
                worker.badgeIds.map((bid: string) => (
                  <Badge key={bid} className="bg-primary/10 text-primary border-none py-1.5 px-3 rounded-xl font-black text-[10px] uppercase">
                    <Award className="h-3 w-3 mr-1.5" /> {bid.replace('-', ' ')}
                  </Badge>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground font-bold italic">Building milestones...</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
