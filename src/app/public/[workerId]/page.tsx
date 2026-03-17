
"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  Loader2, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Briefcase,
  Users,
  ArrowLeft,
  Sparkles,
  Star,
  Crown
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

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
    return query(jobsRef, orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  const chatId = user && profile ? [user.uid, profile.id].sort().join("_") : null;

  if (isProfileLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Retrieving Reputation...</p>
    </div>
  );

  if (!profile) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
      <div className="bg-destructive/10 p-6 rounded-[2.5rem] mb-2">
        <Users className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-2xl font-black tracking-tight">Professional Not Found</h1>
      <p className="text-muted-foreground text-sm max-w-xs mx-auto">This professional profile may have been removed or the ID is incorrect.</p>
      <Button variant="outline" className="rounded-full mt-4" asChild><Link href="/search"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory</Link></Button>
    </div>
  );

  const verifiedJobs = jobs?.filter(j => j.isVerified) || [];

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 pb-32">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Professional Profile
            {profile.isPro && <Crown className="h-4 w-4 text-secondary fill-secondary" />}
          </h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">National Registry: @{profile.username}</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white text-center pt-8">
            <CardContent className="flex flex-col items-center gap-4 px-6">
              <Avatar className="h-32 w-32 border-4 border-primary/10 shadow-2xl">
                <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-2xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-black leading-none">{profile.name}</h2>
                <p className="text-primary font-bold text-sm uppercase tracking-tighter mt-1">{profile.tradeSkill || "General Professional"}</p>
              </div>
              <Badge variant={profile.isAvailable ? "default" : "secondary"} className="rounded-full px-4 font-black text-[10px] uppercase">
                {profile.isAvailable ? "Available for Projects" : "Currently Engaged"}
              </Badge>
              <div className="w-full h-px bg-muted mt-2" />
              <div className="grid grid-cols-2 w-full gap-4 py-2">
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Trust Score</p>
                  <p className="text-xl font-black">{profile.trustScore || 0}</p>
                </div>
                <div className="text-center border-l">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Verified Logs</p>
                  <p className="text-xl font-black">{verifiedJobs.length}</p>
                </div>
              </div>
            </CardContent>
            <div className="p-6 bg-primary/5">
              {chatId ? (
                <Button className="w-full rounded-full h-12 font-black shadow-lg" asChild>
                  <Link href={`/messages/${chatId}`}><MessageSquare className="mr-2 h-4 w-4" /> Secure Message</Link>
                </Button>
              ) : (
                <Button className="w-full rounded-full h-12 font-black shadow-lg" asChild>
                  <Link href="/login">Join to Message</Link>
                </Button>
              )}
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-muted/30 p-6 rounded-[2rem] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Service Districts
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.serviceAreas && profile.serviceAreas.length > 0 ? (
                profile.serviceAreas.map((area: string) => (
                  <Badge key={area} variant="outline" className="bg-white font-bold text-[9px]">{area}</Badge>
                ))
              ) : (
                <p className="text-[10px] font-medium text-muted-foreground italic">Available Nationwide</p>
              )}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Professional Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {profile.bio || `Evidence-based professional specialized in ${profile.tradeSkill || 'their field'}. Building a transparent reputation through verified work logs.`}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 px-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Verified Evidence Logs
            </h3>
            
            {isJobsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary/20" /></div>
            ) : verifiedJobs.length > 0 ? (
              <div className="grid gap-4">
                {verifiedJobs.map((job) => (
                  <Card key={job.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white hover:shadow-md transition-shadow group">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-lg group-hover:text-primary transition-colors">{job.title}</h4>
                            {job.aiVerified && (
                              <Badge className="bg-primary text-white text-[8px] font-black py-0.5 rounded-full">
                                <Sparkles className="h-2 w-2 mr-1" /> AI VERIFIED
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{job.description}</p>
                          <div className="flex items-center gap-3 pt-2">
                            <span className="text-[10px] font-black uppercase text-primary/60 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Verified Work
                            </span>
                            <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {job.completedAt ? formatDistanceToNow(new Date(job.completedAt), { addSuffix: true }) : "Recent"}
                            </span>
                          </div>
                        </div>
                        {job.photoUrl && (
                          <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-inner border shrink-0">
                            <img src={job.photoUrl} className="h-full w-full object-cover" alt="Proof of work" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-[2.5rem] border-4 border-dashed mx-2 flex flex-col items-center gap-4">
                <Briefcase className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No Verified logs yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
