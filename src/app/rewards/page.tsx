"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Gift, Zap, ShieldCheck, Star, Info, ChevronRight, Loader2, Sparkles, Award, Coins, AlertTriangle, ShieldAlert, MousePointerClick, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";

export default function RewardsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);
  
  // Dynamic CPA Offerwall Integration with SubID tracking (Fallback for Guests)
  const OFFERWALL_BASE = "https://www.zwidgetbv3dft.xyz/list/zOJYuGd1";
  const OFFERWALL_URL = user ? `${OFFERWALL_BASE}?subid=${user.uid}` : OFFERWALL_BASE;

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto px-4">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Official Reward Center
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Earn Pro <span className="text-primary">Status.</span></h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed font-medium">
          Support the platform that grows your reputation. Complete quick professional tasks to unlock VIP benefits instantly without paying cash.
        </p>
      </header>

      {/* Reward Balance UI */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-none bg-primary text-primary-foreground rounded-[2rem] overflow-hidden shadow-xl relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Coins className="h-20 w-20" />
          </div>
          <CardContent className="p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Current Reward Balance</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black tracking-tighter">{profile?.rewardCredits || 0}</span>
              <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Credits</span>
            </div>
            <p className="text-[10px] font-medium mt-4 opacity-60">100 Credits = 30 Days Pro VIP</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-secondary/10 rounded-[2rem] p-8 flex flex-col justify-center gap-2 border-2 border-secondary/20">
          <div className="flex items-center gap-2 text-secondary font-black uppercase text-[10px] tracking-widest">
            <Zap className="h-4 w-4" /> VIP Unlock Goal
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-2xl font-black leading-none">Pro Activation</p>
              <p className="text-xs font-bold opacity-60">{profile?.rewardCredits || 0} / 100</p>
            </div>
            <div className="h-3 w-full bg-secondary/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-1000" 
                style={{ width: `${Math.min(100, (profile?.rewardCredits || 0))}%` }} 
              />
            </div>
          </div>
        </Card>
      </div>

      {!user && (
        <Card className="border-none bg-amber-500/10 border-2 border-amber-500/20 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-amber-700">
            <div className="bg-white p-3 rounded-2xl shadow-sm">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-sm uppercase tracking-tight">Guest Mode Active</h4>
              <p className="text-xs font-medium leading-tight">You can view offers, but tasks won't be credited to an account unless you sign in.</p>
            </div>
          </div>
          <Button className="rounded-full font-black bg-amber-600 hover:bg-amber-700 shadow-lg" asChild>
            <Link href="/login"><UserPlus className="mr-2 h-4 w-4" /> Sign In to Earn</Link>
          </Button>
        </Card>
      )}

      {/* CONTENT LOCKER OVERLAY BUTTON */}
      <Card className="border-4 border-dashed border-primary/20 bg-primary/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/40 transition-colors">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="bg-primary p-4 rounded-3xl text-white shadow-lg animate-bounce">
              <MousePointerClick className="h-8 w-8" />
            </div>
            <div>
              <Badge className="bg-primary text-white font-black text-[8px] uppercase tracking-[0.2em] mb-2">High Velocity Bonus</Badge>
              <h3 className="text-2xl font-black tracking-tight leading-none">Interactive Survey Unlock</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">Earn 50-100 Credits instantly via our premium overlay locker.</p>
            </div>
          </div>
          
          <Button 
            asChild
            className="rounded-full h-16 px-10 font-black text-lg shadow-2xl hover:scale-105 transition-transform"
          >
            <a 
              href="#" 
              data-interact-trigger 
              data-tool-id="62893" 
              data-subid={user?.uid || ""}
              data-title-mode="dynamic"
            >
              {user ? "Start Quick Task" : "Try Interaction"} <ChevronRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-muted/30 p-6 rounded-[2rem] space-y-3">
          <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center text-primary shadow-sm">
            <Zap className="h-5 w-5" />
          </div>
          <h4 className="font-black text-sm uppercase tracking-tight">1. Select Task</h4>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">Choose a survey, app trial, or quick video from the list below.</p>
        </div>
        <div className="bg-muted/30 p-6 rounded-[2rem] space-y-3">
          <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center text-primary shadow-sm">
            <Award className="h-5 w-5" />
          </div>
          <h4 className="font-black text-sm uppercase tracking-tight">2. Earn Credits</h4>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">100 Credits are earned for every $1 generated for the network.</p>
        </div>
        <div className="bg-muted/30 p-6 rounded-[2rem] space-y-3">
          <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center text-primary shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="font-black text-sm uppercase tracking-tight">3. Go Pro</h4>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">Redeem 100 credits to unlock Pro visibility and HD photos for 30 days.</p>
        </div>
      </section>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white min-h-[700px] border-t-8 border-t-secondary">
        <CardHeader className="bg-muted/30 p-8 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Gift className="h-6 w-6 text-secondary" /> Global Task Wall
            </CardTitle>
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-white border-2">Verified Partner</Badge>
          </div>
          <CardDescription className="text-xs font-bold mt-1 text-muted-foreground">
            Complete high-value tasks from our global partner to fund your professional growth.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 relative h-full">
          <iframe 
            sandbox="allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox"
            src={OFFERWALL_URL} 
            className="w-full h-[800px] border-none" 
            title="Global Reward Center" 
            frameBorder="0"
          />
        </CardContent>
      </Card>

      <footer className="grid gap-4 sm:grid-cols-2">
        <div className="bg-destructive/5 p-8 rounded-[2rem] flex items-start gap-4 border-2 border-destructive/10">
          <div className="bg-white p-2 rounded-xl text-destructive shadow-sm">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-destructive">Fraud Prevention</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">
              Using VPNs, proxy servers, or multiple accounts to farm rewards will result in an immediate and permanent ban.
            </p>
          </div>
        </div>
        <div className="bg-primary/5 p-8 rounded-[2rem] flex items-start gap-4 border-2 border-primary/10">
          <div className="bg-white p-2 rounded-xl text-primary shadow-sm">
            <Info className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-primary">Task Support</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">
              Offers are tracked by the reward network. If you don't receive credits, use the "Support" link inside the task wall.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
