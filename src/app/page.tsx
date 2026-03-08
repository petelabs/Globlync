
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldCheck, 
  QrCode, 
  TrendingUp, 
  Award, 
  Sparkles, 
  CheckCircle, 
  Users, 
  Lock,
  Star,
  Quote,
  Share2,
  Clock,
  ChevronRight,
  Mail,
  LifeBuoy,
  Briefcase,
  MapPin,
  Info,
  Building2,
  Search as SearchIcon,
  Camera,
  Zap,
  HardHat,
  Lightbulb,
  Loader2,
  Globe,
  Laptop,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase, useDoc, updateDocumentNonBlocking, setDocumentNonBlocking, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { Logo } from "@/components/Navigation";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";
import { generateDailyTip } from "@/ai/flows/generate-daily-tip-flow";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [globalTip, setGlobalTip] = useState<{ title: string; content: string } | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return query(appRatingsRef, orderBy("createdAt", "desc"), limit(6));
  }, [appRatingsRef]);

  const { data: allWorkers } = useCollection(workersRef);
  const { data: testimonials } = useCollection(appRatingsQuery);

  useEffect(() => {
    async function syncDailyTip() {
      if (!db) return;
      const tipRef = doc(db, "system", "dailyTip");
      
      try {
        const snap = await getDoc(tipRef);
        const now = new Date();
        let needsUpdate = true;

        if (snap.exists()) {
          const data = snap.data();
          const lastUpdate = data.updatedAt?.toDate() || new Date(0);
          const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
          
          if (diffHours < 24) {
            setGlobalTip({ title: data.title, content: data.content });
            needsUpdate = false;
          }
        }

        if (needsUpdate) {
          const result = await generateDailyTip({ trade: "Global Professional & Remote Scaling" });
          const tipData = {
            title: result.tipTitle,
            content: result.tipContent,
            updatedAt: serverTimestamp()
          };
          await setDocumentNonBlocking(tipRef, tipData, { merge: true });
          setGlobalTip({ title: result.tipTitle, content: result.tipContent });
        }
      } catch (err) {
        console.error("Tip sync error:", err);
      } finally {
        setIsTipLoading(false);
      }
    }

    syncDailyTip();
  }, [db]);

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
            <Link href="/login">Create Global Profile</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-10 h-16 text-lg font-black border-2" asChild>
            <Link href="/jobs">Browse Remote Jobs <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Global AI Daily Tip */}
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
                <Badge className="bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest">Global Career Insight</Badge>
                {isTipLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
              </div>
              {globalTip ? (
                <>
                  <h3 className="text-2xl font-black tracking-tighter text-foreground leading-none">{globalTip.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{globalTip.content}</p>
                </>
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

      {/* Stats Counter */}
      <section className="max-w-5xl mx-auto w-full px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Jobs Hourly", value: "100+", icon: Briefcase },
          { label: "Verified Pros", value: allWorkers ? `${allWorkers.length}+` : "12K+", icon: ShieldCheck },
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

      {/* Reward Promotion */}
      <div className="max-w-4xl mx-auto w-full px-4">
        <AdBanner className="w-full" />
      </div>

      {/* App Rating Form (Visible to logged in users) */}
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

      {/* Real Testimonials Section */}
      <section className="py-12 px-4 bg-muted/20 rounded-[3rem] mx-4 border-2 border-dashed">
        <h2 className="text-3xl font-black text-center mb-16 uppercase tracking-tighter">What Pros are Saying</h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials && testimonials.length > 0 ? (
            testimonials.map((t, i) => (
              <Card key={i} className="rounded-[2rem] border-none shadow-sm p-8 space-y-4">
                <div className="flex gap-1">
                  {[...Array(t.score)].map((_, i) => <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />)}
                </div>
                <p className="text-sm font-medium italic leading-relaxed">"{t.feedback}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                    {t.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{t.userName}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(t.createdAt?.seconds * 1000), { addSuffix: true })}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground font-medium">No professional reviews yet. Be the first to rate us!</p>
            </div>
          )}
        </div>
      </section>

      {/* Global Purpose Section */}
      <section className="bg-primary/5 rounded-[3rem] p-10 md:p-16 border-2 border-primary/10 mx-4 shadow-inner">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex flex-col items-center text-center gap-4">
            <Badge variant="outline" className="bg-white px-4 py-1 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
              The Global Standard (HQ: Malawi)
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-center">Verified Identity for the Remote Economy</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              Whether you're a developer in Blantyre or a designer in London, Globlync bridges the trust gap. We help you prove your expertise with AI-verified evidence that clients actually believe.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Tech Experts", desc: "Developers, Designers, and IT Specialists.", icon: Laptop },
              { title: "Business Pros", desc: "Accountants, Virtual Assistants, and Sales.", icon: Building2 },
              { title: "Creatives", desc: "Writers, Editors, and Media Experts.", icon: Sparkles },
              { title: "Skilled Trades", desc: "Engineering and Expert Technical Services.", icon: HardHat }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm space-y-3 border border-primary/5 text-center hover:scale-105 transition-transform cursor-default group">
                <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-sm">{item.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto w-full px-4 mb-12">
        <AdBanner className="w-full" />
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ThumbsUp({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}
