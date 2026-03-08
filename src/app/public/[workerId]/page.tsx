
"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, query, orderBy, limit, increment, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Phone, 
  Mail,
  Loader2,
  Crown,
  Share2,
  Clock,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
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

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs } = useCollection(useMemoFirebase(() => query(jobsRef!, orderBy("createdAt", "desc"), limit(10)), [jobsRef]));
  const { data: ratings } = useCollection(useMemoFirebase(() => query(ratingsRef!, orderBy("ratedAt", "desc"), limit(5)), [ratingsRef]));

  // Increment profile views on mount
  useEffect(() => {
    if (db && workerId) {
      const ref = doc(db, "workerProfiles", workerId);
      updateDocumentNonBlocking(ref, {
        profileViews: increment(1),
        updatedAt: serverTimestamp()
      });
    }
  }, [db, workerId]);

  const isPro = profile?.activeBenefits?.some((b: any) => new Date(b.expiresAt) > new Date()) || (profile?.referralCount || 0) >= 10;

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Reputation...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
        <div className="bg-muted p-6 rounded-[2.5rem] mb-4">
          <Briefcase className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-black">Profile Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">This professional profile may have been moved or removed.</p>
        <Button variant="outline" className="rounded-full mt-4" asChild><Link href="/search">Back to Discovery</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4 overflow-x-hidden">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="rounded-full">
          <Link href="/search"><ArrowLeft className="mr-2 h-4 w-4" /> Discover Others</Link>
        </Button>
        <Button variant="outline" size="sm" className="rounded-full font-bold h-9">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </header>

      <section className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="relative shrink-0">
          <Avatar className={cn("h-40 w-40 border-4 shadow-2xl", isPro ? "border-secondary" : "border-primary")}>
            <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
            <AvatarFallback className="text-4xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {isPro && (
            <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground p-2 rounded-full shadow-xl animate-pulse">
              <Crown className="h-6 w-6 fill-secondary-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter flex items-center justify-center md:justify-start gap-3">
              {profile.name}
              {isPro && <ShieldCheck className="h-6 w-6 text-primary fill-primary/10" />}
            </h1>
            <p className="text-primary font-black uppercase tracking-widest text-xs">{profile.tradeSkill || "General Professional"}</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <Badge variant="secondary" className="rounded-full bg-primary/5 text-primary border-primary/10 font-bold px-4 py-1">
              <Star className="h-3 w-3 mr-1.5 fill-primary" /> {profile.trustScore} Trust Score
            </Badge>
            <Badge variant="outline" className="rounded-full font-bold px-4 py-1">
              <MapPin className="h-3 w-3 mr-1.5" /> {profile.serviceAreas?.[0] || "Global"}
            </Badge>
            {profile.isAvailable && (
              <Badge className="rounded-full bg-green-500 text-white font-bold px-4 py-1 animate-pulse">
                Available Now
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-base max-w-xl font-medium leading-relaxed">
            {profile.bio || "Building a professional reputation through verified evidence and client satisfaction."}
          </p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-12 mt-4">
        <div className="md:col-span-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Verified Work Logs
            </h2>
            <div className="grid gap-4">
              {jobs && jobs.filter(j => j.isVerified).length > 0 ? (
                jobs.filter(j => j.isVerified).map((job) => (
                  <Card key={job.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] group">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      {job.photoUrl && (
                        <div className="relative aspect-video w-full sm:w-48 shrink-0 overflow-hidden">
                          <img src={job.photoUrl} alt={job.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          {job.aiVerified && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1">
                              <Sparkles className="h-2.5 w-2.5" /> AI
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-lg leading-tight">{job.title}</h3>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{job.description}</p>
                        <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/60">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(job.dateCompleted), "MMMM yyyy")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                  <p className="text-xs font-bold text-muted-foreground">No verified work logs public yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
              <Star className="h-5 w-5 text-primary fill-primary" /> Recent Ratings
            </h2>
            <div className="grid gap-4">
              {ratings && ratings.length > 0 ? (
                ratings.map((r) => (
                  <div key={r.id} className="p-6 bg-accent/30 rounded-[2rem] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("h-3.5 w-3.5", i < r.score ? "fill-secondary text-secondary" : "text-muted-foreground/20")} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(r.ratedAt?.toDate() || new Date(), "MMM d, yyyy")}</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic">"{r.comment || "Excellent professional work."}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                  <p className="text-xs font-bold text-muted-foreground">No client ratings yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card className="border-none bg-primary text-primary-foreground rounded-[2.5rem] p-8 shadow-2xl space-y-6 sticky top-24">
            <div className="space-y-2">
              <h3 className="font-black text-xl tracking-tight">Hire this Professional</h3>
              <p className="text-xs opacity-80 leading-relaxed font-medium">Verified by Globlync Evidence-Based Reputation system.</p>
            </div>
            
            <div className="space-y-3 pt-2">
              {profile.whatsappNumber && (
                <Button className="w-full h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black" asChild>
                  <a href={`https://wa.me/${profile.whatsappNumber}`} target="_blank">
                    <WhatsAppIcon className="mr-2 h-5 w-5" /> WhatsApp
                  </a>
                </Button>
              )}
              {profile.phoneNumber && (
                <Button className="w-full h-14 rounded-full bg-white text-primary hover:bg-white/90 font-black shadow-lg" asChild>
                  <a href={`tel:${profile.phoneNumber}`}>
                    <Phone className="mr-2 h-5 w-5" /> Direct Call
                  </a>
                </Button>
              )}
              {profile.contactEmail && (
                <Button variant="ghost" className="w-full text-white/80 hover:text-white hover:bg-white/10 font-bold" asChild>
                  <a href={`mailto:${profile.contactEmail}`}>
                    <Mail className="mr-2 h-4 w-4" /> Email Me
                  </a>
                </Button>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                <span>Member Since</span>
                <span>{profile.createdAt?.toDate() ? format(profile.createdAt.toDate(), "MMM yyyy") : "2026"}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                <span>Last Updated</span>
                <span>{profile.updatedAt?.toDate() ? format(profile.updatedAt.toDate(), "MMM d") : "Today"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
