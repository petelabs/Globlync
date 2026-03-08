
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
  ClipboardCheck, 
  Sparkles 
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const tipRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "system", "dailyTip");
  }, [db]);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "jobs");
  }, [db, user?.uid]);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "ratings");
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: globalTip, isLoading: isTipLoading } = useDoc(tipRef);
  const { data: allJobs } = useCollection(jobsRef);
  const { data: ratings } = useCollection(ratingsRef);

  const isPro = useMemo(() => {
    if (!profile) return false;
    const hasPaidVIP = profile.activeBenefits?.some((b: any) => b.expiresAt && new Date(b.expiresAt) > new Date());
    const hasReferralVIP = (profile.referralCount || 0) >= 10;
    return hasPaidVIP || hasReferralVIP;
  }, [profile]);

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

  if (!user || isProfileLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Professional Data...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 py-4 px-2">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
            My Dashboard
            {isPro && <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30 rounded-full font-black text-[10px] uppercase"><Crown className="h-3 w-3 mr-1" /> Pro VIP</Badge>}
          </h1>
          <p className="text-muted-foreground text-sm">Manage your reputation and global professional visibility.</p>
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
                <Lightbulb className={cn("h-6 w-6 text-primary", !isTipLoading && "animate-pulse")} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Daily Mentor Tip</span>
                  {isTipLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                </div>
                {globalTip ? (
                  <>
                    <h3 className="text-xl font-black tracking-tight">{globalTip.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-xl">{globalTip.content}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-black tracking-tight">Growth is a Daily Habit</h3>
                    <p className="text-sm text-muted-foreground">Log your work today to keep your streak and build trust.</p>
                  </>
                )}
              </div>
            </div>
            <Button variant="ghost" className="rounded-full text-primary font-bold group-hover:translate-x-1 transition-transform p-0" asChild>
              <Link href="/profile">Edit Trade Skills <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 border-none bg-secondary/10 rounded-[2.5rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-secondary flex items-center gap-2">
              <Users className="h-4 w-4" /> Invite & Earn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-black uppercase opacity-70">
                <span>Free Pro VIP Progress</span>
                <span>{stats.referrals}/10</span>
              </div>
              <Progress value={(stats.referrals / 10) * 100} className="h-2 bg-secondary/20" />
            </div>
            <p className="text-[11px] font-medium leading-tight">Friends get <b>+10 Trust Score</b> when they join using your link.</p>
            <Button size="sm" className="w-full rounded-full bg-secondary text-secondary-foreground font-black text-[10px]" asChild>
              <Link href="/referrals">Invite Friends <ChevronRight className="ml-1 h-3 w-3" /></Link>
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
                  <h3 className="text-3xl font-black tracking-tight">Optional Pro Upgrade</h3>
                  <p className="text-base opacity-80 max-w-lg">Unlock HD photo logs, national search ranking boost, and a Pro badge for only $0.9 per month.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button className="rounded-full bg-secondary text-secondary-foreground font-black px-12 h-16 text-xl hover:scale-105 transition-transform shadow-xl" asChild>
                  <Link href="/pricing">Go Pro VIP</Link>
                </Button>
                <Link href="/referrals" className="text-[10px] font-black uppercase tracking-widest opacity-70 hover:opacity-100 text-center">Or Earn it by Inviting Friends</Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
