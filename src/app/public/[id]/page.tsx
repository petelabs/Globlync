
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, QrCode, Share2, MapPin, Award, Phone } from "lucide-react";
import Link from "next/link";

export default function PublicReputationPage() {
  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="relative mb-20">
        {/* Banner */}
        <div className="h-48 w-full rounded-3xl bg-primary/10 overflow-hidden relative">
           <img 
            src="https://picsum.photos/seed/banner/1200/400" 
            alt="Profile Banner" 
            className="w-full h-full object-cover opacity-50"
            data-ai-hint="blue patterns"
          />
        </div>
        
        {/* Profile Card Overlay */}
        <div className="absolute -bottom-16 left-8 flex flex-col sm:flex-row items-end gap-4">
          <div className="h-32 w-32 rounded-3xl border-4 border-background bg-muted overflow-hidden shadow-xl">
            <img src="https://picsum.photos/seed/worker-1/400/400" alt="John Doe" className="h-full w-full object-cover" />
          </div>
          <div className="mb-2">
            <h1 className="text-3xl font-black text-foreground">John Doe</h1>
            <p className="flex items-center gap-2 text-lg font-medium text-primary">
              Professional Plumber <CheckCircle2 className="h-5 w-5 fill-primary text-white" />
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <section className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="px-4 py-1 rounded-full text-sm">Residential</Badge>
          <Badge variant="secondary" className="px-4 py-1 rounded-full text-sm">Industrial</Badge>
          <Badge variant="secondary" className="px-4 py-1 rounded-full text-sm">Emergency Repair</Badge>
          <Badge variant="secondary" className="px-4 py-1 rounded-full text-sm">24/7 Available</Badge>
        </section>

        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-none shadow-sm bg-accent/50 text-center p-4 flex flex-col items-center">
            <span className="text-sm font-bold text-primary uppercase">Trust Score</span>
            <span className="text-4xl font-black text-primary">82</span>
            <span className="text-xs text-muted-foreground mt-1">Gold Tier</span>
          </Card>
          <Card className="border-none shadow-sm bg-accent/50 text-center p-4 flex flex-col items-center">
            <span className="text-sm font-bold text-primary uppercase">Verified Jobs</span>
            <span className="text-4xl font-black text-primary">24</span>
            <span className="text-xs text-muted-foreground mt-1">Total History</span>
          </Card>
          <Card className="border-none shadow-sm bg-accent/50 text-center p-4 flex flex-col items-center">
            <span className="text-sm font-bold text-primary uppercase">Avg. Rating</span>
            <span className="text-4xl font-black text-primary">4.9</span>
            <div className="flex items-center gap-0.5 mt-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />)}
            </div>
          </Card>
        </div>

        <section className="grid gap-4">
          <h2 className="text-2xl font-bold mt-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" /> Verified Portfolio
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Sink Replacement", date: "2 days ago", desc: "Full fixture replacement with copper piping." },
              { title: "Boiler Maintenance", date: "1 week ago", desc: "Annual service and component check." },
              { title: "Leaky Pipe Fix", date: "3 weeks ago", desc: "Emergency repair of main supply line." },
              { title: "New Bathroom Plumb", date: "1 month ago", desc: "Complete rough-in and finish plumbing." },
            ].map((work, i) => (
              <Card key={i} className="overflow-hidden border-none shadow-sm">
                <CardContent className="p-0">
                  <div className="aspect-video w-full bg-muted">
                    <img 
                      src={`https://picsum.photos/seed/work-${i}/500/300`} 
                      alt={work.title} 
                      className="h-full w-full object-cover"
                      data-ai-hint="plumbing interior"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold">{work.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{work.date}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{work.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="fixed bottom-20 left-4 right-4 sm:relative sm:bottom-0 sm:left-0 sm:right-0 flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="flex-1 rounded-full shadow-lg text-lg">
            <Phone className="mr-2 h-5 w-5" /> Hire This Worker
          </Button>
          <Button size="lg" variant="outline" className="flex-1 rounded-full shadow-lg text-lg">
            <Share2 className="mr-2 h-5 w-5" /> Share Reputation
          </Button>
        </section>
      </div>
    </div>
  );
}
