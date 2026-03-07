
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

  const { data: testimonials } = useCollection(appRatingsQuery);

  const NATIVE_AD_ID = "732a8eb1f93a972b628ecf38814db400";

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
          <span>Professional Reputation for Every Malawian Expert</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:leading-tight">
          Trust is the new <span className="text-primary font-black">Currency.</span>
        </h1>
        <p className="max-w-[800px] text-lg text-muted-foreground sm:text-xl font-medium">
          Globlync connects formal and informal <span className="text-primary font-bold">Professionals</span>, job seekers, and advertisers across Malawi. Build a digital, AI-verified resume that proves your skills nationwide.
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
              National Purpose
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-center">For Every Professional in Malawi</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              Whether you are an informal artisan, a formal specialist, or an advertiser looking to reach a nationwide audience, Globlync is your professional hub. We bridge the trust gap with transparent verification for the entire Malawian labor market.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Informal Workers", desc: "Artisans building portable trust across districts.", icon: Users },
              { title: "Formal Sector", desc: "Professional specialists verifying expertise.", icon: Building2 },
              { title: "Job Seekers", desc: "Seeking opportunities within Malawi.", icon: SearchIcon },
              { title: "Advertisers", desc: "Businesses connecting with Malawian audiences.", icon: Sparkles }
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
        <h2 className="text-3xl font-bold text-center mb-16">Building National Trust</h2>
        <div className="grid gap-12 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Create Profile",
              desc: "Sign up as a professional. Upload a professional photo to build instant trust in your district.",
              icon: Camera,
              color: "bg-blue-500"
            },
            {
              step: "02",
              title: "Log & Verify",
              desc: "Log your completed jobs. Use AI and client QR scans to prove your expertise to anyone in Malawi.",
              icon: QrCode,
              color: "bg-primary"
            },
            {
              step: "03",
              title: "Scale Career",
              desc: "Your verifiable reputation attracts higher-paying jobs and better national opportunities.",
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
