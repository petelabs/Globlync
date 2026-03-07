
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
  Zap,
  HardHat
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

  const { data: testimonials } = useCollection(appRatingsQuery);

  return (
    <div className="flex flex-col gap-16 py-6 overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="mb-4 animate-in zoom-in duration-700">
          <Logo className="scale-[2] mb-8" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          <span>Professional Reputation for Everyone, Everywhere</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:leading-tight">
          Trust is the new <span className="text-primary font-black animate-shimmer-text">Currency.</span>
        </h1>
        <p className="max-w-[800px] text-lg text-muted-foreground sm:text-xl font-medium">
          Building your professional identity is <span className="text-primary font-bold underline decoration-secondary">Free for Life</span>. Join the global network of verified professionals and build portable trust.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row mt-4">
          <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-xl hover:scale-105 transition-transform font-black" asChild>
            <Link href="/login">Create Free Profile</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-lg font-black" asChild>
            <Link href="/search">Find Verified Pros</Link>
          </Button>
        </div>
      </section>

      {/* Reward Promotion */}
      <div className="max-w-4xl mx-auto w-full px-4">
        <AdBanner className="w-full" />
      </div>

      {/* Global Purpose Section */}
      <section className="bg-primary/5 rounded-[3rem] p-10 md:p-16 border-2 border-primary/10 mx-4 shadow-inner">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex flex-col items-center text-center gap-4">
            <Badge variant="outline" className="bg-white px-4 py-1 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
              Global Purpose (HQ: Malawi)
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-center">A Verified Identity for All</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              We believe everyone deserves a way to prove their expertise. From local artisans to global specialists, Globlync is a free-to-use platform that bridges the trust gap with AI-powered verification.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Artisans", desc: "Plumbers, Electricians, and Masons.", icon: HardHat },
              { title: "Specialists", desc: "Corporate pros and office experts.", icon: Building2 },
              { title: "Tech Experts", desc: "Designers and Software developers.", icon: SearchIcon },
              { title: "Businesses", desc: "Looking for trusted, local talent.", icon: Sparkles }
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

      {/* How it Works - The Trust Loop */}
      <section className="py-12 px-4 bg-muted/20 rounded-[3rem] mx-4 border-2 border-dashed">
        <h2 className="text-3xl font-black text-center mb-16 uppercase tracking-tighter">Universal Trust Loop</h2>
        <div className="grid gap-12 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Log Your Work",
              desc: "Upload photos and details of your completed jobs. It's free and takes 1 minute.",
              icon: Camera,
              color: "bg-blue-500"
            },
            {
              step: "02",
              title: "AI Verification",
              desc: "Our AI analyzes your work proof to build instant trust with future clients.",
              icon: ShieldCheck,
              color: "bg-primary"
            },
            {
              step: "03",
              title: "Get Hired",
              desc: "Share your professional link with anyone. Your verified reputation gets you more work.",
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

      <div className="max-w-4xl mx-auto w-full px-4 mb-12">
        <AdBanner className="w-full" />
      </div>
    </div>
  );
}
