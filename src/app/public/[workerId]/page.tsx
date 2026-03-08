
"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, increment, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  MapPin, 
  Globe, 
  MessageSquare, 
  Star, 
  ClipboardCheck, 
  Zap, 
  ExternalLink, 
  Clock, 
  Loader2,
  CheckCircle2,
  Share2,
  Award
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs } = useCollection(jobsRef);
  const { data: ratings } = useCollection(ratingsRef);

  // Automated Profile View Logic
  useEffect(() => {
    if (workerRef) {
      updateDocumentNonBlocking(workerRef, {
        profileViews: increment(1),
        updatedAt: serverTimestamp()
      });
    }
  }, [workerId]); // Only increment once per mount of this specific ID

  if (isProfileLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Fetching Professional Evidence...</p>
    </div>
  );

  if (!profile) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center gap-4 px-6">
      <div className="p-8 bg-muted rounded-full mb-4"><Globe className="h-12 w-12 text-muted-foreground/30" /></div>
      <h1 className="text-2xl font-black">Profile Not Found</h1>
      <p className="text-muted-foreground max-w-xs mx-auto">This professional profile may have been removed or the link is incorrect.</p>
      <Button asChild className="rounded-full mt-4"><Link href="/">Back to Globlync</Link></Button>
    </div>
  );

  const verifiedJobs = jobs?.filter(j => j.isVerified) || [];
  const avgRating = ratings && ratings.length 
    ? (ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length).toFixed(1)
    : "New";

  return (
    <div className="flex flex-col gap-12 py-8 max-w-5xl mx-auto px-4 overflow-x-hidden">
      <header className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
        <div className="relative group">
          <Avatar className="h-48 w-48 border-8 border-white shadow-2xl">
            <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {profile.isPro && (
            <div className="absolute -top-2 -right-2 bg-secondary p-3 rounded-full border-4 border-white shadow-xl animate-pulse">
              <Zap className="h-6 w-6 text-white fill-white" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-4 py-1 rounded-full uppercase text-[10px] tracking-widest mb-2">
              <ShieldCheck className="h-3 w-3 mr-2" /> Verified Professional
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">{profile.name}</h1>
            <p className="text-xl md:text-2xl text-primary font-bold uppercase tracking-tight">@{profile.username} • {profile.tradeSkill || "General Professional"}</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-2xl">
              <Star className="h-4 w-4 text-secondary fill-secondary" />
              <span className="font-black">{avgRating}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Rating</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-2xl">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              <span className="font-black">{verifiedJobs.length}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Jobs Verified</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-black">{profile.trustScore}</span>
              <span className="text-[10px] font-bold uppercase">Trust Score</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {profile.whatsappNumber && (
              <Button size="lg" className="rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black h-14 px-10 shadow-xl flex-1 md:flex-none" asChild>
                <a href={`https://wa.me/${profile.whatsappNumber}`} target="_blank">
                  <WhatsAppIcon className="mr-3 h-6 w-6" /> Connect on WhatsApp
                </a>
              </Button>
            )}
            <Button size="lg" variant="outline" className="rounded-full h-14 border-2 font-black px-10 flex-1 md:flex-none" onClick={() => {
              navigator.share?.({ title: profile.name, url: window.location.href }).catch(() => {
                navigator.clipboard.writeText(window.location.href);
              });
            }}>
              <Share2 className="mr-3 h-5 w-5" /> Share Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-8 space-y-10">
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" /> Professional Bio
            </h3>
            <p className="text-xl leading-relaxed text-foreground font-medium opacity-90">{profile.bio || "This professional is currently building their evidence log."}</p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" /> Verified Evidence
              </h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{verifiedJobs.length}</Badge>
            </div>
            <div className="grid gap-6">
              {verifiedJobs.length > 0 ? (
                verifiedJobs.map((job) => (
                  <Card key={job.id} className="border-none shadow-sm rounded-[2.5rem] overflow-hidden group hover:shadow-xl transition-all">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      {job.photoUrl && (
                        <div className="relative aspect-video w-full sm:w-64 bg-muted shrink-0">
                          <img src={job.photoUrl} alt={job.title} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                          {job.aiVerified && (
                            <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                              <Zap className="h-3.5 w-3.5" /> AI VERIFIED
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-8 flex flex-col justify-center gap-2">
                        <h4 className="text-2xl font-black leading-tight">{job.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}</span>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/30 mx-1" />
                          <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-4 border-dashed border-muted/30">
                  <ClipboardCheck className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold">No verified job logs yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-8">
          <Card className="border-none bg-primary text-primary-foreground rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldCheck className="h-24 w-24" />
            </div>
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest opacity-70">Trust Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-60">Total Reach</p>
                  <p className="text-4xl font-black tracking-tighter">{profile.profileViews || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase opacity-60">Reputation</p>
                  <p className="text-4xl font-black tracking-tighter">{profile.trustScore}</p>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 opacity-60" />
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-60">Service Areas</p>
                    <p className="text-xs font-bold leading-tight">{profile.serviceAreas?.join(", ") || "Remote / Global"}</p>
                  </div>
                </div>
                {profile.contactEmail && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 opacity-60" />
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60">Professional Contact</p>
                      <p className="text-xs font-bold truncate max-w-[180px]">{profile.contactEmail}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" /> Client Feedback
            </h3>
            <div className="grid gap-4">
              {ratings && ratings.length > 0 ? (
                ratings.map((r, i) => (
                  <Card key={i} className="border-none bg-muted/30 rounded-3xl p-6 shadow-sm">
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={cn("h-3 w-3", idx < r.score ? "fill-secondary text-secondary" : "text-muted")} />
                      ))}
                    </div>
                    <p className="text-xs italic leading-relaxed mb-3">"{r.comment || "Excellent professional work."}"</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">— Verified Client</p>
                  </Card>
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground font-medium text-center py-8">No client reviews yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer className="text-center py-12 border-t mt-12 opacity-40">
        <Logo className="justify-center scale-75 grayscale mb-2" />
        <p className="text-[9px] font-black uppercase tracking-[0.4em]">Evidence-Based Digital Reputation</p>
      </footer>
    </div>
  );
}
