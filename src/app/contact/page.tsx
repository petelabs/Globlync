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
  MessageSquare
} from "lucide-react";
import Link from "next/link";

const CONTACT_POINTS = [
  {
    title: "Support & Help",
    description: "Need help with your profile or verification?",
    email: "globlync+support@gmail.com",
    subject: "Globlync Support Request",
    icon: LifeBuoy,
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    title: "Advertising & Partnerships",
    description: "Interested in reaching our verified workers?",
    email: "globlync+ads@gmail.com",
    subject: "Globlync Partnership Inquiry",
    icon: Briefcase,
    color: "bg-primary/10 text-primary"
  },
  {
    title: "Technical & Bug Reports",
    description: "Found a glitch? Let our dev team know.",
    email: "globlync+dev@gmail.com",
    subject: "Globlync Bug Report",
    icon: ShieldAlert,
    color: "bg-destructive/10 text-destructive"
  },
  {
    title: "General Inquiries",
    description: "Anything else on your mind?",
    email: "globlync+info@gmail.com",
    subject: "Globlync General Inquiry",
    icon: Info,
    color: "bg-secondary/10 text-secondary"
  }
];

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-8 py-8 max-w-4xl mx-auto px-4">
      <header className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Contact Globlync</h1>
          <p className="text-muted-foreground text-lg">We're here to help build the future of Malawian labor.</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {CONTACT_POINTS.map((point) => (
          <Card key={point.email} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`p-3 rounded-2xl ${point.color} group-hover:scale-110 transition-transform`}>
                <point.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">{point.title}</CardTitle>
                <CardDescription className="text-xs">{point.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full rounded-full border-2 font-bold justify-start h-12 hover:bg-muted/50" 
                asChild
              >
                <a href={`mailto:${point.email}?subject=${encodeURIComponent(point.subject)}`}>
                  <Mail className="mr-3 h-4 w-4 text-muted-foreground" />
                  {point.email}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-primary text-primary-foreground p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <MessageSquare className="h-48 w-48" />
        </div>
        <div className="relative z-10 text-center space-y-4">
          <h2 className="text-2xl font-bold">Fast Response via WhatsApp</h2>
          <p className="opacity-80 max-w-md mx-auto">For urgent verification issues or payment support, our WhatsApp line is monitored 24/7.</p>
          <Button className="rounded-full bg-secondary text-secondary-foreground font-bold px-10 h-14 text-lg hover:scale-105 transition-transform" asChild>
            <a href="https://wa.me/0987066051" target="_blank">Message Us on WhatsApp</a>
          </Button>
        </div>
      </Card>

      <footer className="text-center py-6 border-t mt-8">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
          Managed by Petediano Tech • Lilongwe, Malawi
        </p>
      </footer>
    </div>
  );
}
