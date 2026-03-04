
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  LifeBuoy, 
  ShieldAlert, 
  Briefcase, 
  Info, 
  ArrowLeft,
  MessageSquare,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const CONTACT_POINTS = [
  {
    title: "Support & Help",
    description: "Need help with your profile, trust score, or manual job verification?",
    email: "globlync+support@gmail.com",
    subject: "Globlync Support Request",
    icon: LifeBuoy,
    color: "bg-blue-500/10 text-blue-500",
    priority: "High"
  },
  {
    title: "Advertising",
    description: "Connect with our network of thousands of verified manual workers.",
    email: "globlync+ads@gmail.com",
    subject: "Globlync Partnership Inquiry",
    icon: Briefcase,
    color: "bg-primary/10 text-primary",
    priority: "Normal"
  },
  {
    title: "Technical Issues",
    description: "Spotted a glitch in the verification flow? Report it to our dev team.",
    email: "globlync+dev@gmail.com",
    subject: "Globlync Bug Report",
    icon: ShieldAlert,
    color: "bg-destructive/10 text-destructive",
    priority: "Urgent"
  },
  {
    title: "General Inquiries",
    description: "Feedback, suggestions, or just want to say hi? We're listening.",
    email: "globlync+info@gmail.com",
    subject: "Globlync General Inquiry",
    icon: Info,
    color: "bg-secondary/10 text-secondary",
    priority: "Normal"
  }
];

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-12 py-10 max-w-5xl mx-auto px-4">
      <header className="flex flex-col gap-6 text-center md:text-left">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
        <div className="space-y-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-2">
            Professional Support
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
            Get in <span className="text-primary italic">Touch.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Headquartered in Mulanje, building the future of manual labor in Malawi. We support every verified professional on our platform.
          </p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {CONTACT_POINTS.map((point) => (
          <Card key={point.email} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`p-4 rounded-2xl ${point.color} group-hover:scale-110 transition-transform shadow-inner`}>
                <point.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">{point.title}</CardTitle>
                  <Badge variant="outline" className="text-[8px] font-black uppercase">{point.priority}</Badge>
                </div>
                <CardDescription className="text-xs font-medium">{point.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Button 
                variant="outline" 
                className="w-full rounded-2xl border-2 font-black justify-between h-14 hover:bg-muted/50 transition-colors text-sm" 
                asChild
              >
                <a href={`mailto:${point.email}?subject=${encodeURIComponent(point.subject)}`}>
                  <div className="flex items-center">
                    <Mail className="mr-3 h-4 w-4 text-muted-foreground" />
                    {point.email}
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none bg-muted/30 p-8 flex flex-col items-center text-center gap-3">
          <div className="bg-primary/10 p-4 rounded-full mb-2">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h4 className="font-bold uppercase tracking-widest text-[10px]">Headquarters</h4>
          <p className="text-sm font-medium">Dzenje Village, Mulanje, Malawi<br/><span className="text-[10px] opacity-70">Near Dzenje Secondary School</span></p>
        </Card>
        <Card className="border-none bg-muted/30 p-8 flex flex-col items-center text-center gap-3">
          <div className="bg-primary/10 p-4 rounded-full mb-2">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h4 className="font-bold uppercase tracking-widest text-[10px]">Office Hours</h4>
          <p className="text-sm font-medium">Mon - Sat: 8:00 AM - 5:00 PM</p>
        </Card>
        <Card className="border-none bg-muted/30 p-8 flex flex-col items-center text-center gap-3">
          <div className="bg-primary/10 p-4 rounded-full mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h4 className="font-bold uppercase tracking-widest text-[10px]">Response Time</h4>
          <p className="text-sm font-medium">Within 24 Hours</p>
        </Card>
      </div>

      <Card className="border-none bg-primary text-primary-foreground p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <MessageSquare className="h-64 w-64" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="bg-white/20 p-4 rounded-3xl animate-pulse">
            <MessageSquare className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Fast WhatsApp Support</h2>
            <p className="opacity-80 max-w-md mx-auto text-lg leading-relaxed">
              For urgent verification issues or payment support, our WhatsApp line is monitored by human experts in Mulanje.
            </p>
          </div>
          <Button className="rounded-full bg-secondary text-secondary-foreground font-black px-12 h-16 text-xl hover:scale-105 transition-transform shadow-xl" asChild>
            <a href="https://wa.me/0987066051" target="_blank">Message Us Now</a>
          </Button>
        </div>
      </Card>

      <footer className="text-center py-10 border-t mt-8">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-4">
          Managed by Petediano Tech • Mulanje, Malawi
        </p>
        <div className="flex justify-center gap-8 text-[10px] font-bold text-primary/50 uppercase tracking-widest">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
        </div>
      </footer>
    </div>
  );
}
