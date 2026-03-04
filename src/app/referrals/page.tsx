
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Gift, 
  Share2, 
  MessageSquare, 
  Copy, 
  Award, 
  Zap, 
  ShieldCheck, 
  CheckCircle2,
  Lock,
  Star
} from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MILESTONES = [
  { count: 5, label: "Growth Badge", reward: "Exclusive Profile Badge", icon: Award },
  { count: 10, label: "Pro Starter", reward: "Pro Unlocked (7 Days)", icon: Zap },
  { count: 20, label: "Clean UI", reward: "Ads Free Forever", icon: ShieldCheck },
  { count: 50, label: "Power User", reward: "Everything Unlocked (2 Weeks)", icon: Star },
  { count: 100, label: "Elite", reward: "Everything Unlocked (30 Days)", icon: Star },
  { count: 500, label: "Legend", reward: "Everything Unlocked (8 Months)", icon: Star },
  { count: 1000000, label: "Visionary", reward: "Everything Unlocked (2 Years)", icon: Star },
];

export default function ReferralsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);

  const referralCount = profile?.referralCount || 0;
  const referralCode = profile?.referralCode || "";
  const referralUrl = typeof window !== "undefined" ? `${window.location.origin}/login?ref=${referralCode}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast({ title: "Link Copied!", description: "Share it with your friends to earn rewards." });
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Join me on Globlync! Build your professional reputation and find more work. Sign up here: ${referralUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const nextMilestone = useMemo(() => {
    return MILESTONES.find(m => m.count > referralCount) || MILESTONES[MILESTONES.length - 1];
  }, [referralCount]);

  const progress = (referralCount / nextMilestone.count) * 100;

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-primary">Invite & Earn</h1>
        <p className="text-muted-foreground">Help Globlync grow and unlock premium professional features.</p>
      </header>

      <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Users className="h-32 w-32" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Your Referrals
          </CardTitle>
          <CardDescription className="text-primary-foreground/70">You have invited {referralCount} workers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
              <span>Next Reward: {nextMilestone.label}</span>
              <span>{referralCount} / {nextMilestone.count}</span>
            </div>
            <Progress value={progress} className="h-3 bg-white/20" />
            <p className="text-[10px] opacity-80 italic">Invite {nextMilestone.count - referralCount} more to unlock: {nextMilestone.reward}</p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <Label className="text-xs font-bold uppercase mb-2 block">Your Unique Link</Label>
            <div className="flex items-center gap-2">
              <code className="text-xs truncate flex-1 bg-black/20 p-2 rounded">{referralUrl}</code>
              <Button size="icon" variant="ghost" className="hover:bg-white/20" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button className="flex-1 rounded-full bg-secondary text-secondary-foreground font-bold" onClick={shareWhatsApp}>
            <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
          </Button>
          <Button className="flex-1 rounded-full bg-white text-primary font-bold hover:bg-white/90" onClick={copyLink}>
            <Share2 className="mr-2 h-4 w-4" /> Share Link
          </Button>
        </CardFooter>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-bold px-1">Rewards Roadmap</h2>
        <div className="grid gap-3">
          {MILESTONES.map((m, i) => {
            const isUnlocked = referralCount >= m.count;
            const Icon = m.icon;
            return (
              <Card key={i} className={cn(
                "border-none shadow-sm transition-opacity",
                !isUnlocked && "opacity-60"
              )}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                    isUnlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {isUnlocked ? <CheckCircle2 className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{m.label}</h4>
                      <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full">{m.count} Invites</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.reward}</p>
                  </div>
                  <Icon className={cn("h-5 w-5", isUnlocked ? "text-primary" : "text-muted-foreground")} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
