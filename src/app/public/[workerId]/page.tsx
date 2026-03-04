
"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Clock, 
  Award, 
  MessageSquare, 
  Phone, 
  Mail, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const db = useFirestore();

  const workerRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return doc(db, "workerProfiles", workerId);
  }, [db, workerId]);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "jobs");
  }, [db, workerId]);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const recentJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(10));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs } = useCollection(recentJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const stats = useMemo(() => {
    const verifiedJobs = jobs?.filter(j => j.isVerified) || [];
    const avgRating = ratings?.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 5.0;
    
    return {
      totalVerified: verifiedJobs.length,
      averageRating: avgRating.toFixed(1),
      trustScore: profile?.trustScore || 0,
      badges: profile?.badgeIds || []
    };
  }, [jobs, ratings, profile]);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Worker Profile Not Found</h1>
        <p className="text-muted-foreground">The profile you are looking for does not exist or has been removed.</p>
        <Button className="mt-6 rounded-full" asChild><Link href="/search">Find Other Professionals</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto px-4">
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row items-center gap-8 bg-card p-8 rounded-[2.5rem] shadow-xl border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck className="h-48 w-48" />
        </div>
        
        <div className="relative group shrink-0">
          <Avatar className="h-48 w-48 border-4 border-primary shadow-2xl">
            <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${profile.id}/300/300`} />
            <AvatarFallback className="text-4xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-black shadow-xl flex items-center gap-1.5 border-2 border-white">
            <ShieldCheck className="h-4 w-4" /> {stats.trustScore} TRUST
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">{profile.name}</h1>
            <p className="text-primary font-black uppercase tracking-[0.2em] text-sm">{profile.tradeSkill || "Skilled Professional"}</p>
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">{profile.bio || "Building a professional reputation through verified evidence and client satisfaction."}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <Badge variant={profile.isAvailable ? "default" : "secondary"} className="h-8 px-4 rounded-full text-xs font-bold">
              {profile.isAvailable ? "Available Now" : "Currently Busy"}
            </Badge>
            <div className="flex items-center gap-1.5 bg-secondary/10 px-4 py-1.5 rounded-full text-secondary font-black text-xs">
              <Star className="h-4 w-4 fill-secondary" /> {stats.averageRating} Rating
            </div>
            <div className="flex items-center gap-1.5 bg-muted px-4 py-1.5 rounded-full text-muted-foreground font-black text-xs">
              <Award className="h-4 w-4" /> {stats.totalVerified} Jobs Verified
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Left Column: Contact & Badges */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Get in Touch
              </CardTitle>
              <CardDescription className="text-primary-foreground/70">Connect directly with {profile.name.split(' ')[0]}.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-6">
              {profile.whatsappNumber && (
                <Button className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black shadow-lg" asChild>
                  <a href={`https://wa.me/${profile.whatsappNumber}`} target="_blank">
                    <WhatsAppIcon className="mr-3 h-6 w-6" /> WhatsApp
                  </a>
                </Button>
              )}
              {profile.phoneNumber && (
                <Button className="w-full h-14 rounded-2xl bg-white text-primary hover:bg-white/90 font-black shadow-lg" asChild>
                  <a href={`tel:${profile.phoneNumber}`}>
                    <Phone className="mr-3 h-6 w-6" /> Call Directly
                  </a>
                </Button>
              )}
              {profile.contactEmail && (
                <Button variant="ghost" className="w-full h-12 rounded-2xl text-white hover:bg-white/10 font-bold" asChild>
                  <a href={`mailto:${profile.contactEmail}`}>
                    <Mail className="mr-2 h-4 w-4" /> Email Professional
                  </a>
                </Button>
              )}
              {!profile.whatsappNumber && !profile.phoneNumber && !profile.contactEmail && (
                <p className="text-center text-xs opacity-70 italic py-4">This professional hasn't listed direct contact details yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.serviceAreas && profile.serviceAreas.length > 0 ? (
                profile.serviceAreas.map(area => (
                  <Badge key={area} variant="secondary" className="rounded-full text-[10px] font-bold px-3">{area}</Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Covering Lilongwe & Central Region.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Evidence History */}
        <div className="md:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Verified Evidence Log
            </h2>
          </div>

          <div className="grid gap-4">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="overflow-hidden border-none shadow-md group hover:shadow-xl transition-all">
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0 overflow-hidden">
                      <img src={job.photoUrl || `https://picsum.photos/seed/${job.id}/400/300`} alt={job.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      {job.aiVerified && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                          <Sparkles className="h-2 w-2" /> AI Verified
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[8px] font-black text-primary shadow-sm">
                        {job.isVerified ? "CLIENT CONFIRMED" : "PENDING"}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                        {job.isVerified && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{job.description}</p>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 
                          {job.dateCompleted ? formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true }) : "recently"}
                        </span>
                        <span className="text-primary/70">Evidence Ref: {job.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground font-medium">No verified jobs logged in this portfolio yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <section className="py-12 border-t mt-8 text-center space-y-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Verified Reputation Provided by Globlync</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="outline" className="rounded-full h-12 px-8" asChild>
            <Link href="/search">Find Other Pros</Link>
          </Button>
          <Button className="rounded-full h-12 px-8 shadow-lg" asChild>
            <Link href="/login">Create Your Own Profile</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
