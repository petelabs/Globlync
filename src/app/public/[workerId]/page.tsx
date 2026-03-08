
"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, increment, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Zap, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Briefcase, 
  Clock, 
  Share2, 
  Loader2, 
  Globe, 
  MessageSquare,
  Award,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const db = useFirestore();
  const { toast } = useToast();

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

  useEffect(() => {
    if (workerRef) {
      updateDocumentNonBlocking(workerRef, {
        profileViews: increment(1),
        updatedAt: serverTimestamp()
      });
    }
  }, [workerRef]);

  const averageRating = useMemo(() => {
    if (!ratings?.length) return 0;
    return ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length;
  }, [ratings]);

  const verifiedJobs = useMemo(() => {
    return jobs?.filter(j => j.isVerified) || [];
  }, [jobs]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.name} - Verified Professional`,
        text: `Check out the evidence-based reputation of ${profile?.name} on Globlync.`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Profile Link Copied" });
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fetching Professional Data...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6 gap-4">
        <div className="bg-destructive/10 p-6 rounded-full"><Globe className="h-12 w-12 text-destructive" /></div>
        <h1 className="text-2xl font-black">Profile Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-xs">The professional you are looking for might have moved or the link is incorrect.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 overflow-x-hidden">
      <header className="relative flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-primary shadow-2xl">
            <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-3xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {profile.isPro && (
            <div className="absolute -top-2 -right-2 bg-secondary p-2 rounded-full border-4 border-white shadow-xl animate-pulse">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h1 className="text-4xl font-black tracking-tighter">{profile.name}</h1>
            <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 self-center md:self-auto">
              <ShieldCheck className="h-3 w-3 mr-1" /> Trust Score: {profile.trustScore || 0}
            </Badge>
          </div>
          <p className="text-lg font-bold text-primary uppercase tracking-tight">{profile.tradeSkill || "New Professional"}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.serviceAreas?.[0] || "Remote / Global"}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Joined {formatDistanceToNow(new Date(profile.createdAt?.seconds * 1000), { addSuffix: true })}</span>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto pt-4 md:pt-0">
          <Button variant="outline" className="flex-1 md:flex-none rounded-full font-bold h-12" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button className="flex-1 md:flex-none rounded-full font-black h-12 shadow-lg" asChild>
            <a href={`https://wa.me/${profile.whatsappNumber?.replace(/[^0-9]/g, '')}`} target="_blank">
              <WhatsAppIcon className="mr-2 h-5 w-5" /> Hire Me
            </a>
          </Button>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8 space-y-8">
          <section>
            <h2 className="text-xl font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Professional Summary
            </h2>
            <Card className="border-none bg-primary/5 rounded-[2rem] shadow-inner">
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-muted-foreground italic">"{profile.bio || "This professional is currently building their summary."}"</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> Evidence Portfolio
              </h2>
              <Badge variant="outline" className="font-black text-[10px]">{verifiedJobs.length} Verified Logs</Badge>
            </div>
            
            <div className="grid gap-4">
              {verifiedJobs.length > 0 ? (
                verifiedJobs.map((job) => (
                  <Card key={job.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden rounded-[2rem]">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      {job.photoUrl && (
                        <div className="relative aspect-video sm:w-48 bg-muted shrink-0">
                          <img src={job.photoUrl} alt={job.title} className="h-full w-full object-cover" />
                          {job.aiVerified && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                              <Sparkles className="h-2.5 w-2.5" /> AI VERIFIED
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6 space-y-2">
                        <h3 className="font-black text-lg text-primary leading-tight">{job.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
                        <div className="pt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> Client Verified
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                  <Briefcase className="h-10 w-10 mx-auto mb-4 opacity-10" />
                  <p className="text-muted-foreground text-sm">No verified jobs logged yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-8">
          <section>
            <h2 className="text-xl font-black uppercase tracking-[0.2em] mb-4">Client Feedback</h2>
            <div className="grid gap-4">
              <Card className="border-none shadow-sm bg-secondary/5 rounded-[2rem] p-6 text-center space-y-2">
                <div className="flex justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-5 w-5 ${s <= Math.round(averageRating) ? "fill-secondary text-secondary" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-2xl font-black">{averageRating.toFixed(1)} / 5.0</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{ratings?.length || 0} Total Reviews</p>
              </Card>

              {ratings && ratings.length > 0 && ratings.map((r) => (
                <Card key={r.id} className="border-none shadow-sm rounded-2xl p-4">
                  <div className="flex gap-1 mb-2">
                    {[...Array(r.score)].map((_, i) => <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />)}
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">"{r.comment || "Great work!"}"</p>
                  <p className="text-[9px] font-bold text-primary mt-2 uppercase tracking-tight">— Verified Client</p>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-[0.2em] mb-4">Service Area</h2>
            <div className="flex flex-wrap gap-2">
              {profile.serviceAreas && profile.serviceAreas.length > 0 ? (
                profile.serviceAreas.map((area: string) => (
                  <Badge key={area} variant="secondary" className="rounded-full font-bold px-4 py-1">
                    {area}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="rounded-full">Global / Remote</Badge>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
