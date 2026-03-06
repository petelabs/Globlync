"use client";

import { useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Award, 
  Clock, 
  MessageSquare, 
  Phone, 
  Mail,
  Loader2,
  Sparkles,
  Medal,
  ThumbsUp,
  Briefcase
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { AdBanner } from "@/components/AdBanner";

const MILESTONE_BADGES: Record<string, { name: string; icon: any; color: string }> = {
  'first-job': { name: "First Verified Job", icon: Medal, color: "text-blue-500 bg-blue-500/10" },
  'reliable-worker': { name: "Reliable Pro", icon: ShieldCheck, color: "text-primary bg-primary/10" },
  'perfect-streak': { name: "Customer Favorite", icon: ThumbsUp, color: "text-secondary bg-secondary/10" },
  'growth-champion': { name: "Growth Leader", icon: Medal, color: "text-pink-500 bg-pink-500/10" },
};

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

  const jobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(10));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  if (isWorkerLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!worker) return <div className="text-center py-20"><h1 className="text-2xl font-bold">Worker Profile Not Found</h1></div>;

  const displayPhoto = worker.profilePictureUrl || `https://picsum.photos/seed/${worker.id}/400/400`;

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left bg-primary/5 p-8 rounded-[3rem] border border-primary/10">
        <div className="relative">
          <Avatar className="h-40 w-40 border-4 border-white shadow-2xl">
            <AvatarImage src={displayPhoto} />
            <AvatarFallback className="text-4xl">{worker.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full shadow-lg border flex items-center gap-1.5 text-xs font-black text-primary animate-bounce">
            <ShieldCheck className="h-4 w-4" /> {worker.trustScore || 0}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl font-black tracking-tight">{worker.name}</h1>
              {worker.isPro && <Badge className="bg-secondary text-secondary-foreground"><Sparkles className="h-3 w-3 mr-1" /> PRO</Badge>}
            </div>
            <p className="text-primary font-black uppercase tracking-widest text-xs">{worker.tradeSkill || "Skilled Manual Professional"}</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto md:mx-0">{worker.bio || "Building a reputation for reliability and quality work in Malawi."}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
             {worker.serviceAreas?.map(area => (
               <Badge key={area} variant="outline" className="text-[10px]"><MapPin className="h-3 w-3 mr-1" /> {area}</Badge>
             ))}
          </div>
        </div>
      </header>

      {/* Ad placement 6: Profile top */}
      <AdBanner id="profile-top-ad" className="w-full" />

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 px-2"><Briefcase className="h-5 w-5 text-primary" /> Verified Job Gallery</h2>
            <div className="grid gap-4">
              {jobs && jobs.length > 0 ? (
                jobs.map(job => (
                  <Card key={job.id} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 aspect-video bg-muted relative">
                        <img src={job.photoUrl || `https://picsum.photos/seed/${job.id}/400/300`} alt={job.title} className="h-full w-full object-cover" />
                        {job.aiVerified && (
                          <div className="absolute top-2 left-2 bg-primary/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="h-2 w-2" /> AI Verified
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold flex items-center gap-2">
                            {job.title}
                            {job.isVerified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{job.description}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(job.dateCompleted).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                  <p className="text-muted-foreground">No job history available yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card className="border-none shadow-lg bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Hire {worker.name?.split(' ')[0]}</CardTitle>
              <CardDescription className="text-primary-foreground/70">Connect instantly via verified links.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {worker.whatsappNumber && (
                <Button className="w-full rounded-full h-14 bg-[#25D366] hover:bg-[#128C7E] font-black text-white shadow-xl" asChild>
                  <a href={`https://wa.me/${worker.whatsappNumber}`} target="_blank">
                    <WhatsAppIcon className="mr-2 h-5 w-5" /> Message on WhatsApp
                  </a>
                </Button>
              )}
              {worker.phoneNumber && (
                <Button variant="secondary" className="w-full rounded-full h-14 font-black shadow-xl" asChild>
                  <a href={`tel:${worker.phoneNumber}`}>
                    <Phone className="mr-2 h-5 w-5" /> Direct Call
                  </a>
                </Button>
              )}
              {worker.contactEmail && (
                <Button variant="ghost" className="w-full rounded-full h-12 font-bold text-white hover:bg-white/10" asChild>
                  <a href={`mailto:${worker.contactEmail}`}>
                    <Mail className="mr-2 h-4 w-4" /> Send Email
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {worker.badgeIds?.length > 0 && (
            <Card className="border-none shadow-sm rounded-[2rem]">
              <CardHeader><CardTitle className="text-sm">Earned Milestones</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {worker.badgeIds.map(id => {
                  const b = MILESTONE_BADGES[id];
                  if (!b) return null;
                  const Icon = b.icon;
                  return (
                    <div key={id} className={cn("p-3 rounded-2xl flex flex-col items-center gap-1.5 text-center", b.color)}>
                      <Icon className="h-6 w-6" />
                      <span className="text-[8px] font-black uppercase leading-tight">{b.name}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Ad placement 7: Profile Footer */}
      <AdBanner id="profile-footer-ad" className="w-full mt-12" />
    </div>
  );
}
