
"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, increment, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  Star, 
  Globe, 
  Loader2, 
  Crown, 
  Mail, 
  Phone, 
  ChevronRight,
  Sparkles,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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

  // Automated View Counter: Atomic increment on mount
  useEffect(() => {
    if (workerRef) {
      updateDocumentNonBlocking(workerRef, {
        profileViews: increment(1),
        updatedAt: serverTimestamp()
      });
    }
  }, [workerRef]);

  const stats = useMemo(() => {
    const verifiedJobs = jobs?.filter(j => j.isVerified) || [];
    const avgRating = ratings && ratings.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 0;
    
    return {
      totalVerified: verifiedJobs.length,
      averageRating: avgRating.toFixed(1),
      trustScore: profile?.trustScore || 0
    };
  }, [jobs, ratings, profile]);

  if (isProfileLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Authenticating Professional Identity...</p>
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <div className="bg-destructive/10 p-6 rounded-full"><Star className="h-12 w-12 text-destructive" /></div>
      <h1 className="text-2xl font-black">Profile Not Found</h1>
      <p className="text-muted-foreground max-w-xs">This professional profile may have been removed or is currently private.</p>
      <Button asChild className="rounded-full mt-4"><Link href="/search">Find Other Pros</Link></Button>
    </div>
  );

  const isPro = profile.isPro || (profile.referralCount || 0) >= 10;

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 overflow-x-hidden">
      <Card className="border-none shadow-2xl overflow-hidden rounded-[3rem] relative">
        <div className="h-32 bg-primary/5 absolute top-0 left-0 right-0 -z-10" />
        <CardHeader className="pt-12 pb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 group">
            <Avatar className={cn("h-32 w-32 border-4 shadow-2xl", isPro ? "border-secondary" : "border-white")}>
              <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
              <AvatarFallback className="text-3xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            {isPro && (
              <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground p-2 rounded-full shadow-xl">
                <Crown className="h-5 w-5 fill-white" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
              {profile.name}
              <ShieldCheck className="h-6 w-6 text-primary" />
            </h1>
            <p className="text-primary font-bold uppercase tracking-widest text-sm">{profile.tradeSkill || "Verified Professional"}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <Badge variant="secondary" className="bg-primary/5 text-primary border-none py-1.5 px-4 rounded-full font-black text-[10px]">
                TRUST SCORE: {stats.trustScore}
              </Badge>
              {profile.isAvailable && (
                <Badge className="bg-green-500 text-white border-none py-1.5 px-4 rounded-full font-black text-[10px] animate-pulse">
                  AVAILABLE NOW
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-8 px-8 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 p-4 rounded-3xl text-center space-y-1 border border-primary/5">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Verified Jobs</p>
              <p className="text-xl font-black">{stats.totalVerified}</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-3xl text-center space-y-1 border border-primary/5">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Rating</p>
              <p className="text-xl font-black">{stats.averageRating}</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-3xl text-center space-y-1 border border-primary/5">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Experience</p>
              <p className="text-xl font-black">Expert</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-3xl text-center space-y-1 border border-primary/5">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Visibility</p>
              <p className="text-xl font-black">Global</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Professional Summary
            </h3>
            <p className="text-muted-foreground leading-relaxed font-medium">
              {profile.bio || "This professional is currently building their evidence-based reputation. Check back soon for full credentials."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Coverage Area
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.serviceAreas && profile.serviceAreas.length > 0 ? (
                  profile.serviceAreas.map((area: string) => (
                    <Badge key={area} variant="outline" className="rounded-xl border-2 font-bold px-3 py-1 bg-white">{area}</Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">National coverage across Malawi & Remote Global services.</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-black">Connect</h3>
              <div className="grid gap-2">
                {profile.whatsappNumber && (
                  <Button className="w-full rounded-full bg-[#25D366] hover:bg-[#128C7E] h-12 font-black shadow-xl" asChild>
                    <a href={`https://wa.me/${profile.whatsappNumber}`} target="_blank">
                      <WhatsAppIcon className="mr-2 h-5 w-5" /> Message on WhatsApp
                    </a>
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {profile.phoneNumber && (
                    <Button variant="outline" className="rounded-full border-2 h-12 font-black" asChild>
                      <a href={`tel:${profile.phoneNumber}`}><Phone className="mr-2 h-4 w-4" /> Call</a>
                    </Button>
                  )}
                  {profile.contactEmail && (
                    <Button variant="outline" className="rounded-full border-2 h-12 font-black" asChild>
                      <a href={`mailto:${profile.contactEmail}`}><Mail className="mr-2 h-4 w-4" /> Email</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">Verified Evidence</h2>
          <Badge variant="outline" className="font-black text-[10px]">{stats.totalVerified} Logs</Badge>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2">
          {jobs && jobs.length > 0 ? (
            jobs.filter(j => j.isVerified).map((job) => (
              <Card key={job.id} className="border-none shadow-md rounded-[2.5rem] overflow-hidden group">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img src={job.photoUrl} alt={job.title} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                  {job.aiVerified && (
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 shadow-xl">
                      <Sparkles className="h-3 w-3" /> AI VERIFIED
                    </div>
                  )}
                </div>
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-black text-lg leading-tight">{job.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Globe className="h-3.5 w-3.5" /> {formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed">
              <p className="text-muted-foreground font-medium italic">Portfolio verification in progress...</p>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center py-12 border-t">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Verified by Globlync Global • Dzenje Village</p>
      </footer>
    </div>
  );
}
