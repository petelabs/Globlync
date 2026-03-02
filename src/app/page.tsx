
"use client";

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
  Quote
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-16 py-6">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary animate-pulse">
          <Sparkles className="h-4 w-4" />
          <span>Portable, AI-Verified Reputation</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:leading-tight">
          Trust is the new <span className="text-primary">Currency.</span>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Globlync helps skilled professionals—plumbers, electricians, cleaners—build a digital resume backed by AI-verified proof and real client ratings.
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

      {/* Trust Bar */}
      <section className="border-y bg-muted/30 py-8">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5" /> AI VERIFIED</div>
          <div className="flex items-center gap-2 font-bold"><Lock className="h-5 w-5" /> SECURE DATA</div>
          <div className="flex items-center gap-2 font-bold"><Users className="h-5 w-5" /> 100% TRANSPARENT</div>
          <div className="flex items-center gap-2 font-bold"><CheckCircle className="h-5 w-5" /> CLIENT APPROVED</div>
        </div>
      </section>

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

      {/* Call to Action */}
      <section className="rounded-[3rem] bg-primary px-8 py-16 text-primary-foreground text-center overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-8">
          <h2 className="text-4xl font-bold sm:text-5xl">Your reputation is your future. Start building it today.</h2>
          <p className="text-xl opacity-80">Join the elite community of skilled tradespeople who prove their excellence with data, not just words.</p>
          <div className="flex justify-center">
            <Button size="lg" variant="secondary" className="rounded-full px-12 h-14 text-lg font-bold" asChild>
              <Link href="/dashboard">Get Your Trust Score</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
