"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  Briefcase, 
  CheckCircle2, 
  Award, 
  Calendar,
  Sparkles,
  Loader2,
  MapPin,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BADGE_CONFIG: Record<string, { name: string; color: string; icon: any }> = {
  'first-job': { name: "Rising Star", color: "bg-blue-100 text-blue-700", icon: Sparkles },
  'reliable-worker': { name: "Certified Pro", color: "bg-green-100 text-green-700", icon: ShieldCheck },
  'perfect-streak': { name: "Top Rated", color: "bg-amber-100 text-amber-700", icon: Award },
};

export default function PublicReputationPage() {
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

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("dateCompleted", "desc"), limit(10));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">The worker profile you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const verifiedJobs = jobs?.filter(j => j.isVerified) || [];

  return (
    <div className="flex flex-col gap-8 py-6 max-w-3xl mx-auto px-4">
      {/* JSON-LD for AI Search & Agents */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": worker.name,
            "jobTitle": worker.tradeSkill,
            "description": worker.bio,
            "image": worker.profilePictureUrl,
            "interactionStatistic": {
              "@type": "InteractionCounter",
              "interactionType": "https://schema.org/CheckAction",
              "userInteractionCount": verifiedJobs.length
            }
          })
        }}
      />

      {/* Profile Header */}
      <section className="flex flex-col items-center text-center gap-4">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl ring-4 ring-primary/10">
            <AvatarImage src={worker.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
            <AvatarFallback>{worker.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
        
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">{worker.name}</h1>
          <div className="flex items-center justify-center gap-2 text-primary font-bold">
            <Briefcase className="h-4 w-4" />
            <span>{worker.tradeSkill}</span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1 bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold">
              <Star className="h-4 w-4 fill-secondary" /> 5.0
            </div>
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
              <ShieldCheck className="h-4 w-4" /> {worker.trustScore} Score
            </div>
          </div>
        </div>

        {worker.bio && (
          <p className="text-muted-foreground leading-relaxed max-w-md italic mt-2">
            "{worker.bio}"
          </p>
        )}
      </section>

      {/* Badges */}
      {worker.badgeIds && worker.badgeIds.length > 0 && (
        <section className="flex flex-wrap justify-center gap-2">
          {worker.badgeIds.map((bid: string) => {
            const cfg = BADGE_CONFIG[bid];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <Badge key={bid} className={cn("px-4 py-1.5 rounded-full flex gap-2 border-none shadow-sm", cfg.color)}>
                <Icon className="h-4 w-4" />
                {cfg.name}
              </Badge>
            );
          })}
        </section>
      )}

      {/* Ads Paused - Slot remains for design parity
      <div className="w-full h-24 bg-muted/20 border-2 border-dashed rounded-2xl flex items-center justify-center text-[10px] text-muted-foreground/50">
        AD SLOT (PAUSED)
      </div>
      */}

      {/* Verified Work History */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Verified Portfolio
          </h2>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {verifiedJobs.length} Verified Jobs
          </span>
        </div>

        <div className="grid gap-6">
          {verifiedJobs.length > 0 ? (
            verifiedJobs.map((job) => (
              <Card key={job.id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {job.photoUrl && (
                    <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0">
                      <img src={job.photoUrl} alt={job.title} className="h-full w-full object-cover" />
                      {job.aiVerified && (
                        <div className="absolute top-2 left-2 bg-primary/90 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                          <Sparkles className="h-2 w-2" /> AI Verified
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold leading-tight">{job.title}</h3>
                      <div className="flex items-center gap-0.5 text-secondary">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{job.description}</p>
                    <div className="mt-auto flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {format(new Date(job.dateCompleted), "MMM yyyy")}
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircle2 className="h-3 w-3" /> Client Verified
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-muted/10 rounded-3xl border-2 border-dashed">
              <p className="text-muted-foreground">No verified jobs displayed yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center py-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-full border">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-muted-foreground">Evidence-Based Reputation by Globlync</span>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Portable. Verifiable. Trustworthy.
        </p>
      </footer>
    </div>
  );
}
