
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
  Star
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Logo } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";
import { MOTIVATIONAL_QUOTES, type Motivation } from "@/lib/motivational-quotes";

export default function Home() {
  const db = useFirestore();
  const [globalTip, setGlobalTip] = useState<Motivation | null>(null);

  useEffect(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const tipIndex = dayOfYear % MOTIVATIONAL_QUOTES.length;
    setGlobalTip(MOTIVATIONAL_QUOTES[tipIndex]);
  }, []);

  const workersRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "workerProfiles");
  }, [db]);

  const { data: allWorkers } = useCollection(workersRef);

  const memberCount = (allWorkers?.length || 0) + 3280;
  const proCount = (allWorkers?.length || 0) + 2140;

  return (
    <div className="flex flex-col gap-16 py-6 overflow-x-hidden">
      <section className="flex flex-col items-center text-center gap-6 py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <div className="mb-4 animate-in zoom-in duration-700">
          <Logo className="scale-[2] mb-8" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary animate-pulse">
          <Globe className="h-3 w-3" />
          <span>100+ Global Jobs Verified Hourly</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:leading-tight">
          Trust is the new <span className="text-primary font-black animate-shimmer-text">Currency.</span>
        </h1>
        
        <p className="max-w-[800px] text-lg text-muted-foreground sm:text-xl font-medium leading-relaxed">
          The global remote economy moves fast. Build a digital, evidence-based reputation that follows you everywhere. <span className="text-primary font-bold underline decoration-secondary">Free for Life</span>.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row mt-4">
          <Button size="lg" className="rounded-full px-10 h-16 text-lg shadow-xl hover:scale-105 transition-transform font-black" asChild>
            <Link href="/login">Secure My @Username</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-10 h-16 text-lg font-black border-2" asChild>
            <Link href="/jobs">Browse Remote Jobs <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-4 bg-orange-500/10 px-6 py-3 rounded-2xl border-2 border-orange-500/20">
          <Timer className="h-4 w-4 text-orange-600 animate-spin" />
          <p className="text-[10px] font-black uppercase text-orange-700 tracking-widest">
            Warning: 14 unique usernames reserved in the last hour. Secure yours now.
          </p>
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

      <section className="max-w-5xl mx-auto w-full px-4 grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Members Registered", value: `${memberCount.toLocaleString()}`, icon: Users },
          { label: "Verified Pros", value: `${proCount.toLocaleString()}`, icon: ShieldCheck },
          { label: "Remote Focus", value: "92%", icon: Globe },
          { label: "Trust Earned", value: "4.9/5", icon: Star }
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-1 group cursor-default">
            <div className="bg-muted/50 p-3 rounded-2xl group-hover:bg-primary/10 transition-colors">
              <stat.icon className="h-5 w-5 text-primary/60" />
            </div>
            <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="max-w-4xl mx-auto w-full px-4 mb-20">
        <AdBanner className="w-full" />
      </div>
    </div>
  );
}
