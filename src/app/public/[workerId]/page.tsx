
"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  Award,
  CheckCircle2,
  Sparkles,
  Loader2,
  ExternalLink,
  Share2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const MILESTONE_BADGES: Record<string, { name: string; icon: any; color: string }> = {
  'first-job': { name: "Verified Pro", icon: Award, color: "text-blue-500 bg-blue-500/10" },
  'reliable-worker': { name: "Reliable", icon: ShieldCheck, color: "text-primary bg-primary/10" },
  'perfect-streak': { name: "Top Rated", icon: Star, color: "text-secondary bg-secondary/10" },
  'growth-champion': { name: "Community Leader", icon: Sparkles, color: "text-pink-500 bg-pink-500/10" },
};

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

  const jobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(10));
  }, [jobsRef]);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name} - Verified Professional`,
          text: `Check out the evidence-based reputation of ${profile?.name} on Globlync.`,
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link Copied" });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied" });
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 px-6">
        <h1 className="text-2xl font-bold">Professional Profile Not Found</h1>
        <p className="text-muted-foreground mt-2">This link may be broken or the profile has been set to private.</p>
        <Button className="mt-6 rounded-full" asChild><Link href="/">Go to Home</Link></Button>
      </div>
    );
  }

  const avgRating = ratings?.length 
    ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
    : 5.0;

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto px-4">
      <header className="relative flex flex-col items-center text-center gap-6 pt-12">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50 backdrop-blur" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative">
          <Avatar className="h-40 w-40 border-8 border-white shadow-2xl">
            <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/300/300`} />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary font-black">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 right-4 bg-primary text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-black shadow-xl border-4 border-white">
            <ShieldCheck className="h-4 w-4" /> {profile.trustScore || 0}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter">{profile.name}</h1>
          <p className="text-primary font-bold uppercase tracking-widest text-xs">@{profile.username}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="rounded-full font-black px-4 bg-primary/10 text-primary border-primary/20">
              {profile.tradeSkill || "Skilled Professional"}
            </Badge>
            {profile.isAvailable ? (
              <Badge variant="default" className="rounded-full font-black px-4 bg-green-500 hover:bg-green-600">Available Now</Badge>
            ) : (
              <Badge variant="outline" className="rounded-full font-black px-4">Currently Busy</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full max-w-sm mt-4 p-6 bg-muted/30 rounded-[2.5rem] border">
          <div className="flex flex-col items-center">
            <span className="text-xl font-black">{jobs?.filter(j => j.isVerified).length || 0}</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Verified</span>
          </div>
          <div className="flex flex-col items-center border-x border-muted-foreground/20">
            <span className="text-xl font-black">{avgRating.toFixed(1)}</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Rating</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black">{profile.referralCount || 0}</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Vouched</span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-lg flex items-center gap-2"><Phone className="h-5 w-5" /> Direct Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid gap-4">
              {profile.whatsappNumber && (
                <Button className="w-full h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-lg shadow-lg" asChild>
                  <a href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank">
                    Message WhatsApp
                  </a>
                </Button>
              )}
              {profile.phoneNumber && (
                <Button variant="outline" className="w-full h-14 rounded-full border-2 font-black text-lg" asChild>
                  <a href={`tel:${profile.phoneNumber}`}>Call Professional</a>
                </Button>
              )}
              {profile.contactEmail && (
                <Button variant="ghost" className="w-full h-12 rounded-full font-bold text-sm" asChild>
                  <a href={`mailto:${profile.contactEmail}`}>Send Email</a>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-lg">Service Areas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.serviceAreas?.length > 0 ? (
                profile.serviceAreas.map(area => (
                  <Badge key={area} variant="secondary" className="bg-muted px-3 py-1 text-[10px] font-bold">{area}</Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Available across Malawi.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8 space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-lg">Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed italic">
                "{profile.bio || `Building a trusted career in ${profile.tradeSkill || 'manual labor'}. I focus on quality and reliability.`}"
              </p>
              {profile.badgeIds?.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-4">
                  {profile.badgeIds.map(id => {
                    const badge = MILESTONE_BADGES[id];
                    if (!badge) return null;
                    const Icon = badge.icon;
                    return (
                      <div key={id} className={cn("flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm", badge.color)}>
                        <Icon className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{badge.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h2 className="text-2xl font-black px-2">Verified Job Evidence</h2>
            <div className="grid gap-4">
              {isJobsLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>
              ) : jobs && jobs.length > 0 ? (
                jobs.map(job => (
                  <Card key={job.id} className="overflow-hidden border-none shadow-xl rounded-[2rem] group transition-transform hover:scale-[1.01]">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 aspect-video sm:aspect-square bg-muted relative">
                        <img 
                          src={job.photoUrl || `https://picsum.photos/seed/${job.id}/300/300`} 
                          alt={job.title} 
                          className="h-full w-full object-cover" 
                        />
                        {job.aiVerified && (
                          <div className="absolute top-2 left-2 bg-primary text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1 shadow-lg">
                            <Sparkles className="h-3 w-3" /> AI Proof
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6 flex-1 flex flex-col justify-center">
                        <div className="flex items-start justify-between">
                          <h3 className="font-black text-xl leading-tight mb-1">{job.title}</h3>
                          {job.isVerified && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{job.description}</p>
                        <div className="mt-auto flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}</span>
                          <span className="text-primary">Verified Completion</span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed">
                  <p className="text-muted-foreground font-bold">No evidence logs shared yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <footer className="text-center py-12 border-t mt-12">
        <Logo className="scale-75 justify-center mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          Verified by Globlync Reputation Engine • Mulanje, Malawi
        </p>
      </footer>
    </div>
  );
}
