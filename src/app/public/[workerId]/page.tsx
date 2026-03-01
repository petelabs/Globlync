
"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Briefcase,
  MapPin,
  Clock,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BADGE_CONFIG: Record<string, { name: string; color: string; icon: any }> = {
  'first-job': { name: "Pioneer", color: "bg-blue-100 text-blue-700", icon: Award },
  'reliable-worker': { name: "Reliable Pro", color: "bg-primary/10 text-primary", icon: ShieldCheck },
  'perfect-streak': { name: "5-Star Elite", color: "bg-secondary/20 text-secondary-foreground", icon: Star },
};

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

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("dateCompleted", "desc"));
  }, [jobsRef]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);
  const { data: ratings } = useCollection(ratingsRef);

  const verifiedJobs = jobs?.filter(j => j.isVerified) || [];
  const avgRating = ratings?.length 
    ? (ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length).toFixed(1)
    : "5.0";

  if (isWorkerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Worker Not Found</h1>
        <p className="text-muted-foreground">The profile you are looking for does not exist or has been moved.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl mx-auto px-4">
      {/* Hero Header */}
      <section className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
            <AvatarImage src={worker.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
            <AvatarFallback>{worker.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg border-2 border-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{worker.name}</h1>
            <Badge variant="secondary" className="w-fit mx-auto md:mx-0 bg-primary/10 text-primary font-bold">
              Trust Score: {worker.trustScore || 0}
            </Badge>
          </div>
          <p className="text-xl text-primary font-semibold">{worker.tradeSkill || "Skilled Professional"}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-secondary text-secondary" /> {avgRating} Rating</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> {verifiedJobs.length} Verified Jobs</span>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar: Bio & Badges */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {worker.bio || "This professional hasn't added a bio yet, but their verified work history speaks for itself."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {worker.badgeIds && worker.badgeIds.length > 0 ? (
                worker.badgeIds.map((bid: string) => {
                  const config = BADGE_CONFIG[bid];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <div key={bid} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold", config.color)}>
                      <Icon className="h-3.5 w-3.5" />
                      {config.name}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic">Building reputation...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="work" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="work">Verified Work</TabsTrigger>
              <TabsTrigger value="reviews">Client Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="work" className="space-y-4">
              {isJobsLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>
              ) : verifiedJobs.length > 0 ? (
                verifiedJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative aspect-video w-full sm:w-40 bg-muted shrink-0">
                        <img 
                          src={job.photoUrl || `https://picsum.photos/seed/${job.id}/400/300`} 
                          alt={job.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{job.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                            <Calendar className="h-3 w-3" /> {format(new Date(job.dateCompleted), "MMM d, yyyy")}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                            <CheckCircle2 className="h-3 w-3" /> VERIFIED
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground">No verified work logs yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {ratings && ratings.length > 0 ? (
                ratings.map((rating) => (
                  <Card key={rating.id} className="border-none shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "h-4 w-4",
                                i < rating.score ? "fill-secondary text-secondary" : "text-muted"
                              )} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {rating.ratedAt ? format(new Date(rating.ratedAt.seconds * 1000), "MMM yyyy") : "Recently"}
                        </span>
                      </div>
                      <p className="text-sm italic">"{rating.comment || "Great work, very professional!"}"</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground">No client reviews yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
