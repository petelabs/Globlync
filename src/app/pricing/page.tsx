
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
  ArrowRight,
  Star,
  Medal,
  Trophy,
  Globe,
  Wallet,
  Building2,
  Lock,
  Timer
} from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TIERS = [
  {
    id: "bronze",
    name: "Bronze Pro",
    price: 0.63, // 30% off 0.9
    originalPrice: 0.9,
    days: 30,
    link: "https://pay.paychangu.com/SC-oz0qsN",
    icon: Medal,
    color: "text-orange-500",
    bgColor: "bg-orange-500/5",
    borderColor: "border-orange-200",
    features: ["30 Days Access", "Verified Badge", "5 Photos per Job", "Search Visibility"]
  },
  {
    id: "silver",
    name: "Silver Pro",
    price: 1.33, // 30% off 1.9
    originalPrice: 1.9,
    days: 30,
    link: "https://pay.paychangu.com/SC-0siw5Z",
    icon: Star,
    color: "text-slate-400",
    bgColor: "bg-slate-400/5",
    borderColor: "border-slate-200",
    features: ["30 Days Access", "Silver VIP Badge", "10 Photos per Job", "Ranking Boost"]
  },
  {
    id: "gold",
    name: "Gold Pro",
    price: 2.03, // 30% off 2.9
    originalPrice: 2.9,
    days: 30,
    link: "https://pay.paychangu.com/SC-PuzKtb",
    icon: Trophy,
    color: "text-secondary",
    bgColor: "bg-secondary/5",
    borderColor: "border-secondary/20",
    features: ["30 Days Access", "Gold VIP Badge", "Unlimited HD Photos", "Priority Support"]
  }
];

export default function PricingPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [timeLeft, setTimeLeft] = useState({h: 23, m: 59, s: 59});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeLeft({
        h: 23 - now.getHours(),
        m: 59 - now.getMinutes(),
        s: 59 - now.getSeconds()
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);
  
  const activeBenefit = profile?.activeBenefits?.find((b: any) => new Date(b.expiresAt) > new Date());

  return (
    <div className="flex flex-col gap-12 py-8 max-w-6xl mx-auto px-4">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary animate-pulse border border-secondary/20">
          <Timer className="h-3 w-3" /> Early Bird: 30% OFF Ends in {timeLeft.h}h {timeLeft.m}m
        </div>
        <h1 className="text-4xl font-black tracking-tighter sm:text-7xl">Go Pro <span className="text-primary">VIP.</span></h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground text-lg font-medium">
          Building your professional identity is <b>Free for Life</b>. Upgrade to a Pro tier to unlock advanced tools and global ranking for 30 days.
        </p>
      </header>

      {activeBenefit && (
        <Card className="bg-secondary/10 border-4 border-secondary/30 rounded-[3rem] p-8 text-center animate-in zoom-in-95 max-w-2xl mx-auto w-full">
          <Badge className="bg-secondary text-secondary-foreground font-black mb-4 px-6 py-1.5 rounded-full uppercase text-[10px]">Active VIP Status</Badge>
          <h3 className="text-3xl font-black flex items-center justify-center gap-3 text-foreground">
            <Crown className="h-8 w-8 text-secondary fill-secondary" />
            You are a Pro Member
          </h3>
          <p className="text-base text-muted-foreground mt-2 font-medium">Your current {activeBenefit.type} is active until <b>{new Date(activeBenefit.expiresAt).toLocaleDateString()}</b></p>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <Card key={tier.id} className={cn(
            "border-2 rounded-[3rem] p-8 flex flex-col relative overflow-hidden transition-all hover:scale-[1.02] shadow-sm hover:shadow-xl",
            tier.borderColor,
            tier.bgColor
          )}>
            <div className="absolute top-6 right-6">
              <tier.icon className={cn("h-8 w-8", tier.color)} />
            </div>
            <CardHeader className="p-0 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl font-black">{tier.name}</CardTitle>
                <Badge className="bg-secondary text-secondary-foreground text-[8px] font-black uppercase">-30%</Badge>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-5xl font-black tracking-tight">${tier.price}</span>
                  <span className="text-sm text-muted-foreground font-bold">/ 30 Days</span>
                </div>
                <span className="text-xs text-muted-foreground line-through font-bold opacity-50 ml-1">Reg. ${tier.originalPrice}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ul className="space-y-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-primary/40 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-0 mt-8 flex flex-col gap-4">
              <Button className="w-full rounded-full h-16 text-lg font-black shadow-lg" asChild>
                <a href={tier.link} target="_blank">
                  <CreditCard className="mr-3 h-5 w-5" /> Pay Early Bird Rate
                </a>
              </Button>
              <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
                Safe & Secure via <span className="text-primary">PayChangu</span>
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none bg-muted/30 p-8 rounded-[2.5rem] flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Payment Methods</h3>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Professionals</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white border-2 py-1.5 px-4 rounded-xl font-bold flex items-center gap-2">
                  <CreditCard className="h-3 w-3 text-primary" /> Visa
                </Badge>
                <Badge variant="outline" className="bg-white border-2 py-1.5 px-4 rounded-xl font-bold flex items-center gap-2">
                  <CreditCard className="h-3 w-3 text-primary" /> MasterCard
                </Badge>
                <Badge variant="outline" className="bg-white border-2 py-1.5 px-4 rounded-xl font-bold flex items-center gap-2">
                  <Building2 className="h-3 w-3 text-primary" /> Bank Transfer
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Local Malawi Support</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white border-2 py-1.5 px-4 rounded-xl font-bold flex items-center gap-2">
                  <Wallet className="h-3 w-3 text-red-500" /> Airtel Money
                </Badge>
                <Badge variant="outline" className="bg-white border-2 py-1.5 px-4 rounded-xl font-bold flex items-center gap-2">
                  <Wallet className="h-3 w-3 text-green-600" /> TNM Mpamba
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Alert className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-[2.5rem] p-8 flex flex-col items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <AlertTitle className="text-xl font-black uppercase tracking-tight mb-2">Automated Activation</AlertTitle>
            <AlertDescription className="text-sm font-medium leading-relaxed opacity-80">
              Upgrade is 100% automated. Whether you use a global card or local mobile money, your account will be upgraded for 30 days instantly upon successful checkout. Ensure you use the same email/phone as your Globlync profile.
            </AlertDescription>
          </div>
        </Alert>
      </div>

      <Card className="border-none bg-secondary/10 p-8 rounded-[3rem] shadow-xl relative overflow-hidden group max-w-4xl mx-auto w-full">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Gift className="h-40 w-40" />
        </div>
        <div className="relative z-10 flex flex-col md:row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <Badge className="bg-secondary text-secondary-foreground font-black mb-2 uppercase text-[10px]">Earn for Free</Badge>
            <h3 className="text-3xl font-black tracking-tight">Unlock VIP without Cash</h3>
            <p className="text-sm opacity-80 max-w-md font-medium leading-relaxed">Can't pay? Complete one quick survey or offer from our partners to unlock Bronze Pro status instantly. Support the network with your time.</p>
          </div>
          <Button size="lg" className="rounded-full bg-secondary text-secondary-foreground font-black px-10 h-16 shadow-xl hover:scale-105 transition-transform" asChild>
            <Link href="/rewards">Open Reward Center <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
