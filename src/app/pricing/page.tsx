
"use client";

import { useMemo } from "react";
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

export default function PricingPage() {
  const { user } = useUser();
  const db = useFirestore();

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);
  
  const activeBenefit = profile?.activeBenefits?.find((b: any) => new Date(b.expiresAt) > new Date());

  // Calculate 24h discount eligibility
  const isEligibleForDiscount = useMemo(() => {
    if (!profile?.createdAt) return false;
    const joinedAt = new Date(profile.createdAt.seconds * 1000);
    const now = new Date();
    const diff = now.getTime() - joinedAt.getTime();
    return diff < 24 * 60 * 60 * 1000;
  }, [profile]);

  return (
    <div className="flex flex-col gap-12 py-8 max-w-5xl mx-auto px-4">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-secondary">
          <Sparkles className="h-3 w-3" /> National Professional Network
        </div>
        <h1 className="text-4xl font-black tracking-tighter sm:text-7xl text-primary italic">Go VIP.</h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground text-lg">
          Support the platform that grows your reputation across Malawi. Select your tier by entering the amount on PayChangu.
        </p>
      </header>

      {isEligibleForDiscount && (
        <Card className="bg-primary text-primary-foreground border-none rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-top-4">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Tag className="h-40 w-40 rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <Badge className="bg-white text-primary font-black mb-2">NEW MEMBER OFFER</Badge>
              <h2 className="text-3xl font-black tracking-tighter">20% Welcome Discount!</h2>
              <p className="opacity-80 font-medium">Upgrade within 24 hours to claim your discount. Valid for any VIP tier.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-center px-6 py-3 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase opacity-70">Pay Only</p>
                <p className="text-3xl font-black">MWK 240</p>
                <p className="text-[8px] font-bold">Standard VIP (30 Days)</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeBenefit && (
        <Card className="bg-secondary/10 border-4 border-secondary/30 rounded-[3rem] p-8 text-center animate-in zoom-in-95">
          <Badge className="bg-secondary text-secondary-foreground font-black mb-4 px-6 py-1.5 rounded-full">ACTIVE VIP STATUS</Badge>
          <h3 className="text-3xl font-black flex items-center justify-center gap-3">
            <Crown className="h-8 w-8 text-secondary fill-secondary" />
            You are {activeBenefit.type}
          </h3>
          <p className="text-base text-muted-foreground mt-2">Your professional benefits are active until <b>{new Date(activeBenefit.expiresAt).toLocaleDateString()}</b></p>
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
          <div className="bg-primary/10 p-4 rounded-3xl">
            <Info className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h4 className="font-black text-lg mb-2">Flexible National Pricing</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We absorb all transaction fees so you pay exactly what you see. Use any payment method on PayChangu (Airtel, Mpamba, Bank, Card).
            </p>
          </div>
        </Card>

        <Card className="border-none bg-destructive/5 p-8 rounded-[3rem] flex items-start gap-6 border-2 border-destructive/10">
          <div className="bg-destructive/10 p-4 rounded-3xl">
            <AlertTriangle className="h-8 w-8 text-destructive" />
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
