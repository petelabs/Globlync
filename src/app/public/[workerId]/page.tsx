
"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  Award, 
  History, 
  Sparkles,
  Share2,
  Facebook,
  MessageSquare,
  Twitter,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(10));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = (platform: string) => {
    let url = "";
    const text = `Check out ${profile?.name}'s verified professional reputation on Globlync!`;
    
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    window.open(url, '_blank');
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
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-4 max-w-2xl mx-auto px-4">
      {/* Profile Header */}
      <header className="flex flex-col items-center text-center gap-4">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-primary shadow-xl">
            <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
            <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full border-4 border-background">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">{profile.name}</h1>
          <p className="text-primary font-bold uppercase tracking-widest text-sm">{profile.tradeSkill}</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/20">
          <span className="text-2xl font-black text-primary">{profile.trustScore || 0}</span>
          <div className="text-[10px] text-left leading-none uppercase font-black text-muted-foreground">
            Trust<br />Score
          </div>
        </div>
      </header>

      {/* Social Sharing Section */}
      <Card className="border-none bg-primary/5 shadow-sm">
        <CardContent className="p-4 flex flex-col items-center gap-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Share2 className="h-3 w-3" /> Share This Reputation
          </h3>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12 border-primary/20 bg-white" 
              onClick={() => handleShare('whatsapp')}
            >
              <MessageSquare className="h-5 w-5 text-green-600" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12 border-primary/20 bg-white"
              onClick={() => handleShare('facebook')}
            >
              <Facebook className="h-5 w-5 text-blue-600" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-12 w-12 border-primary/20 bg-white"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="h-5 w-5 text-sky-500" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      {profile.bio && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Professional Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Verified History */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" /> Verified Work History
        </h2>
        <div className="grid gap-4">
          {isJobsLoading ? (
            <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : jobs && jobs.length > 0 ? (
            jobs.filter(j => j.isVerified).map((job) => (
              <Card key={job.id} className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  {job.photoUrl && (
                    <div className="w-full sm:w-32 h-24 shrink-0 bg-muted">
                      <img src={job.photoUrl} alt={job.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold">{job.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{job.description}</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-primary">
                        <Star className="h-3 w-3 fill-primary" />
                        <span className="text-xs font-bold">5.0</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[8px] uppercase tracking-tighter">Verified Client</Badge>
                      {job.aiVerified && (
                        <Badge variant="secondary" className="text-[8px] bg-primary/10 text-primary border-none">
                          <Sparkles className="h-2 w-2 mr-1" /> AI Confirmed
                        </Badge>
                      )}
                      <span className="text-[8px] text-muted-foreground font-bold ml-auto">
                        {format(new Date(job.dateCompleted), "MMM yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-2xl border-2 border-dashed">
              <p className="text-sm text-muted-foreground">No verified jobs displayed yet.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center py-8">
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
          Globlync • Powered by Petediano Tech
        </p>
      </footer>
    </div>
  );
}
