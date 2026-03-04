
"use client";

import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Award, 
  Phone, 
  Mail, 
  Share2,
  ArrowLeft,
  Loader2,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MILESTONE_BADGES: Record<string, { name: string; icon: any; color: string }> = {
  'first-job': { name: "Verified Pro", icon: Award, color: "text-blue-500 bg-blue-500/10" },
  'reliable-worker': { name: "High Reliability", icon: ShieldCheck, color: "text-primary bg-primary/10" },
  'perfect-streak': { name: "Customer Favorite", icon: Star, color: "text-secondary bg-secondary/10" },
};

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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

  const jobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(20));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const avgRating = ratings?.length 
    ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
    : 5.0;

  const shareProfile = async () => {
    const shareData = {
      title: `${profile?.name} - Verified Professional`,
      text: `Check out the verified reputation of ${profile?.name} on Globlync. Building a safer labor market in Malawi.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) { copyToClipboard(); }
    } else { copyToClipboard(); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Profile Link Copied" });
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
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <h1 className="text-2xl font-bold">Worker Not Found</h1>
        <p className="text-muted-foreground mt-2">The profile you are looking for does not exist or has been moved.</p>
        <Button className="mt-6 rounded-full" onClick={() => router.push("/search")}>Search Professionals</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-6">
      <header className="relative">
        <div className="h-40 w-full bg-primary/10 rounded-[2.5rem] mb-[-5rem]" />
        <div className="px-6 flex flex-col items-center text-center">
          <Avatar className="h-32 w-32 border-8 border-background shadow-xl">
            <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/300/300`} />
            <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl uppercase">
              {profile.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="mt-4 space-y-2">
            <h1 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
              {profile.name}
              <CheckCircle2 className="h-6 w-6 text-primary fill-primary/10" />
            </h1>
            <p className="text-primary font-black uppercase tracking-widest text-[10px]">@{profile.username}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30 font-black">
                {profile.tradeSkill || "Verified Professional"}
              </Badge>
              {profile.isAvailable ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">Available Now</Badge>
              ) : (
                <Badge variant="outline">Busy</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 px-2">
        <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-3xl border text-center">
          <span className="text-2xl font-black text-primary">{profile.trustScore || 0}</span>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Trust Score</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-3xl border text-center">
          <span className="text-2xl font-black text-secondary">{avgRating.toFixed(1)}</span>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Avg Rating</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-3xl border text-center">
          <span className="text-2xl font-black text-primary">{jobs?.filter(j => j.isVerified).length || 0}</span>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Verified Jobs</span>
        </div>
      </div>

      <div className="flex gap-2 px-2">
        <Button className="flex-1 rounded-full h-14 font-black shadow-lg" onClick={shareProfile}>
          <Share2 className="mr-2 h-4 w-4" /> Share Portfolio
        </Button>
        <Button variant="outline" className="h-14 w-14 rounded-full border-2" onClick={copyToClipboard}>
          <ExternalLink className="h-5 w-5" />
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-[2rem] bg-accent/30">
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
          <CardDescription>Verified contact points for direct hiring.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {profile.whatsappNumber && (
              <Button className="flex-1 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black h-12" asChild>
                <a href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank">
                  <WhatsAppIcon className="mr-2 h-5 w-5" /> WhatsApp
                </a>
              </Button>
            )}
            {profile.phoneNumber && (
              <Button variant="outline" className="flex-1 rounded-full border-primary text-primary font-black h-12 bg-white" asChild>
                <a href={`tel:${profile.phoneNumber}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call Directly
                </a>
              </Button>
            )}
          </div>
          {profile.contactEmail && (
            <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:bg-white/50" asChild>
              <a href={`mailto:${profile.contactEmail}`}>
                <Mail className="mr-2 h-3 w-3" /> {profile.contactEmail}
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6 px-2">
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Professional Bio
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed italic bg-muted/10 p-6 rounded-3xl border border-dashed">
            "{profile.bio || "This professional is dedicated to building a high-trust reputation through verified manual work in Malawi."}"
          </p>
        </div>

        {profile.badgeIds && profile.badgeIds.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Earned Badges</h2>
            <div className="flex flex-wrap gap-3">
              {profile.badgeIds.map((bid: string) => {
                const badge = MILESTONE_BADGES[bid];
                if (!badge) return null;
                return (
                  <div key={bid} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm", badge.color)}>
                    <badge.icon className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-tight">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {profile.serviceAreas && profile.serviceAreas.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Service Districts
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.serviceAreas.map((area: string) => (
                <Badge key={area} variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-primary/10">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Verified Job Gallery
          </h2>
          {isJobsLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="border-none shadow-md overflow-hidden bg-card group">
                  <div className="relative aspect-video bg-muted">
                    <img src={job.photoUrl || `https://picsum.photos/seed/${job.id}/400/250`} alt={job.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {job.isVerified && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                        <ShieldCheck className="h-3 w-3" /> VERIFIED
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-sm">{job.title}</h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{job.description}</p>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-[8px] font-bold uppercase text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-2 w-2" /> {formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed">
              <p className="text-sm text-muted-foreground">No public work logs available yet.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center py-12 border-t mt-8">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-2">Verified by Globlync AI</p>
        <div className="flex justify-center items-center gap-2">
          <ShieldCheck className="h-3 w-3 text-primary" />
          <p className="text-[9px] font-bold text-primary/60">Evidence-Based Reputation Network</p>
        </div>
      </footer>
    </div>
  );
}
