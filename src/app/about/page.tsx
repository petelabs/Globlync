
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
  CheckCircle2
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
            The Globlync Mission
          </Badge>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
            Trust is the New <span className="text-primary">Currency.</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl font-medium leading-relaxed">
            We are building the world's first evidence-based reputation network for skilled professionals. Born in Malawi, serving the global economy.
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="border-none bg-primary text-primary-foreground p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Target className="h-32 w-32" />
          </div>
          <CardContent className="p-0 space-y-4 relative z-10">
            <h3 className="text-2xl font-black">Our Goal</h3>
            <p className="text-sm opacity-90 leading-relaxed font-medium">
              To empower 1 Million professionals across Africa and the globe with a verifiable digital ID that proves their skill through real evidence, not just words.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-muted/30 p-8 rounded-[2.5rem] space-y-4 group hover:bg-primary/5 transition-colors">
          <div className="bg-white p-4 rounded-2xl shadow-sm w-fit group-hover:scale-110 transition-transform">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-black text-xl">Global Access</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Breaking geographic barriers by allowing local manual workers to connect with international high-trust opportunities.
          </p>
        </Card>

        <Card className="border-none bg-muted/30 p-8 rounded-[2.5rem] space-y-4 group hover:bg-primary/5 transition-colors">
          <div className="bg-white p-4 rounded-2xl shadow-sm w-fit group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-black text-xl">Evidence First</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            Eliminating resume fraud by using AI-verified job logs and verified client feedback as the core of every profile.
          </p>
        </Card>
      </section>

      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight">The Globlync Way</h2>
          <p className="text-muted-foreground font-medium">Four pillars that define our professional ecosystem.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: "Transparency", desc: "Every job log is backed by photo evidence and client verification.", icon: CheckCircle2 },
            { title: "Opportunity", desc: "Priority access to global remote roles for our top-ranked experts.", icon: Zap },
            { title: "Reputation", desc: "A dynamic Trust Score that grows with your work ethic.", icon: TrendingUp },
            { title: "Community", desc: "A supportive network of peers sharing daily professional insights.", icon: Users },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-6 bg-white border-2 rounded-3xl hover:border-primary/20 transition-all">
              <div className="bg-primary/10 p-3 rounded-2xl h-fit">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-black text-lg">{item.title}</h4>
                <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Card className="border-none bg-secondary/10 p-10 md:p-16 rounded-[3rem] text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 p-8 opacity-5">
          <Award className="h-64 w-64" />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Join the First 500.</h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            We are currently rewarding our early pioneers. The first 500 users to complete their profile receive 30 days of Pro VIP status automatically.
          </p>
          <Button size="lg" className="rounded-full px-12 h-16 text-lg font-black shadow-xl hover:scale-105 transition-transform mt-4" asChild>
            <Link href="/login">Secure My Legacy Handle</Link>
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
