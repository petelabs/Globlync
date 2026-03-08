"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, increment, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  ExternalLink,
  Crown,
  Zap,
  Briefcase,
  Quote,
  Clock,
  Share2
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
    // Automated View Incrementor
    if (workerRef && workerId) {
      const storageKey = `viewed_${workerId}`;
      const hasViewed = sessionStorage.getItem(storageKey);
      
      if (!hasViewed) {
        updateDocumentNonBlocking(workerRef, {
          profileViews: increment(1),
          updatedAt: serverTimestamp()
        });
        sessionStorage.setItem(storageKey, 'true');
      }
    }
  }, [workerRef, workerId]);

  const stats = useMemo(() => {
    if (!jobs || !ratings) return { verifiedCount: 0, avgRating: 0 };
    const verified = jobs.filter(j => j.isVerified).length;
    const avg = ratings.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 0;
    return { verifiedCount: verified, avgRating: avg.toFixed(1) };
  }, [jobs, ratings]);

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name} on Globlync`,
          text: `Check out ${profile?.name}'s professional reputation on Globlync!`,
          url: window.location.href,
        });
      } catch (e) {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied", description: "Profile link ready to share." });
  };

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Reputation Evidence...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center gap-4 px-6">
        <div className="bg-muted p-8 rounded-[3rem]">
          <ShieldCheck className="h-16 w-16 text-muted-foreground/30" />
        </div>
        <h1 className="text-2xl font-black">Profile Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-xs">This user might have removed their profile or the link is invalid.</p>
        <Button asChild className="rounded-full mt-4"><Link href="/">Back to Globlync</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="rounded-full">
          <Link href="/search"><ArrowLeft className="mr-2 h-4 w-4" /> Discovery</Link>
        </Button>
        <Button variant="outline" size="sm" onClick={shareProfile} className="rounded-full font-bold">
          <Share2 className="mr-2 h-4 w-4" /> Share Reputation
        </Button>
      </header>

      <section className="flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left">
        <div className="relative">
          <Avatar className="h-40 w-40 border-8 border-white shadow-2xl">
            <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {profile.isPro && (
            <div className="absolute -top-2 -right-2 bg-secondary p-3 rounded-full shadow-2xl animate-pulse">
              <Crown className="h-6 w-6 text-secondary-foreground fill-white" />
            </div>
          )}
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-4xl font-black tracking-tighter">{profile.name}</h1>
            {profile.isPro && <Badge className="bg-secondary text-secondary-foreground font-black px-3 py-1 rounded-full uppercase text-[10px]">Pro VIP</Badge>}
          </div>
          <p className="text-xl font-bold text-primary flex items-center justify-center md:justify-start gap-2">
            <Briefcase className="h-5 w-5" /> {profile.tradeSkill || "Professional"}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-primary/60" /> {profile.serviceAreas?.[0] || "Remote / Global"}</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary/60" /> Trust Score: {profile.trustScore}</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-secondary" /> {stats.avgRating} ({ratings?.length || 0} reviews)</span>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-muted/20">
            <CardContent className="p-8">
              <h3 className="text-lg font-black uppercase tracking-widest text-primary mb-4">Professional Story</h3>
              <p className="text-lg leading-relaxed text-muted-foreground font-medium italic">
                <Quote className="h-8 w-8 text-primary/10 -ml-4 -mt-2 inline mr-2" />
                {profile.bio || "This professional hasn't written their bio yet."}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary" /> Verified Job Logs
            </h3>
            {jobs && jobs.filter(j => j.isVerified).length > 0 ? (
              <div className="grid gap-4">
                {jobs.filter(j => j.isVerified).map((job) => (
                  <Card key={job.id} className="border-none shadow-sm overflow-hidden rounded-[2rem] group">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      {job.photoUrl && (
                        <div className="w-full sm:w-48 h-48 bg-muted shrink-0 overflow-hidden">
                          <img src={job.photoUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={job.title} />
                        </div>
                      )}
                      <div className="p-6 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-black">{job.title}</h4>
                          <Badge className="bg-primary/10 text-primary border-none text-[8px] uppercase font-black">AI Verified</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                        <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          <Clock className="h-3 w-3" /> Completed {formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/10 rounded-[3rem] border-2 border-dashed">
                <p className="text-muted-foreground font-bold">No verified job logs yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80">Connect Directly</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {profile.whatsappNumber && (
                <Button className="w-full rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black h-14 text-lg border-none shadow-lg" asChild>
                  <a href={`https://wa.me/${profile.whatsappNumber}`} target="_blank">
                    <WhatsAppIcon className="mr-3 h-6 w-6" /> WhatsApp
                  </a>
                </Button>
              )}
              {profile.contactEmail && (
                <Button variant="secondary" className="w-full rounded-full font-black h-12" asChild>
                  <a href={`mailto:${profile.contactEmail}`}>Email Professional</a>
                </Button>
              )}
              <div className="text-center pt-2">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified via Globlync</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem]">
            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest opacity-70">Client Reviews</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {ratings && ratings.length > 0 ? (
                ratings.map((r, idx) => (
                  <div key={idx} className="space-y-1 pb-4 border-b last:border-0">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className={cn("h-3 w-3", i < r.score ? "fill-secondary text-secondary" : "text-muted")} />)}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground italic leading-relaxed">"{r.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}