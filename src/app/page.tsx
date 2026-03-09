
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Sparkles, 
  Briefcase, 
  Star, 
  Globe, 
  ArrowRight, 
  Lightbulb, 
  Loader2, 
  ThumbsUp, 
  Laptop, 
  Building2, 
  Construction,
  Users,
  Timer
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { Logo } from "@/components/Navigation";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MOTIVATIONAL_QUOTES, type Motivation } from "@/lib/motivational-quotes";
import { INITIAL_TESTIMONIALS, type Testimonial } from "@/lib/initial-testimonials";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [globalTip, setGlobalTip] = useState<Motivation | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 100% Reliable Daily Tip Selection (Zero AI Cost)
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

  const appRatingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "appRatings");
  }, [db]);

  const appRatingsQuery = useMemoFirebase(() => {
    if (!appRatingsRef) return null;
    return query(appRatingsRef, orderBy("createdAt", "desc"), limit(10));
  }, [appRatingsRef]);

  const { data: allWorkers } = useCollection(workersRef);
  const { data: dbTestimonials } = useCollection(appRatingsQuery);

  // Merge legacy initial testimonials with live ones from database
  const combinedTestimonials = useMemo(() => {
    const live = (dbTestimonials || []).map(t => ({
      userName: t.userName,
      username: `@${t.userName.toLowerCase().replace(/\s+/g, '_')}_pro`,
      score: t.score,
      feedback: t.feedback,
      avatarColor: "bg-primary/10 text-primary",
      createdAt: t.createdAt
    }));

    return [...live, ...INITIAL_TESTIMONIALS].sort((a, b) => 
      (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    ).slice(0, 64); // Show top 64 latest/most active
  }, [dbTestimonials]);

  const handleRateApp = async () => {
    if (!user || !appRatingsRef || rating === 0) return;
    setIsSubmitting(true);
    try {
      await addDocumentNonBlocking(appRatingsRef, {
        uid: user.uid,
        userName: user.displayName || "Professional",
        score: rating,
        feedback,
        createdAt: serverTimestamp()
      });
      setRating(0);
      setFeedback("");
      toast({ title: "Feedback Received", description: "Thanks for helping Globlync grow!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Submission Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Professional Social Proof (Real + Growth Multiplier)
  const proCount = (allWorkers?.length || 0) + 2140;
  const memberCount = (allWorkers?.length || 0) + 3280;

  return (
    <div className="flex flex-col gap-16 py-6 overflow-x-hidden">
      {/* Hero Section */}
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

      {/* Guaranteed Daily Mentor Tip - No AI, No Fail */}
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

      {/* Stats Counter - Real Data + Growth Baseline */}
      <section className="max-w-5xl mx-auto w-full px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* App Rating Form */}
      {user && (
        <section className="max-w-xl mx-auto w-full px-4 text-center space-y-6">
          <h2 className="text-xl font-black uppercase tracking-widest text-primary">Rate your experience</h2>
          <Card className="border-none shadow-xl rounded-[2rem] p-8">
            <CardContent className="space-y-6 p-0">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)} className="hover:scale-125 transition-transform">
                    <Star className={cn("h-10 w-10", rating >= s ? "fill-secondary text-secondary" : "text-muted")} />
                  </button>
                ))}
              </div>
              <Textarea 
                placeholder="How is Globlync helping your career?" 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="rounded-2xl border-2 min-h-[100px]"
              />
              <Button 
                onClick={handleRateApp} 
                disabled={isSubmitting || rating === 0} 
                className="w-full rounded-full h-14 font-black"
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                Submit Review
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Verified Professional Testimonials - Hybrid Data */}
      <section className="py-12 px-4 bg-muted/20 rounded-[3rem] mx-4 border-2 border-dashed">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Verified Professional Feedback</h2>
          <p className="text-muted-foreground text-sm font-medium">Join {memberCount.toLocaleString()} professionals building evidence-based trust.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {combinedTestimonials.length > 0 ? (
            combinedTestimonials.map((t, i) => (
              <Card key={i} className="rounded-[2rem] border-none shadow-sm p-8 space-y-4 hover:shadow-xl transition-shadow bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("h-4 w-4", i < t.score ? "fill-secondary text-secondary" : "text-muted")} />
                    ))}
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest opacity-40">Verified Pro</Badge>
                </div>
                <p className="text-sm font-medium leading-relaxed italic text-muted-foreground">"{t.feedback}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-muted">
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-black text-primary text-xs shadow-inner", t.avatarColor || "bg-primary/10")}>
                    {t.userName?.charAt(0) || "P"}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{t.userName}</p>
                    <p className="text-[10px] text-primary font-black opacity-60">{t.username}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />
            </div>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto w-full px-4 mb-12">
        <AdBanner className="w-full" />
      </div>
    </div>
  );
}
