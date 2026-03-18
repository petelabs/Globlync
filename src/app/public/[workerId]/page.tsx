
"use client";

import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy } from "firebase/firestore";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Users, 
  Loader2,
  Lock,
  MessageSquare,
  Sparkles,
  Trophy,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const db = useFirestore();

  const workerRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return doc(db, "workerProfiles", workerId);
  }, [db, workerId]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);

  const jobsQuery = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return query(
      collection(db, "workerProfiles", workerId, "jobs"), 
      where("isVerified", "==", true),
      orderBy("createdAt", "desc")
    );
  }, [db, workerId]);

  const { data: verifiedJobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Fetching Reputation Data...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
        <div className="bg-destructive/10 p-6 rounded-[2.5rem] mb-2">
          <Users className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">Professional Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">This profile may have been removed or the ID is incorrect.</p>
        <Button variant="outline" className="rounded-full mt-4" asChild><Link href="/search">Return to Directory</Link></Button>
      </div>
    );
  }

  const isPro = profile.isPro || profile.activeBenefits?.some((b: any) => new Date(b.expiresAt) > new Date());

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto px-4 pb-32">
      <header className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="relative group">
          <Avatar className={cn("h-40 w-40 border-4 shadow-2xl", isPro ? "border-secondary" : "border-primary")}>
            <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {isPro && (
            <div className="absolute -top-2 -right-2 bg-secondary p-3 rounded-full shadow-xl border-4 border-white animate-float">
              <Trophy className="h-6 w-6 text-secondary-foreground fill-secondary-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-4xl font-black tracking-tighter flex items-center gap-2 justify-center md:justify-start">
                {profile.name}
                {isPro && <Badge className="bg-secondary text-secondary-foreground font-black text-[10px] uppercase">Verified Pro</Badge>}
              </h1>
              <p className="text-primary font-black text-lg uppercase tracking-tight">@{profile.username}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <Briefcase className="h-4 w-4 text-primary/60" />
                {profile.tradeSkill || "General Professional"}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <MapPin className="h-4 w-4 text-primary/60" />
                Malawi
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {profile.trustScore || 0} Trust Score
              </div>
            </div>
          </div>

          <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl text-lg">
            {profile.bio || "This professional is building an evidence-based reputation on Globlync. Verified work logs are available below."}
          </p>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
            <Button className="rounded-full font-black px-10 h-14 shadow-xl" asChild>
              <Link href="/messages"><MessageSquare className="mr-2 h-5 w-5" /> Secure Message (Soon)</Link>
            </Button>
            <Button variant="outline" className="rounded-full font-black px-10 h-14 border-2" asChild>
              <Link href="/referrals">Invite Colleagues</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-primary/5 p-8 text-center space-y-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm w-fit mx-auto">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-xl">Identity Verified</h3>
              <p className="text-xs text-muted-foreground font-medium">This professional is a registered member of the Malawi National Directory.</p>
            </div>
          </Card>

          {profile.badgeIds && profile.badgeIds.length > 0 && (
            <Card className="border-none shadow-sm rounded-[2.5rem] p-8">
              <CardHeader className="p-0 mb-4"><CardTitle className="text-sm font-black uppercase flex items-center gap-2"><Award className="h-4 w-4 text-secondary" /> Earned Badges</CardTitle></CardHeader>
              <div className="flex flex-wrap gap-2">
                {profile.badgeIds.map((bid: string) => (
                  <Badge key={bid} className="bg-secondary/10 text-secondary border-secondary/20 font-black px-3 py-1 uppercase text-[9px] rounded-lg">
                    {bid.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Clock className="h-5 w-5" /> Verified Evidence Timeline
            </h2>
            <Badge variant="secondary" className="font-black text-[10px]">{verifiedJobs?.length || 0} Logs</Badge>
          </div>

          <div className="space-y-4">
            {isJobsLoading ? (
              [1, 2].map(i => <Card key={i} className="h-32 animate-pulse bg-muted/20 border-none rounded-3xl" />)
            ) : verifiedJobs && verifiedJobs.length > 0 ? (
              verifiedJobs.map((job) => (
                <Card key={job.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden group">
                  <CardContent className="p-6 flex gap-6">
                    {job.photoUrl && (
                      <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 border shadow-inner">
                        <img src={job.photoUrl} alt="Evidence" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-lg leading-none">{job.title}</h4>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          {job.createdAt ? format(new Date(job.createdAt.seconds * 1000), 'MMM yyyy') : 'Recently'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-1 text-green-600 font-black text-[9px] uppercase tracking-tighter">
                          <CheckCircle2 className="h-3 w-3" /> AI Verified Evidence
                        </div>
                        {job.aiVerified && (
                          <div className="flex items-center gap-1 text-primary font-black text-[9px] uppercase tracking-tighter">
                            <Sparkles className="h-3 w-3" /> High Quality Match
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-[2.5rem] border-4 border-dashed flex flex-col items-center gap-4">
                <Lock className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No verified evidence logs yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
