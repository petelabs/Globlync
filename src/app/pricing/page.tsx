
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Globe, 
  Clock,
  Sparkles,
  CreditCard,
  Info
} from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Standard Pro",
    price: 250,
    duration: "7 Days",
    features: ["10 HD Photos per job", "5MB per photo", "AI Proof Priority", "Verified Pro Badge"],
    color: "bg-primary/5 border-primary/20",
    paymentLink: "https://pay.paychangu.com/SC-c9Mara"
  },
  {
    name: "Silver Pro",
    price: 500,
    duration: "15 Days",
    features: ["Everything in Standard", "Enhanced Trust Score", "Search Result Boost", "WhatsApp Priority"],
    color: "bg-muted/50 border-muted",
    paymentLink: "https://pay.paychangu.com/SC-c9Mara"
  },
  {
    name: "Gold Pro",
    price: 700,
    duration: "1 Month",
    features: ["Everything in Silver", "Premium Directory", "Ad-Free Experience", "Monthly Report"],
    color: "bg-secondary/10 border-secondary/20",
    popular: true,
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
  
  // Check if any benefit is currently active
  const activeBenefit = profile?.activeBenefits?.find((b: any) => new Date(b.expiresAt) > new Date());
  const isPro = !!activeBenefit || (profile?.referralCount || 0) >= 10;

  return (
    <div className="flex flex-col gap-12 py-8 max-w-5xl mx-auto px-4">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-secondary">
          <Sparkles className="h-3 w-3" /> Professional Access
        </div>
        <h1 className="text-4xl font-black tracking-tighter sm:text-6xl text-primary">Upgrade Your Reputation</h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground text-lg">
          Support the platform that builds your career. Your tier is automatically detected based on the amount you pay.
        </p>
      </header>

      {activeBenefit && (
        <Card className="bg-secondary/10 border-2 border-secondary/30 rounded-[2rem] p-6 text-center animate-in zoom-in-95">
          <Badge className="bg-secondary text-secondary-foreground font-black mb-2">ACTIVE PLAN</Badge>
          <h3 className="text-xl font-bold">You are currently {activeBenefit.type}</h3>
          <p className="text-sm text-muted-foreground">Your professional benefits expire on <b>{new Date(activeBenefit.expiresAt).toLocaleDateString()}</b></p>
        </Card>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={cn(
            "relative border-2 transition-all hover:scale-[1.02] flex flex-col rounded-[2.5rem] overflow-hidden shadow-xl",
            plan.color,
            plan.popular && "ring-2 ring-secondary"
          )}>
            {plan.popular && (
              <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black">MWK {plan.price}</span>
                <span className="text-sm text-muted-foreground">/ {plan.duration}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-6">
              <Button className="w-full rounded-full font-black h-12 shadow-lg bg-primary" asChild>
                <a href={plan.paymentLink} target="_blank">
                  <CreditCard className="mr-2 h-4 w-4" /> Pay with PayChangu
                </a>
              </Button>
              <p className="text-[9px] text-center text-muted-foreground mt-2 px-4">
                Enter at least <b>MWK {plan.price}</b> on the checkout page to unlock this specific tier.
              </p>
            </CardFooter>
          </Card>
        ))}
      </section>

      <Card className="border-none bg-muted/30 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <Info className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-sm">How automatic detection works</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            When you click "Pay with PayChangu", you can choose your amount. Our system reads the final amount paid and instantly upgrades your account. For example, paying 700 MWK gives you 30 days of Gold Pro. Always use the email address associated with your Globlync account.
          </p>
        </div>
      </Card>

      <section className="bg-primary text-primary-foreground rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="h-48 w-48" />
        </div>
        <div className="max-w-3xl relative z-10">
          <h2 className="text-3xl font-black mb-6">Why we charge for Pro</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="bg-white/20 p-3 rounded-2xl h-fit">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Secure HD Storage</h4>
                <p className="text-sm opacity-80 leading-relaxed">High-quality photos of your work are stored securely and permanently.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/20 p-3 rounded-2xl h-fit">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">AI-Powered Trust</h4>
                <p className="text-sm opacity-80 leading-relaxed">Gemini AI analyzes your work logs to prevent fraud and boost your reputation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
