
"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Star, 
  TrendingUp, 
  QrCode, 
  Award,
  Users,
  Gift,
  Crown,
  Zap,
  ShieldCheck,
  Medal,
  ThumbsUp,
  Lightbulb,
  ArrowRight,
  Loader2,
  Eye,
  Briefcase,
  Trophy,
  ChevronRight,
  ClipboardCheck
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { generateDailyTip, DailyTipOutput } from "@/ai/flows/generate-daily-tip-flow";

const MILESTONE_BADGES: Record<string, { name: string; icon: any; color: string; description: string }> = {
  'first-job': { 
    name: "First Verified Job", 
    icon: Medal, 
    color: "text-blue-500 bg-blue-500/10",
    description: "Successfully completed and verified your first job log."
  },
  'reliable-worker': { 
    name: "Reliable Pro", 
    icon: ShieldCheck, 
    color: "text-primary bg-primary/10",
    description: "Maintained a high trust score across 5+ verified jobs."
  },
  'perfect-streak': { 
    name: "Customer Favorite", 
    icon: ThumbsUp, 
    color: "text-secondary bg-secondary/10",
    description: "Received a 5-star rating on multiple consecutive jobs."
  },
  'growth-champion': { 
    name: "Growth Leader", 
    icon: Users, 
    color: "text-pink-500 bg-pink-500/10",
    description: "Invited 5+ peers to build the Globlync community."
  },
};

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [dailyTip, setDailyTip] = useState<DailyTipOutput | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(false);

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "jobs");
  }, [db, user?.uid]);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "ratings");
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);
  const { data: allJobs } = useCollection(jobsRef);
  const { data: ratings } = useCollection(ratingsRef);

  useEffect(() => {
    if (profile?.tradeSkill) {
      setIsTipLoading(true);
      generateDailyTip({ trade: profile.tradeSkill })
        .then(setDailyTip)
        .finally(() => setIsTipLoading(false));
    }
  }, [profile?.tradeSkill]);

  const isPro = profile?.activeBenefits?.some(b => new Date(b.expiresAt) > new Date()) || (profile?.referralCount || 0) >= 10;

  const stats = useMemo(() => {
    const verifiedJobs = allJobs?.filter(j => j.isVerified) || [];
    const avgRating = ratings?.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 0;
    
    return {
      totalVerified: verifiedJobs.length,
      averageRating: avgRating.toFixed(1),
      trustScore: profile?.trustScore || 0,
      profileViews: profile?.profileViews || 0,
      tier: (profile?.trustScore || 0) > 100 ? "Platinum" : (profile?.trustScore || 0) > 50 ? "Gold" : "Bronze",
      badges: profile?.badgeIds || [],
      referrals: profile?.referralCount || 0
    };
  }, [allJobs, ratings, profile]);

  if (!user) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 py-4 px-2">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
            My Dashboard
            {isPro && <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30 rounded-full font-black text-[10px] uppercase"><Crown className="h-3 w-3 mr-1" /> VIP Member</Badge>}
          </h1>
          <p className="text-muted-foreground text-sm">Manage your reputation and national professional visibility.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full font-bold" asChild>
            <Link href={`/public/${user.uid}`}>
              <QrCode className="mr-2 h-4 w-4" /> My Profile
            </Link>
          </Button>
          <Button size="sm" className="rounded-full shadow-lg font-bold" asChild>
            <Link href="/work-log">
              <PlusCircle className="mr-2 h-4 w-4" /> Log Evidence
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Eye className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Views</p>
              <p className="text-xl font-black">{stats.profileViews}</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><TrendingUp className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Score</p>
              <p className="text-xl font-black">{stats.trustScore}</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><ClipboardCheck className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Jobs</p>
              <p className="text-xl font-black">{stats.totalVerified}</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Star className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Rating</p>
              <p className="text-xl font-black">{stats.averageRating}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 border-none bg-primary/5 rounded-[2.5rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lightbulb className="h-32 w-32" />
          </div>
          <CardContent className="p-8 flex flex-col items-start gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Lightbulb className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Expert Daily Mentorship</span>
                  {isTipLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                </div>
                {dailyTip ? (
                  <>
                    <h3 className="text-xl font-black tracking-tight">{dailyTip.tipTitle}</h3>
                    <p className="text-sm text-muted-foreground max-w-xl">{dailyTip.tipContent}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-black tracking-tight">Growth is a Daily Habit</h3>
                    <p className="text-sm text-muted-foreground">Keep logging your work to build the most trusted profile in your area.</p>
                  </>
                )}
              </div>
            </div>
            <Button variant="ghost" className="rounded-full text-primary font-bold group-hover:translate-x-1 transition-transform p-0" asChild>
              <Link href="/profile">Change Trade Skill <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 border-none bg-muted/30 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Nearby Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white rounded-2xl border flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Masonry Work</p>
                <p className="text-[10px] text-muted-foreground">Lilongwe Area 25</p>
              </div>
              <ChevronRight className="h-4 w-4 text-primary" />
            </div>
            <div className="p-3 bg-white rounded-2xl border flex items-center justify-between opacity-50">
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Solar Setup</p>
                <p className="text-[10px] text-muted-foreground">Blantyre City</p>
              </div>
              <ChevronRight className="h-4 w-4" />
            </div>
            <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-primary" asChild>
              <Link href="/jobs">View National Board</Link>
            </Button>
          </CardContent>
        </Card>

        {!isPro && (
          <Card className="md:col-span-12 border-none bg-primary text-primary-foreground shadow-2xl overflow-hidden relative group rounded-[3rem]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Zap className="h-40 w-40" />
            </div>
            <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="bg-white/20 p-6 rounded-[2rem] shadow-inner">
                  <Crown className="h-12 w-12 text-secondary fill-secondary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tight">VIP Professional Upgrade</h3>
                  <p className="text-base opacity-80 max-w-lg">Unlock high-res uploads, national ranking boost, and a verified VIP badge for 30 days. Invest in your career growth today.</p>
                </div>
              </div>
              <Button className="rounded-full bg-secondary text-secondary-foreground font-black px-12 h-16 text-xl hover:scale-105 transition-transform shadow-xl" asChild>
                <Link href="/pricing">Go VIP Now</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-4 bg-white border-none shadow-sm rounded-[3rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform">
            <Trophy className="h-24 w-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">National Ranking</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative flex h-48 w-48 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle className="text-muted/10" strokeWidth="6" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                <circle className="text-primary" strokeWidth="6" strokeDasharray={263.8} strokeDashoffset={263.8 * (1 - Math.min(stats.trustScore / 250, 1))} strokeLinecap="round" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-6xl font-black text-primary">{stats.trustScore}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stats.tier} Tier</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-8 font-black text-primary" asChild>
              <Link href="/search">View Leaderboard <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-8 border-none shadow-sm rounded-[3rem]">
          <CardHeader>
            <CardTitle className="text-2xl font-black">Professional Milestones</CardTitle>
            <CardDescription>Verified badges earned through honest work and community leadership.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.badges.length > 0 ? (
              stats.badges.map((badgeId) => {
                const badge = MILESTONE_BADGES[badgeId];
                if (!badge) return null;
                const Icon = badge.icon;
                return (
                  <div key={badgeId} className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-muted/20 border transition-all hover:scale-105 hover:shadow-md text-center group">
                    <div className={cn("p-5 rounded-2xl shadow-sm transition-transform group-hover:rotate-12", badge.color)}>
                      <Icon className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black leading-tight uppercase tracking-tight block">{badge.name}</span>
                      <p className="text-[8px] text-muted-foreground leading-tight">{badge.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center text-center gap-4 bg-muted/10 rounded-[2.5rem] border-2 border-dashed">
                <Award className="h-14 w-14 text-muted-foreground opacity-20" />
                <div className="space-y-1 px-8">
                  <p className="text-sm font-bold text-muted-foreground">No Milestones Yet</p>
                  <p className="text-xs text-muted-foreground/60">Log your first verified job to unlock your professional badges.</p>
                </div>
                <Button variant="outline" size="sm" className="mt-4 rounded-full font-bold" asChild>
                  <Link href="/work-log">Start Logging Work</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
