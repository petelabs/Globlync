"use client";

import { useParams } from "next/navigation";
import { useDoc, useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, ShieldCheck, MapPin, Briefcase, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function PublicProfilePage() {
  const params = useParams();
  const workerId = params.workerId as string;
  const db = useFirestore();

  const workerRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return doc(db, "workerProfiles", workerId);
  }, [db, workerId]);

  const { data: worker, isLoading: isWorkerLoading } = useDoc(workerRef);

  const jobsQuery = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return query(
      collection(db, "workerProfiles", workerId, "jobs"), 
      where("isVerified", "==", true)
    );
  }, [db, workerId]);

  const { data: verifiedJobs, isLoading: isJobsLoading } = useCollection(jobsQuery);

  if (isWorkerLoading) return <div className="flex justify-center py-20 text-primary">Loading profile...</div>;
  if (!worker) return <div className="text-center py-20 text-muted-foreground">Worker profile not found.</div>;

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-8 bg-card p-8 rounded-3xl shadow-sm border border-border/50">
        <Avatar className="h-40 w-40 border-4 border-primary shadow-xl">
          <AvatarImage src={worker.profilePictureUrl || `https://picsum.photos/seed/${worker.id}/400/400`} />
          <AvatarFallback className="text-4xl">{worker.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-4xl font-bold">{worker.name}</h1>
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xl text-primary font-semibold flex items-center justify-center md:justify-start gap-2">
              <Briefcase className="h-5 w-5" /> {worker.tradeSkill}
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Based in New York</span>
            <span className="flex items-center gap-1 font-bold text-foreground">
              <Star className="h-4 w-4 fill-secondary text-secondary" /> {worker.trustScore || 0} Trust Score
            </span>
          </div>
          <p className="text-lg leading-relaxed max-w-2xl text-muted-foreground">
            {worker.bio || "This worker is building their reputation on Globlync."}
          </p>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Verification Stats */}
        <Card className="md:col-span-4 border-none shadow-sm bg-accent/30">
          <CardHeader>
            <CardTitle>Verified Credibility</CardTitle>
            <CardDescription>Evidence-based reputation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-primary">{verifiedJobs?.length || 0}</span>
                <span className="text-xs font-bold uppercase text-muted-foreground">Verified Jobs</span>
              </div>
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Earned Badges</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-3 py-1">Verified Identity</Badge>
                {worker.trustScore > 80 && <Badge variant="secondary" className="px-3 py-1">Top Rated</Badge>}
                {verifiedJobs && verifiedJobs.length > 5 && <Badge variant="secondary" className="px-3 py-1">Reliable Professional</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Evidence */}
        <Card className="md:col-span-8 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Work History</CardTitle>
            <CardDescription>Verified evidence of completed projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isJobsLoading ? (
              <p>Loading jobs...</p>
            ) : verifiedJobs && verifiedJobs.length > 0 ? (
              verifiedJobs.map((job) => (
                <div key={job.id} className="flex gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden shrink-0">
                    <img 
                      src={job.photoUrl || `https://picsum.photos/seed/${job.id}/200/200`} 
                      alt={job.description} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold leading-tight">{job.description}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {job.dateCompleted && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {format(new Date(job.dateCompleted), "PPP")}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-primary font-bold"><CheckCircle2 className="h-3 w-3" /> Verified by Client</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground italic">No verified jobs logged yet. This worker is just getting started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
