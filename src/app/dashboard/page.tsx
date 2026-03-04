
"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  QrCode, 
  Award,
  Loader2,
  Users,
  Gift,
  Crown,
  Sparkles,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, doc, serverTimestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const MILESTONE_BADGES: Record<string, { name: string; icon: any; color: string }> = {
  'first-job': { name: "First Verified Job", icon: Award, color: "text-blue-500" },
  'reliable-worker': { name: "Reliable Pro", icon: Award, color: "text-primary" },
  'perfect-streak': { name: "Customer Favorite", icon: Award, color: "text-secondary" },
  'growth-champion': { name: "Growth Champion", icon: Users, color: "text-pink-500" },
};

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

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

  const recentJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(5));
  }, [jobsRef]);

  const { data: profile } = useDoc(workerRef);
  const { data: allJobs } = useCollection(jobsRef);
  const { data: recentJobs, isLoading: isJobsLoading } = useCollection(recentJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

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
      tier: (profile?.trustScore || 0) > 100 ? "Platinum" : (profile?.trustScore || 0) > 50 ? "Gold" : "Bronze",
      badges: profile?.badgeIds || [],
      referrals: profile?.referralCount || 0
    };
  }, [allJobs, ratings, profile]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 py-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Dashboard
            {isPro && <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30"><Crown className="h-3 w-3 mr-1" /> Pro</Badge>}
          </h1>
          <p className="text-muted-foreground">Manage your reputation and professional growth.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href={`/public/${user.uid}`}>
              <QrCode className="mr-2 h-4 w-4" /> View Public
            </Link>
          </Button>
          <Button size="sm" className="rounded-full shadow-lg" asChild>
            <Link href="/work-log">
              <PlusCircle className="mr-2 h-4 w-4" /> Log Job
            </Link>
          </Button>
        </div>
      </header>

      {!isPro && (
        <Card className="border-none bg-primary text-primary-foreground shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Zap className="h-32 w-32" />
          </div>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="bg-white/20 p-4 rounded-2xl">
                <Crown className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Boost Your Business!</h3>
                <p className="text-sm opacity-80">Unlock 10 HD photos, priority verification, and a Pro badge. Prices start from MWK 250.</p>
              </div>
            </div>
            <Button className="rounded-full bg-secondary text-secondary-foreground font-bold px-8 h-12 hover:scale-105" asChild>
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-12">
        {/* Referral CTA */}
        <Card className="md:col-span-12 border-2 border-secondary bg-secondary/5 overflow-hidden">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="bg-secondary p-4 rounded-2xl shadow-lg">
                <Gift className="h-8 w-8 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Invite Friends, Earn Pro!</h3>
                <p className="text-sm text-muted-foreground">You have invited {stats.referrals} workers. Invite {Math.max(0, 10 - stats.referrals)} more to unlock Pro status for free!</p>
              </div>
            </div>
            <Button className="rounded-full bg-secondary text-secondary-foreground font-bold px-8 h-12 hover:scale-105 transition-transform" asChild>
              <Link href="/referrals">Invite & Earn</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Trust Score Card */}
        <Card className="md:col-span-4 bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="h-24 w-24" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">Trust Score</CardTitle>
            <CardDescription className="text-primary-foreground/70">Verified Professional Level</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle className="text-white/20" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle className="text-secondary" strokeWidth="8" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - Math.min(stats.trustScore / 250, 1))} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black">{stats.trustScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{stats.tier}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <Star className="h-4 w-4 fill-secondary text-secondary" />
              <span className="text-lg font-bold">{stats.averageRating} Avg Rating</span>
            </div>
          </CardContent>
        </Card>

        {/* Badges/Achievements Card */}
        <Card className="md:col-span-8 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Milestone Achievements</CardTitle>
            <CardDescription>Earned based on verified work and community growth</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {stats.badges.length > 0 ? (
              stats.badges.map((badgeId) => {
                const badge = MILESTONE_BADGES[badgeId];
                if (!badge) return null;
                const Icon = badge.icon;
                return (
                  <div key={badgeId} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border w-24 text-center group hover:scale-105 transition-transform">
                    <Icon className={cn("h-8 w-8", badge.color)} />
                    <span className="text-[10px] font-bold leading-tight">{badge.name}</span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-8 bg-muted/10 rounded-xl border border-dashed">
                <p className="text-xs text-muted-foreground">Complete jobs or invite friends to unlock badges!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
