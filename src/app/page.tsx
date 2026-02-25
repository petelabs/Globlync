
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, QrCode, TrendingUp, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 py-6">
      <section className="flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-primary">
          <Award className="h-4 w-4" />
          <span>Portable Reputation for Skilled Workers</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Build Trust, <span className="text-primary">Verified.</span>
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground">
          TrustLink helps informal workers build a digital, evidence-based reputation that travels with them. Get verified, earn badges, and grow your business.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link href="/profile">Create Worker Profile</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
            <Link href="/search">Find Verified Workers</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Digital Proof",
            desc: "Every job you complete is logged and verified by the client.",
            icon: ShieldCheck,
            color: "text-primary",
          },
          {
            title: "Easy Verification",
            desc: "Clients verify jobs instantly with a simple QR code scan.",
            icon: QrCode,
            color: "text-secondary",
          },
          {
            title: "Dynamic Scoring",
            desc: "Your Trust Score grows with every verified job and positive rating.",
            icon: TrendingUp,
            color: "text-primary",
          },
          {
            title: "Public Profile",
            desc: "Share your professional reputation link with potential clients.",
            icon: Award,
            color: "text-secondary",
          },
        ].map((feature, i) => (
          <Card key={i} className="border-none shadow-sm transition-transform hover:scale-[1.02]">
            <CardContent className="p-6">
              <feature.icon className={`mb-4 h-10 w-10 ${feature.color}`} />
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-3xl bg-primary px-8 py-12 text-primary-foreground sm:px-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to turn your hard work into a professional reputation?</h2>
            <p className="text-primary-foreground/80">
              Join thousands of skilled workers—plumbers, electricians, cleaners, and more—who are using TrustLink to prove their skills and win more clients.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="rounded-full px-8" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-square max-w-[400px] overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl">
            <img 
              src="https://picsum.photos/seed/worker-happy/800/800" 
              alt="Happy worker using TrustLink" 
              className="h-full w-full object-cover"
              data-ai-hint="worker happy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
