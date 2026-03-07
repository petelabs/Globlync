
"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Sparkles, 
  CreditCard,
  Info,
  AlertTriangle,
  Crown,
  Clock,
  Tag
} from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Standard VIP",
    price: 300,
    duration: "30 Days",
    features: ["5 HD Photos per job", "AI Proof Priority", "Verified VIP Badge", "Basic Directory Listing"],
    color: "bg-primary/5 border-primary/20",
    paymentLink: "https://pay.paychangu.com/SC-c9Mara"
  },
  {
    name: "Silver VIP",
    price: 500,
    duration: "30 Days",
    features: ["10 HD Photos per job", "Enhanced Trust Score", "Search Result Boost", "WhatsApp Visibility Boost"],
    color: "bg-muted/50 border-muted",
    popular: true,
    paymentLink: "https://pay.paychangu.com/SC-c9Mara"
  },
  {
    name: "Gold VIP",
    price: 1000,
    duration: "30 Days",
    features: ["Everything in Silver", "Unlimited Photos", "Featured Home Page Slot", "Priority Human Verification"],
    color: "bg-secondary/10 border-secondary/20",
    paymentLink: "https://pay.paychangu.com/SC-c9Mara"
  }
];

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

  // Calculate 24h discount eligibility and countdown
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

  return (
    <div className="flex flex-col gap-12 py-8 max-w-5xl mx-auto px-4">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-secondary">
          <Sparkles className="h-3 w-3" /> National Professional Network
        </div>
        <h1 className="text-4xl font-black tracking-tighter sm:text-7xl text-primary">Go VIP.</h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground text-lg">
          Support the platform that grows your reputation across Malawi. Select your tier by entering the amount on PayChangu.
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
                <p className="opacity-80 font-medium">Upgrade now to claim your discount. Valid for any VIP tier.</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="text-center px-8 py-4 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase opacity-70">Claim For Only</p>
                  <p className="text-4xl font-black">MWK 240</p>
                  <p className="text-[8px] font-bold">Standard VIP (30 Days)</p>
                </div>
                <Button variant="secondary" className="rounded-full px-8 font-black shadow-lg pointer-events-none">
                  Claim Discount Now
                </Button>
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
            You are {activeBenefit.type}
          </h3>
          <p className="text-base text-muted-foreground mt-2 font-medium">Your professional benefits are active until <b>{new Date(activeBenefit.expiresAt).toLocaleDateString()}</b></p>
        </Card>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={cn(
            "relative border-2 transition-all hover:scale-[1.02] flex flex-col rounded-[3rem] overflow-hidden shadow-xl",
            plan.color,
            plan.popular && "ring-4 ring-secondary border-transparent"
          )}>
            {plan.popular && (
              <div className="absolute top-6 right-6 bg-secondary text-secondary-foreground text-[10px] font-black px-4 py-1.5 rounded-full uppercase shadow-lg">
                Most Popular
              </div>
            )}
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black tracking-tight">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-5xl font-black">MWK {plan.price}</span>
                <span className="text-sm text-muted-foreground font-bold">/ {plan.duration}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-8">
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-8">
              <Button className="w-full rounded-full font-black h-16 text-lg shadow-2xl bg-primary" asChild>
                <a href={plan.paymentLink} target="_blank">
                  <CreditCard className="mr-3 h-5 w-5" /> Pay on PayChangu
                </a>
              </Button>
              <p className="text-[10px] text-center text-muted-foreground italic px-6">
                Enter MWK {isEligibleForDiscount ? Math.floor(plan.price * 0.8) : plan.price} at checkout for this tier.
              </p>
            </CardFooter>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none bg-muted/30 p-8 rounded-[3rem] flex items-start gap-6">
          <div className="bg-primary/10 p-4 rounded-3xl text-primary">
            <Info className="h-8 w-8" />
          </div>
          <div>
            <h4 className="font-black text-lg mb-2 text-foreground">Flexible National Pricing</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We absorb all transaction fees so you pay exactly what you see. Use any payment method on PayChangu (Airtel, Mpamba, Bank, Card).
            </p>
          </div>
        </Card>

        <Card className="border-none bg-destructive/5 p-8 rounded-[3rem] flex items-start gap-6 border-2 border-destructive/10">
          <div className="bg-destructive/10 p-4 rounded-3xl text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <h4 className="font-black text-lg text-destructive mb-2">Professional Policy</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All VIP upgrades are non-refundable. Please ensure you enter the correct amount for your chosen tier. Trial VIP (2 days) is assigned to payments below 240 MWK.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
