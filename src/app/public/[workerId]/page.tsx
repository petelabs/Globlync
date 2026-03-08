
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, increment, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Briefcase, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  MessageCircle,
  Share2,
  Sparkles,
  Trophy,
  Award,
  Zap,
  Globe
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

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs } = useCollection(useMemoFirebase(() => query(jobsRef!, orderBy("createdAt", "desc"), limit(10)), [jobsRef]));
  const { data: ratings } = useCollection(useMemoFirebase(() => query(ratingsRef!, orderBy("ratedAt", "desc"), limit(5)), [ratingsRef]));

  useEffect(() => {
    if (workerRef && !hasIncremented) {
      updateDocumentNonBlocking(workerRef, { profileViews: increment(1) });
      setHasIncremented(true);
    }
  }, [workerRef, hasIncremented]);

  if (isProfileLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  );

  if (!profile) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
      <ShieldCheck className="h-16 w-16 text-muted-foreground opacity-20" />
      <h1 className="text-2xl font-black">Profile Not Found</h1>
      <p className="text-muted-foreground">The professional you are looking for might have moved or changed their link.</p>
      <Button variant="outline" className="rounded-full" asChild><Link href="/">Return to Globlync</Link></Button>
    </div>
  );

  const avgRating = ratings?.length 
    ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
    : 0;

  return (
    <div className="flex flex-col gap-12 py-10 max-w-5xl mx-auto px-4 overflow-x-hidden">
      <header className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
        <div className="relative group">
          <Avatar className={cn("h-40 w-40 border-8 border-white shadow-2xl", profile.isPro ? "ring-4 ring-secondary" : "ring-4 ring-primary/10")}>
            <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {profile.isPro && (
            <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground p-2 rounded-full shadow-xl animate-bounce">
              <Crown className="h-6 w-6 fill-secondary-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground leading-none">{profile.name}</h1>
            <p className="text-primary font-black uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2">
              <Briefcase className="h-4 w-4" /> {profile.tradeSkill || "Verified Professional"}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none py-1.5 px-4 rounded-full font-black text-xs">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Trust Score: {profile.trustScore || 0}
            </Badge>
            <Badge variant="outline" className="py-1.5 px-4 rounded-full font-black text-xs border-2">
              <Star className="h-3.5 w-3.5 mr-1.5 text-secondary fill-secondary" /> {avgRating.toFixed(1)} Rating
            </Badge>
            {profile.isAvailable && (
              <Badge className="bg-green-500 text-white border-none py-1.5 px-4 rounded-full font-black text-xs">
                Available Now
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {profile.whatsappNumber && (
              <Button className="rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black px-8 h-12 shadow-lg" asChild>
                <a href={`https://wa.me/${profile.whatsappNumber}`} target="_blank">
                  <WhatsAppIcon className="mr-2 h-5 w-5" /> Connect on WhatsApp
                </a>
              </Button>
            )}
            <Button variant="outline" className="rounded-full border-2 font-black px-8 h-12" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Profile link copied!");
            }}>
              <Share2 className="mr-2 h-4 w-4" /> Share Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8 space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" /> Professional Summary
            </h2>
            <Card className="border-none shadow-sm bg-muted/20 rounded-[2rem] p-8">
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                {profile.bio || "This professional is currently updating their summary. Check back soon for more details on their expertise and global reach."}
              </p>
              {profile.serviceAreas && profile.serviceAreas.length > 0 && (
                <div className="mt-6 pt-6 border-t border-muted-foreground/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Service Coverage</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.serviceAreas.map((area: string) => (
                      <Badge key={area} variant="outline" className="bg-white/50 py-1 px-3 rounded-xl font-bold border-muted">
                        <MapPin className="h-3 w-3 mr-1 text-primary" /> {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" /> Verified Evidence Log
            </h2>
            <div className="grid gap-4">
              {jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden border-none shadow-sm group hover:shadow-xl transition-all rounded-[2rem] bg-white">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="relative aspect-video w-full sm:w-56 bg-muted shrink-0 overflow-hidden">
                        <img src={job.photoUrl || `https://picsum.photos/seed/${job.id}/400/300`} alt={job.title} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                        {job.aiVerified && (
                          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                            <Sparkles className="h-3 w-3" /> AI VERIFIED
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-black text-xl group-hover:text-primary transition-colors leading-tight">{job.title}</h3>
                          {job.isVerified && (
                            <div className="bg-green-500/10 text-green-600 p-1.5 rounded-full"><CheckCircle2 className="h-5 w-5" /></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{job.description}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg">
                            {new Date(job.dateCompleted).toLocaleDateString()}
                          </Badge>
                          <span className="text-[10px] font-black uppercase text-primary/40 tracking-tighter">Reference #{job.id.substring(0,6)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/10 rounded-[2rem] border-2 border-dashed">
                  <p className="text-muted-foreground font-medium">No verified jobs logged yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-primary text-primary-foreground relative group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Award className="h-24 w-24" />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-4 w-4 text-secondary fill-secondary" /> Trust Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="grid gap-3">
                {profile.badgeIds && profile.badgeIds.length > 0 ? (
                  profile.badgeIds.map((bid: string) => (
                    <div key={bid} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <div className="bg-secondary p-2 rounded-xl text-secondary-foreground shadow-sm">
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-tight">{bid.replace('-', ' ')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs opacity-70 italic">Starting professional journey...</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <Star className="h-5 w-5 text-secondary fill-secondary" /> Recent Ratings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {ratings && ratings.length > 0 ? (
                ratings.map((r) => (
                  <div key={r.id} className="space-y-2 pb-4 border-b last:border-none last:pb-0">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("h-3 w-3", i < r.score ? "text-secondary fill-secondary" : "text-muted")} />
                      ))}
                    </div>
                    <p className="text-xs font-medium italic leading-relaxed text-muted-foreground">"{r.comment || 'Quality professional service.'}"</p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
                      {r.ratedAt?.seconds ? formatDistanceToNow(new Date(r.ratedAt.seconds * 1000), { addSuffix: true }) : 'Recently'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center text-muted-foreground italic">No ratings yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="bg-muted/30 p-8 rounded-[2.5rem] text-center space-y-4">
            <Badge variant="outline" className="bg-white border-2 py-1 px-4 rounded-full font-black text-[9px] uppercase tracking-widest text-primary/60">
              Verified by Globlync AI
            </Badge>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              This profile has {profile.profileViews || 0} professional views and {jobs?.length || 0} pieces of verifiable evidence.
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center py-10 border-t mt-12">
        <Logo className="scale-75 justify-center mb-4 grayscale opacity-30" />
        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em]">
          Global Professional Evidence Standard • Est. 2026
        </p>
      </footer>
    </div>
  );
}
