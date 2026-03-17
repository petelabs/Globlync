
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  ArrowRight, 
  Lightbulb, 
  Users,
  Timer,
  Zap,
  Gift,
  TrendingUp,
  CheckCircle2,
  Medal,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Logo } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";
import { MOTIVATIONAL_QUOTES, type Motivation } from "@/lib/motivational-quotes";

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();
  const [globalTip, setGlobalTip] = useState<Motivation | null>(null);
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (user && profile?.createdAt) {
        const signupDate = profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt);
        const expiryDate = new Date(signupDate.getTime() + 24 * 60 * 60 * 1000);
        const diff = expiryDate.getTime() - now.getTime();

        if (diff > 0) {
          setTimeLeft({ 
            h: Math.floor(diff / (1000 * 60 * 60)), 
            m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)), 
            s: Math.floor((diff % (1000 * 60)) / 1000) 
          });
        } else {
          setTimeLeft(null);
        }
      } else {
        setTimeLeft(null);
      }
    }, 1000);

    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const tipIndex = dayOfYear % MOTIVATIONAL_QUOTES.length;
    setGlobalTip(MOTIVATIONAL_QUOTES[tipIndex]);

    return () => clearInterval(timer);
  }, [profile, user]);

  return (
    <div className="flex flex-col gap-16 py-6 overflow-x-hidden">
      {timeLeft && user && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-secondary text-secondary-foreground py-2 px-4 shadow-lg animate-in slide-in-from-top duration-500">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-tighter">
                Signup Bonus Active: <span className="underline">+7 FREE PRO DAYS</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-mono text-[10px] sm:text-xs font-black bg-black/10 px-2 py-1 rounded">
                <Timer className="h-3 w-3" />
                <span>{String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}</span>
              </div>
              <Button size="sm" variant="secondary" className="h-7 rounded-full text-[9px] font-black uppercase bg-white text-secondary hover:bg-white/90" asChild>
                <Link href="/pricing">Claim Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-12 px-4 relative overflow-hidden mt-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <div className="mb-4 animate-in zoom-in duration-700">
          <Logo className="scale-[2] mb-8" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <Globe className="h-3.5 w-3.5" />
            <span>Built for Professionals Across Malawi & The Globe</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:leading-tight">
            Your Reputation <br/>is your <span className="text-primary font-black animate-shimmer-text">Asset.</span>
          </h1>
        </div>
        
        <p className="max-w-[800px] text-lg text-muted-foreground sm:text-xl font-medium leading-relaxed">
          The professional directory for skilled manual workers and remote pros. Build an <span className="text-primary font-bold underline decoration-secondary">Evidence-Based Profile</span> that clients can verify instantly.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row mt-8 w-full max-w-lg">
          {user ? (
            <Button size="lg" className="rounded-full px-10 h-20 text-xl shadow-xl hover:scale-105 transition-transform font-black flex-1" asChild>
              <Link href="/profile">Open My Professional Hub <ArrowRight className="ml-2 h-6 w-6" /></Link>
            </Button>
          ) : (
            <>
              <Button size="lg" className="rounded-full px-10 h-20 text-xl shadow-xl hover:scale-105 transition-transform font-black flex-1 bg-primary" asChild>
                <Link href="/login">Create My Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-10 h-20 text-xl font-black border-4 flex-1" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>

        {/* Dynamic Social Proof Marquee */}
        <div className="mt-16 w-full overflow-hidden relative">
          <div className="flex gap-8 animate-marquee whitespace-nowrap py-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex items-center gap-2 bg-white shadow-sm border px-4 py-2 rounded-full">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">Recent Evidence Verified: @pro_member_{i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto w-full px-4">
        <Card className="border-none bg-primary/5 rounded-[2.5rem] overflow-hidden relative group shadow-inner border-2 border-primary/10">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lightbulb className="h-32 w-32" />
          </div>
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="bg-primary/10 p-6 rounded-[2rem] shadow-sm shrink-0">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <div className="space-y-2 flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Badge className="bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest">Daily Mentor Tip</Badge>
              </div>
              {globalTip ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000">
                  <h3 className="text-2xl font-black tracking-tighter text-foreground leading-none">{globalTip.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed mt-2">"{globalTip.content}"</p>
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-3">— Expert Tip by {globalTip.author}</p>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-5xl mx-auto w-full px-4 flex flex-col items-center gap-8 mb-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-widest text-primary">High-Trust Ecosystem</h2>
          <p className="text-muted-foreground text-sm font-medium">Built to bridge the gap between skill and proof.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <Card className="border-none bg-muted/30 p-8 rounded-[2rem] text-center space-y-4 group hover:bg-primary/5 transition-colors">
            <div className="bg-white p-4 rounded-2xl shadow-sm w-fit mx-auto group-hover:scale-110 transition-transform">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-black text-lg">Growth Tracking</h3>
            <p className="text-xs text-muted-foreground font-medium">Every verified job log increases your global Trust Score automatically.</p>
          </Card>
          <Card className="border-none bg-muted/30 p-8 rounded-[2rem] text-center space-y-4 group hover:bg-primary/5 transition-colors">
            <div className="bg-white p-4 rounded-2xl shadow-sm w-fit mx-auto group-hover:scale-110 transition-transform">
              <Medal className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-black text-lg">Verified Badges</h3>
            <p className="text-xs text-muted-foreground font-medium">Unlock exclusive badges that prove your reliability to high-paying clients.</p>
          </Card>
          <Card className="border-none bg-muted/30 p-8 rounded-[2rem] text-center space-y-4 group hover:bg-primary/5 transition-colors">
            <div className="bg-white p-4 rounded-2xl shadow-sm w-fit mx-auto group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-black text-lg">Digital ID</h3>
            <p className="text-xs text-muted-foreground font-medium">Your @username is your professional brand. Secure it today before others do.</p>
          </Card>
        </div>
      </section>

      <div className="max-w-4xl mx-auto w-full px-4 mb-20">
        <AdBanner className="w-full" />
      </div>
    </div>
  );
}
