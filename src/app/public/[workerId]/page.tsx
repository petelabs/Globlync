
"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MessageSquare,
  ArrowLeft,
  Award,
  Sparkles,
  Briefcase,
  Share2,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const MILESTONE_BADGES: Record<string, { name: string; icon: any; color: string }> = {
  'first-job': { name: "First Verified Job", icon: Award, color: "text-blue-500" },
  'reliable-worker': { name: "Reliable Pro", icon: Award, color: "text-primary" },
  'perfect-streak': { name: "Customer Favorite", icon: Award, color: "text-secondary" },
  'growth-champion': { name: "Growth Champion", icon: Award, color: "text-pink-500" },
};

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const db = useFirestore();
  const router = useRouter();
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

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(10));
  }, [jobsRef]);

  const { data: profile } = useDoc(workerRef);
  const { data: jobs } = useCollection(verifiedJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const stats = useMemo(() => {
    const verifiedJobs = jobs?.filter(j => j.isVerified) || [];
    const avgRating = ratings?.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 5.0;
    
    return {
      totalVerified: verifiedJobs.length,
      averageRating: avgRating.toFixed(1),
      trustScore: profile?.trustScore || 0,
      tier: (profile?.trustScore || 0) > 100 ? "Platinum" : (profile?.trustScore || 0) > 50 ? "Gold" : "Bronze",
    };
  }, [jobs, ratings, profile]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verified Reputation: ${profile?.name}`,
          text: `Check out ${profile?.name}'s evidence-based professional profile on Globlync!`,
          url: url,
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link Copied!" });
    }
  };

  if (!profile) return null;

  const cleanWhatsApp = profile.whatsappNumber?.replace(/\s+/g, '') || "";
  const waLink = `https://wa.me/${cleanWhatsApp}`;

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto px-4">
      <header className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
        </div>
      </header>

      {/* Hero Card */}
      <Card className="border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-card">
        <div className="bg-primary p-8 md:p-12 flex flex-col items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="h-48 w-48" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${workerId}/300/300`} />
                <AvatarFallback className="text-4xl">{profile.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground p-2 rounded-full shadow-lg border-4 border-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-black tracking-tighter text-white">{profile.name}</h1>
              <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-xs">
                {profile.tradeSkill || "Skilled Professional"}
              </p>
            </div>
            <Badge variant={profile.isAvailable ? "secondary" : "outline"} className={cn(
              "rounded-full px-6 py-1 font-bold",
              profile.isAvailable ? "bg-secondary text-secondary-foreground" : "text-white border-white/40"
            )}>
              {profile.isAvailable ? "Available Now" : "Currently Busy"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-8 grid grid-cols-3 gap-4 border-b">
          <div className="text-center space-y-1">
            <p className="text-2xl font-black text-primary">{stats.trustScore}</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Trust Score</p>
          </div>
          <div className="text-center space-y-1 border-x">
            <p className="text-2xl font-black text-primary">{stats.totalVerified}</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Jobs Done</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-black text-primary">{stats.averageRating}</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Avg Star</p>
          </div>
        </CardContent>

        <CardContent className="p-8 space-y-8">
          {/* Bio */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">About the Professional</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {profile.bio || "This professional is building their reputation through high-quality work and AI-verified job logs."}
            </p>
          </div>

          {/* Service Areas */}
          {profile.serviceAreas && profile.serviceAreas.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Service Areas</h3>
              <div className="flex flex-wrap gap-2">
                {profile.serviceAreas.map(area => (
                  <Badge key={area} variant="outline" className="rounded-full bg-muted/30 border-none px-4 py-1.5 text-xs font-medium">
                    <MapPin className="h-3 w-3 mr-1 text-primary" /> {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {profile.badgeIds && profile.badgeIds.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Achievements</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {profile.badgeIds.map(badgeId => {
                  const badge = MILESTONE_BADGES[badgeId];
                  if (!badge) return null;
                  const Icon = badge.icon;
                  return (
                    <div key={badgeId} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/30 border min-w-[100px] text-center">
                      <Icon className={cn("h-8 w-8", badge.color)} />
                      <span className="text-[10px] font-black leading-tight uppercase">{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-8 pt-0 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Button className="rounded-full h-14 font-black text-lg bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl" asChild>
              <a href={waLink} target="_blank">
                <WhatsAppIcon className="h-6 w-6 mr-2" /> WhatsApp
              </a>
            </Button>
            <Button className="rounded-full h-14 font-black text-lg shadow-xl" asChild>
              <a href={`tel:${profile.phoneNumber}`}>
                <Phone className="h-5 w-5 mr-2" /> Call Now
              </a>
            </Button>
          </div>
          {profile.contactEmail && (
            <Button variant="outline" className="rounded-full h-12 font-bold border-muted" asChild>
              <a href={`mailto:${profile.contactEmail}`}>
                <Mail className="h-4 w-4 mr-2" /> Email
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Evidence Gallery */}
      <section className="space-y-4 mt-4">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Evidence Gallery
        </h2>
        <div className="grid gap-4">
          {jobs && jobs.filter(j => j.isVerified).length > 0 ? (
            jobs.filter(j => j.isVerified).map((job) => (
              <Card key={job.id} className="overflow-hidden border-none shadow-lg group">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0">
                    <img src={job.photoUrl || `https://picsum.photos/seed/${job.id}/400/300`} alt={job.title} className="h-full w-full object-cover" />
                    {job.aiVerified && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-md uppercase tracking-widest">
                        <Sparkles className="h-2 w-2" /> AI Verified
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col justify-center flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-black text-lg text-primary">{job.title}</h3>
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 italic">"{job.description}"</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <Clock className="h-3 w-3" /> 
                      {formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground font-medium">No verified jobs yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Ratings Section */}
      {ratings && ratings.length > 0 && (
        <section className="space-y-4 mt-4">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Star className="h-5 w-5 text-secondary fill-secondary" />
            Client Feedback
          </h2>
          <div className="grid gap-4">
            {ratings.map((r) => (
              <Card key={r.id} className="border-none shadow-sm bg-accent/30">
                <CardContent className="p-5 space-y-3">
                  <div className="flex text-secondary">
                    {[...Array(r.score)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm italic text-muted-foreground">"{r.comment || "Great work, very professional!"}"</p>
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Verified Client</span>
                    <span>{r.ratedAt?.seconds ? formatDistanceToNow(new Date(r.ratedAt.seconds * 1000), { addSuffix: true }) : "recently"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <footer className="text-center py-12 mt-8 space-y-4">
        <div className="flex justify-center mb-6 opacity-30 grayscale hover:grayscale-0 transition-all">
          <img src="/logo.png" alt="Globlync" className="h-8 object-contain" />
        </div>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">
          Evidence-Based Reputation • Malawi
        </p>
        <div className="flex justify-center gap-8 text-[10px] font-bold text-primary/50 uppercase tracking-widest">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
