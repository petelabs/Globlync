
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  Award, 
  Zap, 
  ShieldCheck, 
  CheckCircle2,
  Lock,
  Star,
  Facebook,
  Twitter
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
  { count: 1000, label: "Visionary", reward: "Everything Unlocked (2 Years)", icon: Star },
];

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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
  // High-Trust Original Link Format
  const referralUrl = `https://globlync.vercel.app/login?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast({ title: "Link Copied!", description: "Share your professional code to build your reputation." });
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Join me on Globlync! Build your professional reputation and find more work. Sign up here: ${referralUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
    window.open(url, "_blank");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Build your evidence-based professional reputation with me on Globlync!`);
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralUrl)}`;
    window.open(url, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Globlync',
          text: 'Build your evidence-based professional reputation with me!',
          url: referralUrl,
        });
      } catch (e) {
        copyLink();
      }
    } else {
      copyLink();
    }
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
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
              <span>Next Reward: {nextMilestone.label}</span>
              <span>{referralCount} / {nextMilestone.count}</span>
            </div>
            <Progress value={progress} className="h-3 bg-white/20" />
            <p className="text-[10px] opacity-80 italic">Invite {Math.max(0, nextMilestone.count - referralCount)} more to unlock: {nextMilestone.reward}</p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
            <Label className="text-xs font-bold uppercase mb-2 block">Your Original Invite Link</Label>
            <div className="flex items-center gap-2">
              <code className="text-[10px] truncate flex-1 bg-black/20 p-2 rounded font-mono text-secondary">{referralUrl}</code>
              <Button size="icon" variant="ghost" className="hover:bg-white/20" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 relative z-10">
          <div className="flex gap-2 w-full">
            <Button className="flex-1 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-12" onClick={shareWhatsApp}>
              <WhatsAppIcon className="mr-2 h-5 w-5" /> WhatsApp
            </Button>
            <Button className="flex-1 rounded-full bg-white text-primary font-bold hover:bg-white/90 h-12" onClick={shareNative}>
              <Share2 className="mr-2 h-4 w-4" /> More Options
            </Button>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <button onClick={shareFacebook} className="p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform shadow-md">
              <Facebook className="h-5 w-5" />
            </button>
            <button onClick={shareTwitter} className="p-3 bg-black text-white rounded-full hover:scale-110 transition-transform shadow-md">
              <Twitter className="h-5 w-5" />
            </button>
          </div>
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
                "border-none shadow-sm transition-all",
                !isUnlocked && "opacity-60 bg-muted/30",
                isUnlocked && "border-2 border-primary/20 bg-primary/5"
              )}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    isUnlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
