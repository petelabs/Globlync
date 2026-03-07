
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
  Search as SearchIcon,
  Camera,
  Zap
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
  const { data: newcomers } = useCollection(newcomersQuery);

  const NATIVE_AD_ID = "732a8eb1f93a972b628ecf38814db400";

  // Demo workers if DB is empty to prevent blank UI
  const demoWorkers = newcomers && newcomers.length > 0 ? newcomers : [
    { id: '1', name: 'James Mwale', tradeSkill: 'Master Plumber', trustScore: 120, profilePictureUrl: 'https://images.unsplash.com/photo-1635221798248-8a3452ad07cd?q=80&w=400&auto=format&fit=crop' },
    { id: '2', name: 'Blessings Phiri', tradeSkill: 'Solar Technician', trustScore: 95, profilePictureUrl: 'https://images.unsplash.com/photo-1618090584176-7132b9911657?q=80&w=400&auto=format&fit=crop' },
    { id: '3', name: 'Maria Banda', tradeSkill: 'Interior Designer', trustScore: 88, profilePictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop' },
    { id: '4', name: 'Chifundo Gondwe', tradeSkill: 'Bricklayer', trustScore: 110, profilePictureUrl: 'https://images.unsplash.com/photo-1626081062126-d3b192c1fcb0?q=80&w=400&auto=format&fit=crop' }
  ];

  return (
    <div className="flex flex-col gap-16 py-6 overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="mb-4 animate-in zoom-in duration-700">
          <Logo className="scale-[2] mb-8" />
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

      {/* Explicit Purpose Section */}
      <section className="bg-primary/5 rounded-[3rem] p-10 md:p-16 border-2 border-primary/10 mx-4 shadow-inner">
        <div className="max-w-4xl mx-auto space-y-12">
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
            {[
              { title: "Informal Workers", desc: "Artisans building portable trust globally.", icon: Users },
              { title: "Formal Sector", desc: "Professional specialists verifying expertise.", icon: Building2 },
              { title: "Job Seekers", desc: "Seeking opportunities across the globe.", icon: SearchIcon },
              { title: "Advertisers", desc: "Businesses connecting with global audiences.", icon: Sparkles }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm space-y-3 border border-primary/5 text-center hover:scale-105 transition-transform cursor-default group">
                <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-sm">{item.title}</h3>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Workers Showcase */}
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
          {demoWorkers.map((worker) => (
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
                    <Clock className="h-3 w-3" /> joined recently
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 px-4 bg-muted/20 rounded-[3rem] mx-4 border-2 border-dashed">
        <h2 className="text-3xl font-bold text-center mb-16">Building Global Trust</h2>
        <div className="grid gap-12 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Create Profile",
              desc: "Sign up as a professional. Upload a professional photo to build instant trust globally.",
              icon: Camera,
              color: "bg-blue-500"
            },
            {
              step: "02",
              title: "Log & Verify",
              desc: "Log your completed jobs. Use AI and client QR scans to prove your expertise worldwide.",
              icon: QrCode,
              color: "bg-primary"
            },
            {
              step: "03",
              title: "Scale Career",
              desc: "Your verifiable reputation attracts higher-paying jobs and better global opportunities.",
              icon: Zap,
              color: "bg-secondary"
            }
          ].map((item, i) => (
            <div key={i} className="relative p-10 rounded-[3rem] bg-white border shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
              <span className={`absolute -top-6 left-1/2 -translate-x-1/2 ${item.color} text-white text-xs font-black px-4 py-2 rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>STEP {item.step}</span>
              <div className={`p-6 rounded-[2.5rem] ${item.color}/10 mb-6`}>
                <item.icon className={`h-12 w-12 ${item.color.replace('bg-', 'text-')}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <AdBanner id={NATIVE_AD_ID} className="max-w-4xl mx-auto w-full px-4" />
    </div>
  );
}
