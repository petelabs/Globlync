
"use client";

import { useParams } from "next/navigation";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Calendar, 
  Briefcase, 
  Award, 
  Loader2, 
  MapPin,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

  const verifiedJobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: jobs, isLoading: isJobsLoading } = useCollection(verifiedJobsQuery);

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">This worker profile may have been removed or is private.</p>
      </div>
    );
  }

  const verifiedJobs = jobs?.filter(j => j.isVerified) || [];

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-primary px-6 py-12 text-primary-foreground overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <ShieldCheck className="h-64 w-64 -mr-20 -mt-20" />
        </div>
        <div className="relative flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl">
            <AvatarImage src={profile.profilePictureUrl || `https://picsum.photos/seed/${workerId}/200/200`} />
            <AvatarFallback className="text-primary text-4xl font-bold">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-4xl font-black">{profile.name}</h1>
              <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" /> Score {profile.trustScore || 0}
              </div>
            </div>
            <p className="text-xl font-medium text-primary-foreground/90 flex items-center justify-center md:justify-start gap-2">
              <Briefcase className="h-5 w-5" /> {profile.tradeSkill}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <MapPin className="h-4 w-4" /> Location Verified
              </span>
              <span className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <CheckCircle2 className="h-4 w-4" /> {verifiedJobs.length} Verified Jobs
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Bio and Badges */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Professional Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                "{profile.bio || "No professional bio provided yet."}"
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.badgeIds && profile.badgeIds.length > 0 ? (
                profile.badgeIds.map((badgeId: string) => (
                  <Badge key={badgeId} variant="secondary" className="px-3 py-1 capitalize">
                    <Award className="mr-1 h-3 w-3" /> {badgeId.replace('-', ' ')}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">Working towards first milestone...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Work History */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Verified Work History</h2>
            <Badge variant="outline" className="font-bold">{verifiedJobs.length} Jobs Found</Badge>
          </div>

          <div className="grid gap-4">
            {isJobsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-muted" /></div>
            ) : verifiedJobs.length > 0 ? (
              verifiedJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative aspect-video w-full sm:w-40 bg-muted shrink-0">
                      <img 
                        src={job.photoUrl || `https://picsum.photos/seed/${job.id}/400/300`} 
                        alt={job.title} 
                        className="h-full w-full object-cover"
                      />
                      {job.aiVerified && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Sparkles className="h-2 w-2" /> AI Proof
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{job.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      </div>
                      <div className="mt-auto flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1 uppercase tracking-wider font-bold">
                          <Calendar className="h-3 w-3" /> {format(new Date(job.dateCompleted), "MMM d, yyyy")}
                        </span>
                        <div className="flex items-center gap-1 text-secondary font-black">
                          <Star className="h-3 w-3 fill-secondary" /> 5.0 RATING
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                <p className="text-muted-foreground">No verified jobs yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
