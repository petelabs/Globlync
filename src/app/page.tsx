
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
  Briefcase,
  MapPin,
  Crown,
  MessageSquare,
  Star,
  Smartphone
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Logo } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";
import { MOTIVATIONAL_QUOTES, type Motivation } from "@/lib/motivational-quotes";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user } = useUser();
  const db = useFirestore();
  const [globalTip, setGlobalTip] = useState<Motivation | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const tipIndex = dayOfYear % MOTIVATIONAL_QUOTES.length;
    setGlobalTip(MOTIVATIONAL_QUOTES[tipIndex]);
  }, []);

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);

  const isPro = profile?.isPro || profile?.activeBenefits?.some((b: any) => new Date(b.expiresAt) > new Date());

  return (
    <div className="flex flex-col gap-12 py-6 overflow-x-hidden">
      {/* Installation Banner for Mobile */}
      {isMobile && (
        <section className="max-w-5xl mx-auto w-full px-4 animate-in slide-in-from-top-4 duration-500">
          <Card className="bg-primary border-none text-white rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">App Experience Ready</p>
                  <p className="text-[10px] opacity-80 font-medium">Install Globlync for instant reputation tracking.</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="rounded-full font-black text-[9px] uppercase px-4 h-8 shadow-lg">
                Install App
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Promotion or Signed-In Dashboard */}
      <section className="max-w-5xl mx-auto w-full px-4">
        {!user ? (
          <Card className="border-none bg-accent/10 border-2 border-accent/20 rounded-[2.5rem] overflow-hidden relative group shadow-xl animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Crown className="h-32 w-32" />
            </div>
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="bg-accent p-6 rounded-[2rem] shadow-lg text-white animate-bounce">
                <Gift className="h-10 w-10" />
              </div>
              <div className="space-y-2 flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Badge className="bg-accent text-white font-black text-[9px] uppercase tracking-[0.2em]">Pioneer Bonus Active</Badge>
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-foreground leading-tight">
                  15 Days <span className="text-accent">FREE Pro VIP</span> for New Recruits!
                </h2>
                <p className="text-sm text-muted-foreground font-medium max-w-xl">
                  Join the national directory today. Every new account registered in the next 60 days automatically earns 15 days of Pro status.
                </p>
              </div>
              <Button size="lg" className="rounded-full px-8 bg-accent hover:bg-accent/90 text-white font-black h-14" asChild>
                <Link href="/login">Claim My 15 Days</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Pro Confirmation */}
            <Card className="border-none bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden shadow-xl relative group border-4 border-primary/20">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Crown className="h-24 w-24" />
              </div>
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white font-black text-[9px] uppercase border-none">Active Identity</Badge>
                  {isPro && <div className="bg-secondary text-secondary-foreground p-1 rounded-full"><Crown className="h-3 w-3" /></div>}
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter leading-none">
                  Welcome Back, <br/><span className="text-secondary">@{profile?.username || "Pro"}</span>
                </h2>
                <p className="text-xs font-medium opacity-80 leading-relaxed">
                  {isPro ? "Your Pioneer Pro VIP benefits are active. You're ranked higher in the national directory." : "Build your trust score by logging your first job today."}
                </p>
                <div className="pt-2">
                  <Button variant="secondary" size="sm" className="rounded-full font-black text-[10px] uppercase h-9 px-6 shadow-lg" asChild>
                    <Link href="/profile">Manage My Hub</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invite Encouragement */}
            <Card className="border-none bg-secondary/10 border-2 border-secondary/20 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
              <CardContent className="p-8 flex flex-col justify-between h-full gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-secondary font-black uppercase text-[10px] tracking-widest">
                    <Users className="h-4 w-4" /> Invite & Scale
                  </div>
                  <h3 className="text-2xl font-black tracking-tight leading-none text-foreground">Grow Your Network.</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    Invite colleagues to Globlync. More professionals means more clients, <b>more reviews</b> on your work, and direct secure chats.
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase">+ {profile?.referralCount || 0} Invited</span>
                </div>
                <Button variant="outline" className="w-full rounded-full font-black border-2 h-12" asChild>
                  <Link href="/referrals">Open Referral Roadmap <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-8 px-4 relative overflow-hidden mt-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <div className="mb-4 animate-in zoom-in duration-700">
          <Logo className="scale-[1.5] mb-8 animate-float" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <MapPin className="h-3.5 w-3.5" />
            <span>National Directory for Malawian Pros</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:leading-tight">
            Prove Your Skill. <br/>Build Your <span className="text-primary font-black animate-shimmer-text">Legacy.</span>
          </h1>
        </div>
        
        <p className="max-w-[800px] text-lg text-muted-foreground sm:text-xl font-medium leading-relaxed px-4">
          Replace social media noise with a <span className="text-primary font-bold underline decoration-accent">Verifiable Professional Identity</span>. Headquartered in Malawi, serving the world.
        </p>

        <div className="flex flex-col gap-6 sm:flex-row mt-10 w-full max-w-2xl px-4">
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button size="lg" className="rounded-full px-10 h-24 text-2xl shadow-2xl hover:scale-105 transition-all font-black flex-1 animate-pulse-cta border-4 border-accent/20 bg-accent text-white" asChild>
                <Link href="/profile">OPEN MY HUB <ArrowRight className="ml-3 h-8 w-8" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-10 h-24 text-xl font-black border-4 flex-1 hover:bg-muted/50 transition-all text-primary" asChild>
                <Link href="/referrals">INVITE FRIENDS</Link>
              </Button>
            </div>
          ) : (
            <>
              <Button size="lg" className="rounded-full px-12 h-28 text-3xl shadow-[0_32px_64px_-12px_rgba(16,185,129,0.4)] hover:scale-105 transition-all font-black flex-1 animate-pulse-cta animate-button-shimmer text-white border-4 border-white/20" asChild>
                <Link href="/login">CREATE MY ACCOUNT</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-10 h-28 text-3xl font-black border-4 flex-1 hover:bg-muted/50 transition-all" asChild>
                <Link href="/login">SIGN IN</Link>
              </Button>
            </>
          )}
        </div>

        {/* Dynamic Social Proof Marquee */}
        <div className="mt-16 w-full overflow-hidden relative">
          <div className="flex gap-8 animate-marquee whitespace-nowrap py-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex items-center gap-2 bg-white shadow-sm border px-4 py-2 rounded-full">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">Recent Evidence Verified in Malawi: @pioneer_member_{i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Mentor Tip */}
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
                <Badge className="bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest">Daily National Tip</Badge>
              </div>
              {globalTip ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000">
                  <h3 className="text-2xl font-black tracking-tighter text-foreground leading-none">{globalTip.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed mt-2">"{globalTip.content}"</p>
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-3">— Expert Insight for Malawian Pros</p>
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

      {/* High Trust Section */}
      <section className="max-w-5xl mx-auto w-full px-4 flex flex-col items-center gap-8 mb-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-widest text-primary">High-Trust Ecosystem</h2>
          <p className="text-muted-foreground text-sm font-medium">Empowering the Malawian labor market with verifiable skill.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <Card className="border-none bg-muted/30 p-8 rounded-[2rem] text-center space-y-4 group hover:bg-primary/5 transition-all hover:-translate-y-1">
            <div className="bg-white p-4 rounded-2xl shadow-sm w-fit mx-auto group-hover:scale-110 transition-transform">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-black text-lg">Growth Tracking</h3>
            <p className="text-xs text-muted-foreground font-medium">Every verified job log increases your national Trust Score automatically.</p>
          </Card>
          <Card className="border-none bg-muted/30 p-8 rounded-[2rem] text-center space-y-4 group hover:bg-primary/5 transition-all hover:-translate-y-1">
            <div className="bg-white p-4 rounded-2xl shadow-sm w-fit mx-auto group-hover:scale-110 transition-transform">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-black text-lg">Verified Ratings</h3>
            <p className="text-xs text-muted-foreground font-medium">Receive only positive, constructive feedback designed to help you improve your trade.</p>
          </Card>
          <Card className="border-none bg-muted/30 p-8 rounded-[2rem] text-center space-y-4 group hover:bg-primary/5 transition-all hover:-translate-y-1">
            <div className="bg-white p-4 rounded-2xl shadow-sm w-fit mx-auto group-hover:scale-110 transition-transform">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-black text-lg">Direct Messaging</h3>
            <p className="text-xs text-muted-foreground font-medium">Connect securely with other professionals and clients across all 28 districts.</p>
          </Card>
        </div>
      </section>

      <div className="max-w-4xl mx-auto w-full px-4 mb-20">
        <AdBanner className="w-full" />
      </div>
    </div>
  );
}
