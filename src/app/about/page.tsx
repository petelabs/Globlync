
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Target, 
  Globe, 
  Users, 
  TrendingUp, 
  Award, 
  ArrowLeft,
  Briefcase,
  Zap,
  CheckCircle2,
  Heart,
  MapPin,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-12 py-10 max-w-5xl mx-auto px-4 overflow-x-hidden">
      <header className="flex flex-col gap-6 text-center md:text-left">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
        <div className="space-y-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-2 font-black uppercase tracking-widest px-4 py-1">
            Global Transparency Mission
          </Badge>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
            Evidence is <span className="text-primary">Everything.</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl font-medium leading-relaxed">
            Born in a small village in Malawi, built to provide the world with a verifiable digital reputation that social media cannot provide.
          </p>
        </div>
      </header>

      <section className="grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest">
            <Heart className="h-3 w-3 fill-current" /> The Founding Story
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Why social media is <span className="text-destructive">not</span> a resume.
          </h2>
          <div className="space-y-4 text-muted-foreground font-medium leading-relaxed">
            <p>
              Globlync was born from a moment of frustration. Our founder, Peter Damiano, watched as a skilled professional lost a massive job opportunity because they only had a Facebook handle to show as their "portfolio."
            </p>
            <p>
              Instead of professional proof, that handle was filled with bullying, teasing, and irrelevant comments. The client denied the application because there was zero evidence of actual skill.
            </p>
            <p className="text-foreground font-bold italic border-l-4 border-primary pl-4">
              "I realized that your reputation shouldn't be defined by social media noise. It should be built on verified work logs and constructive feedback that helps you improve."
            </p>
          </div>
        </div>
        <Card className="border-none bg-muted/30 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <MessageSquare className="h-64 w-64" />
          </div>
          <CardContent className="p-0 space-y-6 relative z-10">
            <div className="bg-white p-4 rounded-2xl shadow-sm w-fit">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-black">Our Solution</h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              We replace bullying with <b>Verified Proof</b>. Every job on Globlync is backed by evidence and constructive feedback. If there's room for improvement, we provide professional insights to help you grow—not to pull you down.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="border-none bg-primary text-primary-foreground p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <MapPin className="h-32 w-32" />
          </div>
          <CardContent className="p-0 space-y-4 relative z-10">
            <h3 className="text-2xl font-black">Our Roots</h3>
            <p className="text-sm opacity-90 leading-relaxed font-medium">
              We aren't built in a glass skyscraper. We are being built from <b>Dzenje Village, Mulanje</b>—starting from my mother's house to serve Lilongwe, Blantyre, and the entire globe.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-muted/30 p-8 rounded-[2.5rem] space-y-4 group hover:bg-primary/5 transition-colors">
          <div className="bg-white p-4 rounded-2xl shadow-sm w-fit group-hover:scale-110 transition-transform">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-black text-xl">The 5-Year Vision</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            In 5 years, we want every Malawian to get jobs easier than ever before. With a verified job history, "Easy Apply" will finally mean something real.
          </p>
        </Card>

        <Card className="border-none bg-muted/30 p-8 rounded-[2.5rem] space-y-4 group hover:bg-primary/5 transition-colors">
          <div className="bg-white p-4 rounded-2xl shadow-sm w-fit group-hover:scale-110 transition-transform">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-black text-xl">Global Reach</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Providing global transparency. We ensure that a worker in Malawi can prove their excellence to a client in London or New York with zero doubt.
          </p>
        </Card>
      </section>

      <section className="py-12 border-y border-dashed border-muted flex flex-col items-center text-center gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Meet the Developer</h2>
          <p className="text-muted-foreground font-medium">The mind behind the reputation engine.</p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <span className="text-3xl font-black text-primary">PD</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-black">Peter Damiano</h4>
            <p className="text-sm font-bold text-primary uppercase tracking-widest">Founder & Lead Engineer</p>
          </div>
          <Button variant="outline" className="rounded-full font-black border-2 h-12 px-8" asChild>
            <a href="https://peterdamiano.vercel.app" target="_blank">
              View My Portfolio <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      <Card className="border-none bg-secondary/10 p-10 md:p-16 rounded-[3rem] text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 p-8 opacity-5">
          <Award className="h-64 w-64" />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Become a Pioneer.</h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            We are rewarding the first 500 professionals who help us build this high-trust community. Join today and secure your professional legacy.
          </p>
          <Button size="lg" className="rounded-full px-12 h-16 text-lg font-black shadow-xl hover:scale-105 transition-transform mt-4" asChild>
            <Link href="/login">Claim My First 500 Badge</Link>
          </Button>
        </div>
      </Card>

      <footer className="text-center py-10 border-t mt-8">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-4">
          Petediano Tech • Built with Integrity in Malawi
        </p>
      </footer>
    </div>
  );
}
