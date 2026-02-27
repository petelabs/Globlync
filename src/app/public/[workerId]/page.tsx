"use client";

import { useDoc, useCollection } from "@/firebase";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, ShieldCheck, MapPin, Briefcase, Calendar, Award } from "lucide-react";
import { useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";

export default function PublicProfilePage() {
  const { workerId } = useParams();
  
  const workerRef = useMemoFirebase(() => 
    workerId ? doc(collection(doc(collection(doc(doc().firestore, 'databases'), '(default)'), 'documents'), 'workerProfiles'), workerId as string) : null
  , [workerId]);
  
  // Note: Simplified path for prototype
  const { data: profile, isLoading: profileLoading } = useDoc(workerRef as any);
  
  // Mock data for profiles that don't exist yet in DB
  const mockProfile = {
    name: "John Doe",
    tradeSkill: "Plumbing Specialist",
    trustScore: 82,
    location: "New York, NY",
    bio: "Over 10 years of experience in residential and commercial plumbing. Specialized in emergency leak repairs and full bathroom installations."
  };

  const displayProfile = profile || mockProfile;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Card className="border-none shadow-xl overflow-hidden">
        <div className="h-32 bg-primary relative">
          <div className="absolute -bottom-12 left-8">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={`https://picsum.photos/seed/${workerId}/200/200`} />
              <AvatarFallback>{displayProfile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardContent className="pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {displayProfile.name}
                <ShieldCheck className="h-6 w-6 text-primary" />
              </h1>
              <div className="flex flex-wrap gap-3 mt-2 text-muted-foreground">
                <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {displayProfile.tradeSkill}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {displayProfile.location || "Brooklyn, NY"}</span>
              </div>
            </div>
            <div className="bg-accent p-4 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-bold uppercase text-primary/70">Trust Score</span>
              <span className="text-3xl font-black text-primary">{displayProfile.trustScore}</span>
              <Badge variant="secondary" className="mt-1">Gold Tier</Badge>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">Professional Bio</h3>
            <p className="text-muted-foreground leading-relaxed">
              {displayProfile.bio}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Verified Work History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "Kitchen Sink Repair", date: "Oct 2023", client: "Alice S.", status: "Verified" },
              { title: "Full Bathroom Install", date: "Sep 2023", client: "Grand Hotel", status: "Verified" },
              { title: "Pipe Maintenance", date: "Aug 2023", client: "Robert W.", status: "Verified" }
            ].map((job, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <h4 className="font-bold">{job.title}</h4>
                  <p className="text-xs text-muted-foreground">Completed {job.date} • For {job.client}</p>
                </div>
                <Badge className="bg-primary">{job.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-secondary" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {[
              { name: "Top Rated", icon: Star },
              { name: "Fast Reply", icon: Calendar },
              { name: "Reliable", icon: Award }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-3 bg-accent/50 rounded-xl">
                <badge.icon className="h-6 w-6 text-primary" />
                <span className="text-[10px] font-bold text-center">{badge.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
