
"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  CreditCard,
  Info,
  AlertTriangle,
  Crown,
  Clock,
  Tag,
  AlertCircle,
  Gift,
  ArrowRight
} from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PAYMENT_LINK = "https://pay.paychangu.com/SC-c9Mara";

export default function PricingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [timeLeft, setTimeLeft] = useState("");

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);
  
  const activeBenefit = profile?.activeBenefits?.find((b: any) => new Date(b.expiresAt) > new Date());

  useEffect(() => {
    if (!profile?.createdAt) return;
    
    const interval = setInterval(() => {
      const createdAtDate = profile.createdAt.seconds 
        ? new Date(profile.createdAt.seconds * 1000) 
        : new Date(profile.createdAt);
      
      const expiresAt = new Date(createdAtDate.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [profile?.createdAt]);

  const isEligibleForDiscount = timeLeft !== "" && timeLeft !== "EXPIRED";
  const proPrice = 300;
  const discountedPrice = 240;

  return (
    <div className="flex flex-col gap-12 py-8 max-w-5xl mx-auto px-4">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
          <Sparkles className="h-3 w-3" /> Global Professional Network
        </div>
        <h1 className="text-4xl font-black tracking-tighter sm:text-7xl text-primary">Go Pro VIP.</h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground text-lg font-medium">
          Building your professional identity is <b>Free for Life</b>. Upgrade to Pro VIP to unlock advanced tools and global visibility.
        </p>
      </header>

      {isEligibleForDiscount && (
        <a href={PAYMENT_LINK} target="_blank" className="block group">
          <Card className="bg-primary text-primary-foreground border-none rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Tag className="h-40 w-40 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                  <Badge className="bg-white text-primary font-black">NEW MEMBER OFFER</Badge>
                  <div className="flex items-center gap-1.5 text-xs font-black bg-secondary text-secondary-foreground px-3 py-1 rounded-full animate-pulse">
                    <Clock className="h-3 w-3" /> {timeLeft} LEFT
                  </div>
                </div>
                <h2 className="text-3xl font-black tracking-tighter">20% Welcome Discount!</h2>
                <p className="opacity-80 font-medium">Upgrade now to claim your discounted Pro VIP status.</p>
              </div>
              <div className="text-center px-8 py-4 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase opacity-70">Claim For Only</p>
                <p className="text-4xl font-black">MWK {discountedPrice}</p>
                <p className="text-[8px] font-bold">Pro VIP (30 Days)</p>
              </div>
            </div>
          </Card>
        </a>
      )}

      {activeBenefit && (
        <Card className="bg-secondary/10 border-4 border-secondary/30 rounded-[3rem] p-8 text-center animate-in zoom-in-95">
          <Badge className="bg-secondary text-secondary-foreground font-black mb-4 px-6 py-1.5 rounded-full">ACTIVE VIP STATUS</Badge>
          <h3 className="text-3xl font-black flex items-center justify-center gap-3 text-foreground">
            <Crown className="h-8 w-8 text-secondary fill-secondary" />
            You are a Pro VIP Member
          </h3>
          <p className="text-base text-muted-foreground mt-2 font-medium">Active until <b>{new Date(activeBenefit.expiresAt).toLocaleDateString()}</b></p>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* FREE TIER CARD */}
        <Card className="border-2 border-muted bg-muted/20 rounded-[3rem] p-8 flex flex-col">
          <CardHeader className="p-0 mb-6">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-black">Standard Pro</CardTitle>
              <Badge variant="outline" className="font-black uppercase tracking-widest text-[9px]">Free Forever</Badge>
            </div>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-5xl font-black">MWK 0</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ul className="space-y-4">
              {[
                "Digital Evidence Profile",
                "Basic Job Logging",
                "Client Verification Link",
                "Public Search Presence"
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5 text-primary/40 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="p-0 mt-8">
            <Button variant="outline" className="w-full rounded-full h-14 font-black border-primary text-primary" asChild>
              <Link href="/dashboard">Current Status</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* PRO VIP TIER CARD */}
        <Card className="border-4 border-primary bg-primary/5 rounded-[3rem] p-8 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="absolute top-6 right-6">
            <Crown className="h-8 w-8 text-secondary fill-secondary" />
          </div>
          <CardHeader className="p-0 mb-6">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-black">Pro VIP</CardTitle>
              <Badge className="bg-secondary text-secondary-foreground font-black text-[10px] uppercase">Highly Recommended</Badge>
            </div>
            <div className="flex items-baseline gap-1 mt-4">
              <span className="text-5xl font-black">MWK {proPrice}</span>
              <span className="text-sm text-muted-foreground font-bold">/ 30 Days</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ul className="space-y-4">
              {[
                "10 High-Res Photos per job",
                "Verified VIP Badge on Profile",
                "National Ranking Boost",
                "Priority AI Verification",
                "Advanced Trust Score Analytics"
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="p-0 mt-8 flex flex-col gap-4">
            <Button className="w-full rounded-full h-16 text-lg font-black shadow-xl" asChild>
              <a href={PAYMENT_LINK} target="_blank">
                <CreditCard className="mr-3 h-5 w-5" /> Pay MWK {isEligibleForDiscount ? discountedPrice : proPrice}
              </a>
            </Button>
            <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
              Enter Exactly: <span className="text-primary">MWK {isEligibleForDiscount ? discountedPrice : proPrice}</span>
            </p>
          </CardFooter>
        </Card>
      </div>

      <Alert variant="destructive" className="bg-destructive/5 border-2 border-destructive/20 rounded-[2rem] p-6">
        <AlertCircle className="h-6 w-6" />
        <AlertTitle className="text-lg font-black uppercase tracking-tight ml-2">Important Instructions</AlertTitle>
        <AlertDescription className="text-sm font-medium mt-2 ml-2 leading-relaxed">
          Activation is 100% automated. <b>You MUST enter the EXACT value</b> (MWK {isEligibleForDiscount ? discountedPrice : proPrice}) in the PayChangu payment form. Incorrect amounts will delay your activation.
        </AlertDescription>
      </Alert>

      <Card className="border-none bg-secondary/10 p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Gift className="h-40 w-40" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <Badge className="bg-secondary text-secondary-foreground font-black mb-2">EARN FOR FREE</Badge>
            <h3 className="text-3xl font-black tracking-tight">Unlock VIP without Cash</h3>
            <p className="text-sm opacity-80 max-w-md font-medium">Can't pay? Complete one quick survey or offer from our partners to unlock Pro VIP status instantly. Support the network with your time.</p>
          </div>
          <Button size="lg" className="rounded-full bg-secondary text-secondary-foreground font-black px-10 h-16 shadow-xl" asChild>
            <Link href="/rewards">Open Reward Center <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
