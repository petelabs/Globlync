"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Search as SearchIcon
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Logo } from "@/components/Navigation";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";

export default function Home() {
  const db = useFirestore();

  const appRatingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "appRatings");
  }, [db]);

  const appRatingsQuery = useMemoFirebase(() => {
    if (!appRatingsRef) return null;
    return query(appRatingsRef, orderBy("createdAt", "desc"), limit(6));
  }, [appRatingsRef]);

  const workersRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "workerProfiles");
  }, [db]);

  const newcomersQuery = useMemoFirebase(() => {
    if (!workersRef) return null;
    return query(workersRef, orderBy("createdAt", "desc"), limit(10));
  }, [workersRef]);

  const { data: testimonials } = useCollection(appRatingsQuery);
  const { data: newcomers, isLoading: isNewcomersLoading } = useCollection(newcomersQuery);

  const NATIVE_AD_ID = "732a8eb1f93a972b628ecf38814db400";

  return (
    <div className="flex flex-col gap-16 py-6 overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-12 px-4">
        <div className="mb-4 animate-in zoom-in duration-700">
          <Logo className="scale-[2.5] mb-8" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary animate-float">
          <Sparkles className="h-4 w-4" />
          <span>Professional Reputation for Every Expert</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:leading-tight">
          Trust is the new <span className="animate-shimmer-text italic font-black">Currency.</span>
        </h1>
        <p className="max-w-[800px] text-lg text-muted-foreground sm:text-xl font-medium">
          Globlync connects formal and informal <span className="text-primary font-bold">Professionals</span>, job seekers, and advertisers globally. Build a digital, AI-verified resume that proves your skills worldwide.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row mt-4">
          <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-xl hover:scale-105 transition-transform" asChild>
            <Link href="/login">Join the Network</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-lg" asChild>
            <Link href="/search">Find Verified Pros</Link>
          </Button>
        </div>
      </section>

      {/* Ad placement 1: Hero Bottom */}
      <AdBanner id={NATIVE_AD_ID} className="max-w-4xl mx-auto w-full px-4" />

      {/* Explicit Purpose Section (for Global Verification) */}
      <section className="bg-primary/5 rounded-[3rem] p-10 md:p-16 border-2 border-primary/10 mx-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col items-center text-center gap-4">
            <Badge variant="outline" className="bg-white px-4 py-1 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
              Global Purpose
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-center">For Every Professional Worldwide</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              Whether you are an informal artisan, a formal specialist, or an advertiser looking to reach a worldwide audience, Globlync is your professional hub. We bridge the trust gap with transparent verification for the entire labor market.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm space-y-3 border border-primary/5 text-center hover:scale-105 transition-transform cursor-default">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm">Informal Workers</h3>
              <p className="text-[10px] text-muted-foreground">Artisans building portable trust globally.</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm space-y-3 border border-primary/5 text-center hover:scale-105 transition-transform cursor-default">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
                <Building2 className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm">Formal Sector</h3>
              <p className="text-[10px] text-muted-foreground">Professional specialists verifying expertise.</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm space-y-3 border border-primary/5 text-center hover:scale-105 transition-transform cursor-default">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
                <SearchIcon className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm">Job Seekers</h3>
              <p className="text-[10px] text-muted-foreground">Seeking opportunities across the globe.</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm space-y-3 border border-primary/5 text-center hover:scale-105 transition-transform cursor-default">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm">Advertisers</h3>
              <p className="text-[10px] text-muted-foreground">Businesses connecting with global audiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad placement 2: Mid-Content */}
      <AdBanner id={NATIVE_AD_ID} className="max-w-4xl mx-auto w-full px-4" />

      {/* Global Workers Showcase */}
      {newcomers && newcomers.length > 0 && (
        <section className="space-y-6 px-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="bg-secondary/20 p-1.5 rounded-lg">
                <Sparkles className="h-5 w-5 text-secondary fill-secondary" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Global Professionals</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-primary font-bold" asChild>
              <Link href="/search">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
            {newcomers.map((worker) => (
              <Link key={worker.id} href={`/public/${worker.id}`} className="shrink-0 transition-transform hover:scale-[1.02] active:scale-95">
                <Card className="w-56 border-none shadow-lg overflow-hidden bg-card">
                  <div className="h-40 w-full bg-muted relative">
                    <img 
                      src={worker.profilePictureUrl || `https://picsum.photos/seed/${worker.id}/300/300`} 
                      alt={worker.name} 
                      className="h-full w-full object-cover" 
                    />
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-black text-primary shadow-lg">
                      <ShieldCheck className="h-3.5 w-3.5" /> {worker.trustScore || 0}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm truncate">{worker.name}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-tighter truncate mt-0.5">
                      {worker.tradeSkill || "Verified Professional"}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                      <Clock className="h-3 w-3" /> 
                      {worker.createdAt?.seconds 
                        ? formatDistanceToNow(new Date(worker.createdAt.seconds * 1000), { addSuffix: true }) 
                        : "joined recently"}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Community Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-12 bg-accent/30 rounded-[3rem] px-8 mx-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 flex items-center justify-center gap-3">
              Voices of Professionals
              <Star className="h-6 w-6 text-secondary fill-secondary" />
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex text-secondary">
                      {[...Array(t.score)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 h-4 w-4 text-primary/10" />
                      <p className="text-sm italic text-muted-foreground leading-relaxed pl-4">
                        {t.comment || "Globlync is changing how I find work!"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                        {t.workerName?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold">{t.workerName}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Building Global Trust</h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Create Your Profile",
              desc: "Sign up as a professional. Upload a professional photo to build instant trust globally.",
              icon: Sparkles
            },
            {
              step: "02",
              title: "Log & Verify",
              desc: "Log your completed jobs. Use AI and client QR scans to prove your expertise nationwide and beyond.",
              icon: QrCode
            },
            {
              step: "03",
              title: "Scale Your Career",
              desc: "Your verifiable reputation attracts higher-paying jobs and better global opportunities.",
              icon: Award
            }
          ].map((item, i) => (
            <div key={i} className="relative p-8 rounded-3xl bg-card border shadow-sm flex flex-col items-center text-center">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-black px-3 py-1 rounded-full">PHASE {item.step}</span>
              <item.icon className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ad placement 3: Footer Top */}
      <AdBanner id={NATIVE_AD_ID} className="max-w-4xl mx-auto w-full mb-8 px-4" />

      {/* Footer Branding */}
      <footer className="bg-primary/5 py-16 border-t mt-12 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
            <div className="space-y-6 text-center md:text-left">
              <Logo className="justify-center md:justify-start" />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto md:mx-0">
                Building a verifiable labor market for every professional across the globe.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                <MapPin className="h-3 w-3" /> HQ: Mulanje, Malawi (Global Support)
              </div>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Platform</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Find Professionals</Link>
                <Link href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Find Work</Link>
                <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Advertising</Link>
              </nav>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Support</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact Us</Link>
                <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              </nav>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Office</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Petediano Tech<br/>
                Dzenje Village, Mulanje<br/>
                Republic of Malawi
              </p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            <p>© 2026 Petediano Tech • Global</p>
            <div className="flex gap-6">
              <Link href="/contact" className="hover:text-primary transition-colors">Report an Ad</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}