
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useCollection } from "@/firebase";
import { doc, collection, increment, serverTimestamp, query, where, orderBy } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ShieldCheck, 
  MapPin, 
  Globe, 
  Star, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  Clock, 
  Sparkles,
  Zap,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const db = useFirestore();
  const [hasIncremented, setHasIncremented] = useState(false);

  const workerRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return doc(db, "workerProfiles", workerId);
  }, [db, workerId]);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "jobs");
  }, [db, workerId]);

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, where("isVerified", "==", true), orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const ratingsQuery = useMemoFirebase(() => {
    if (!ratingsRef) return null;
    return query(ratingsRef, orderBy("ratedAt", "desc"));
  }, [ratingsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs } = useCollection(verifiedJobsQuery);
  const { data: ratings } = useCollection(ratingsQuery);

  useEffect(() => {
    if (workerRef && !hasIncremented && !isProfileLoading && profile) {
      updateDocumentNonBlocking(workerRef, {
        profileViews: increment(1),
        updatedAt: serverTimestamp()
      });
      setHasIncremented(true);
    }
  }, [workerRef, hasIncremented, isProfileLoading, profile]);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verifying Professional Record...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
        <h1 className="text-2xl font-black">Profile Not Found</h1>
        <p className="text-muted-foreground">This professional profile may have been removed or the link is incorrect.</p>
        <Button asChild className="rounded-full mt-4 border-2"><a href="/">Return Home</a></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 overflow-x-hidden">
      <header className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left bg-white p-10 rounded-[3rem] shadow-sm border border-muted/50">
        <div className="relative">
          <Avatar className={cn("h-40 w-40 border-8 shadow-2xl", profile.isPro ? "border-secondary" : "border-primary/10")}>
            <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black">{profile.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          {profile.isPro && (
            <div className="absolute -top-2 -right-2 bg-secondary p-2 rounded-full border-4 border-white shadow-xl animate-bounce">
              <Crown className="h-6 w-6 text-white fill-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h1 className="text-4xl font-black tracking-tighter">{profile.name}</h1>
              {profile.isPro && <Badge className="bg-secondary text-secondary-foreground font-black uppercase text-[10px] py-1 px-3">VIP Pro</Badge>}
            </div>
            <p className="text-primary font-bold uppercase tracking-[0.2em] text-sm">{profile.tradeSkill || "Professional Expert"}</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {profile.serviceAreas?.[0] || "Remote / Global"}</div>
            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Trust Score: {profile.trustScore || 0}</div>
            <div className="flex items-center gap-1.5 text-secondary font-black"><Globe className="h-4 w-4" /> {profile.profileViews || 0} Global Views</div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            {profile.whatsappNumber && (
              <Button className="rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white h-14 px-10 font-black shadow-xl" asChild>
                <a href={`https://wa.me/${profile.whatsappNumber}`} target="_blank">
                  <WhatsAppIcon className="mr-2 h-6 w-6" /> Connect on WhatsApp
                </a>
              </Button>
            )}
            <Button variant="outline" className="rounded-full h-14 px-10 font-black border-2" asChild>
              <a href={`mailto:${profile.contactEmail || profile.id + '@globlync.pro'}`}>
                Contact via Email
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Professional Evidence
            </h2>
            <div className="grid gap-4">
              {jobs && jobs.length > 0 ? (
                jobs.map(job => (
                  <Card key={job.id} className="overflow-hidden border-none shadow-sm rounded-3xl group hover:shadow-xl transition-all">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      {job.photoUrl && (
                        <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0 overflow-hidden">
                          <img src={job.photoUrl} alt={job.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          {job.aiVerified && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xl">
                              <Sparkles className="h-2 w-2" /> AI VERIFIED
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6 space-y-2 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-black text-xl text-primary">{job.title}</h3>
                          <Badge className="bg-green-500/10 text-green-600 border-none"><CheckCircle2 className="h-3 w-3 mr-1" /> VERIFIED</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{job.description}</p>
                        <div className="pt-4 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <Clock className="h-3 w-3" /> Completed {formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                  <p className="text-muted-foreground font-medium">No verified evidence logs yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Star className="h-6 w-6 text-secondary fill-secondary" />
              Client Reviews
            </h2>
            <div className="grid gap-4">
              {ratings && ratings.length > 0 ? (
                ratings.map(r => (
                  <Card key={r.id} className="border-none shadow-sm rounded-3xl bg-primary/5">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("h-4 w-4", i < r.score ? "fill-secondary text-secondary" : "text-muted")} />
                        ))}
                      </div>
                      <p className="text-sm italic leading-relaxed font-medium">"{r.comment || "Excellent professional work!"}"</p>
                      <div className="text-[10px] font-black uppercase text-primary/60 tracking-widest">
                        {r.ratedAt?.seconds ? formatDistanceToNow(new Date(r.ratedAt.seconds * 1000), { addSuffix: true }) : 'Recently'}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                  <p className="text-muted-foreground font-medium">No client ratings yet.</p>
                </div>
              )}
            </div>
          </section>

          <Card className="border-none bg-primary text-primary-foreground rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="h-24 w-24" />
            </div>
            <h3 className="text-xl font-black leading-tight mb-4">Hire {profile.name} with Confidence.</h3>
            <p className="text-xs opacity-80 leading-relaxed mb-6">
              This professional has a verified trust score of {profile.trustScore} and has successfully completed {jobs?.length || 0} evidence-based jobs.
            </p>
            <Button variant="secondary" className="w-full rounded-full font-black h-12" asChild>
              <a href={`https://wa.me/${profile.whatsappNumber}`} target="_blank">Book Now</a>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
