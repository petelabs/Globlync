
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
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Logo } from "@/components/Navigation";
import { formatDistanceToNow } from "date-fns";

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

  return (
    <div className="flex flex-col gap-16 py-6">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-12">
        <div className="mb-4 animate-in zoom-in duration-700">
          <Logo className="scale-[2.5] mb-8" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary animate-pulse">
          <Sparkles className="h-4 w-4" />
          <span>Portable, AI-Verified Reputation</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:leading-tight">
          Trust is the new <span className="animate-shimmer-text italic">Currency.</span>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Globlync helps skilled professionals—plumbers, electricians, cleaners—build a digital resume backed by AI-verified proof.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row mt-4">
          <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-xl hover:scale-105 transition-transform" asChild>
            <Link href="/login">Build Your Profile</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-lg" asChild>
            <Link href="/search">Find Verified Pros</Link>
          </Button>
        </div>
      </section>

      {/* New Workers Showcase */}
      {newcomers && newcomers.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="bg-secondary/20 p-1.5 rounded-lg">
                <Sparkles className="h-5 w-5 text-secondary fill-secondary" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">New to Globlync</h2>
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
                      {worker.tradeSkill || "Skilled Professional"}
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
        <section className="py-12 bg-accent/30 rounded-[3rem] px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 flex items-center justify-center gap-3">
              Voices of Globlync Professionals
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
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">The 3-Step Trust Loop</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Log Your Work",
              desc: "Snap a photo and describe the job. Our AI analyzes the proof instantly.",
              icon: Sparkles
            },
            {
              step: "02",
              title: "Client Scan",
              desc: "Show your QR code. Clients confirm completion in one tap—no login required.",
              icon: QrCode
            },
            {
              step: "03",
              title: "Build Score",
              desc: "Every verified job boosts your Trust Score and unlocks professional badges.",
              icon: Award
            }
          ].map((item, i) => (
            <div key={i} className="relative p-8 rounded-3xl bg-card border shadow-sm flex flex-col items-center text-center">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-black px-3 py-1 rounded-full">STEP {item.step}</span>
              <item.icon className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center py-12 border-t mt-12">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Logo />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
            Built by Petediano Tech • Established 2026
          </p>
          <div className="flex gap-4 mt-2">
            <Button variant="ghost" size="sm" className="rounded-full text-[10px]" asChild>
              <Link href="/jobs">Post a Job</Link>
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-[10px]" asChild>
              <Link href="/search">Find Workers</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
