"use client";

import { useParams } from "next/navigation";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Briefcase, 
  CheckCircle2, 
  MessageSquare, 
  Share2, 
  Clock,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

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

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  if (isProfileLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold">Worker Not Found</h1>
        <p className="text-muted-foreground mt-2">This professional profile may have been removed or is private.</p>
        <Button className="mt-6 rounded-full" asChild><Link href="/search">Find Other Pros</Link></Button>
      </div>
    );
  }

  const verifiedJobs = jobs?.filter(j => j.isVerified) || [];
  const avgRating = ratings?.length 
    ? (ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length).toFixed(1)
    : "5.0";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} | Verified ${profile.tradeSkill}`,
          text: `Check out ${profile.name}'s professional reputation on Globlync.`,
          url: window.location.href,
        });
      } catch (e) {}
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto px-4">
      {/* Profile Header */}
      <section className="relative">
        <div className="h-32 w-full bg-primary/10 rounded-[2rem] overflow-hidden shadow-inner">
          <div className="absolute top-4 right-4 flex gap-2">
             <Button size="icon" variant="secondary" className="rounded-full shadow-lg h-10 w-10 bg-white/90" onClick={handleShare}>
               <Share2 className="h-4 w-4" />
             </Button>
          </div>
        </div>
        
        <div className="px-6 -mt-12 flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row sm:gap-6">
          <Avatar className="h-32 w-32 border-4 border-background shadow-2xl bg-muted">
            <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/200/200`} />
            <AvatarFallback className="text-2xl font-bold">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="mt-4 sm:mt-14 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-3xl font-black tracking-tight">{profile.name}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-full">
                <ShieldCheck className="h-3 w-3 mr-1" /> Verified Pro
              </Badge>
            </div>
            <p className="text-primary font-bold uppercase tracking-wider text-sm mt-1">{profile.tradeSkill || "Skilled Professional"}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile.serviceAreas?.[0] || "Malawi"}</span>
              <span className="flex items-center gap-1 text-secondary"><Star className="h-3 w-3 fill-secondary" /> {avgRating} Rating</span>
              <span className="flex items-center gap-1 text-primary"><CheckCircle2 className="h-3 w-3" /> {verifiedJobs.length} Jobs</span>
            </div>
          </div>

          <div className="mt-6 sm:mt-14">
            <Button className="rounded-full px-8 h-12 shadow-lg font-bold" asChild>
              <a href={`https://wa.me/0987066051?text=I%20found%20${profile.name}%20on%20Globlync%20and%20would%20like%20to%20hire%20them.`} target="_blank">
                <MessageSquare className="mr-2 h-4 w-4" /> Contact Pro
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Stats & Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-lg">About</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "{profile.bio || "Building trust through quality manual labor across Malawi."}"
              </p>
              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Trust Score</span>
                  <span className="text-xl font-black text-primary">{profile.trustScore || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</span>
                  <Badge variant={profile.isAvailable ? "default" : "secondary"}>
                    {profile.isAvailable ? "Available" : "Busy"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-lg">Service Areas</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.serviceAreas && profile.serviceAreas.length > 0 ? (
                profile.serviceAreas.map(area => (
                  <Badge key={area} variant="outline" className="rounded-full font-bold">{area}</Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Operating across Malawi</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Evidence Gallery */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Verified Work Log
              <Badge className="bg-secondary text-secondary-foreground font-black">{verifiedJobs.length}</Badge>
            </h2>
          </div>

          <div className="grid gap-4">
            {isJobsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>
            ) : verifiedJobs.length > 0 ? (
              verifiedJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden border-none shadow-sm group hover:shadow-md transition-shadow">
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0 overflow-hidden">
                      <img 
                        src={job.photoUrl || `https://picsum.photos/seed/${job.id}/400/300`} 
                        alt={job.title} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                      />
                      {job.aiVerified && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-white/20">
                          <CheckCircle2 className="h-2.5 w-2.5" /> AI VERIFIED
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
                      <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-16 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground font-medium">No verified work history to display yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
