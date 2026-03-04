
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, useCollection } from "@/firebase";
import { doc, collection, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle2, ShieldCheck, Loader2, Award, Sparkles, Clock, Medal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function VerificationPage() {
  const { workerId, jobId } = useParams() as { workerId: string; jobId: string };
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);

  const workerRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return doc(db, "workerProfiles", workerId);
  }, [db, workerId]);

  const jobRef = useMemoFirebase(() => {
    if (!db || !workerId || !jobId) return null;
    return doc(db, "workerProfiles", workerId, "jobs", jobId);
  }, [db, workerId, jobId]);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "jobs");
  }, [db, workerId]);

  const { data: worker } = useDoc(workerRef);
  const { data: job, isLoading: isJobLoading } = useDoc(jobRef);
  const { data: allJobs } = useCollection(jobsRef);

  const handleVerify = async () => {
    if (!jobRef || !workerRef || !workerId || !jobId || !db) return;
    
    setIsSubmitting(true);
    
    // 1. Mark job as verified
    updateDocumentNonBlocking(jobRef, {
      isVerified: true,
      updatedAt: serverTimestamp()
    });

    // 2. Add rating if provided
    if (rating > 0) {
      const ratingsRef = collection(db, "workerProfiles", workerId, "ratings");
      addDocumentNonBlocking(ratingsRef, {
        workerId,
        jobId,
        score: rating,
        comment,
        ratedAt: serverTimestamp()
      });
    }

    // 3. Automated Milestone Checks
    const verifiedJobs = allJobs?.filter(j => j.isVerified) || [];
    const verifiedCount = verifiedJobs.length + 1;
    let earnedBadges = worker?.badgeIds || [];
    let awardedBadgeName = null;

    if (verifiedCount === 1 && !earnedBadges.includes('first-job')) {
      earnedBadges.push('first-job');
      awardedBadgeName = "First Verified Job";
    }

    if (verifiedCount === 5 && !earnedBadges.includes('reliable-worker')) {
      earnedBadges.push('reliable-worker');
      awardedBadgeName = "Reliable Professional";
    }

    if (rating === 5 && verifiedCount >= 3 && !earnedBadges.includes('perfect-streak')) {
      earnedBadges.push('perfect-streak');
      awardedBadgeName = "Customer Favorite";
    }

    // 4. Update worker trust score and badges
    const currentScore = worker?.trustScore || 0;
    const pointsToAdd = 5 + (rating * 2) + (job?.aiVerified ? 2 : 0);
    
    updateDocumentNonBlocking(workerRef, {
      trustScore: currentScore + pointsToAdd,
      badgeIds: earnedBadges,
      updatedAt: serverTimestamp()
    });

    if (awardedBadgeName) {
      setNewBadge(awardedBadgeName);
    }

    setIsSubmitting(false);
    setIsDone(true);
    
    toast({
      title: "Work Verified!",
      description: "You've helped a skilled professional build their reputation.",
    });
  };

  if (isJobLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
        <div className="bg-destructive/10 p-6 rounded-[2.5rem] mb-4">
          <Clock className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">Link Expired or Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">Verification links are unique and temporary for security purposes.</p>
        <Button onClick={() => router.push("/")} className="rounded-full mt-4 bg-primary px-8">Return to Globlync</Button>
      </div>
    );
  }

  if (isDone || job.isVerified) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-[3rem] bg-card animate-in zoom-in-95 duration-500">
          <div className="bg-primary p-12 flex flex-col items-center gap-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <Sparkles className="h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-8">
              {newBadge ? (
                <div className="bg-secondary p-8 rounded-full animate-bounce shadow-2xl">
                  <Medal className="h-20 w-20 text-secondary-foreground" />
                </div>
              ) : (
                <div className="bg-white/20 p-10 rounded-full shadow-2xl backdrop-blur-md">
                  <CheckCircle2 className="h-16 w-16 text-white" />
                </div>
              )}
              <div className="text-center text-primary-foreground space-y-3">
                <h1 className="text-4xl font-black tracking-tighter">{newBadge ? "Milestone Unlocked!" : "Verified!"}</h1>
                <p className="text-primary-foreground/80 font-medium text-lg max-w-[280px] mx-auto leading-tight">
                  {newBadge 
                    ? `You helped ${worker?.name} earn the "${newBadge}" badge!` 
                    : `You've successfully verified the manual work completed by ${worker?.name}.`}
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-10 text-center space-y-8">
            <div className="bg-muted/30 p-6 rounded-3xl space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">Reputation Point Earned</h4>
              <p className="text-2xl font-black">+{5 + (rating * 2)} Points</p>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Every verification helps build a transparent, evidence-based labor market in Malawi. Your contribution is highly valued.
            </p>
            <Button size="lg" className="w-full rounded-full h-16 text-lg font-black shadow-xl" asChild>
              <Link href="/">Finish & Close</Link>
            </Button>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              Verified by Globlync AI • Dzenje Village
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden rounded-[3rem]">
        <CardHeader className="text-center bg-muted/30 p-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-5 rounded-[2.5rem] shadow-inner">
              <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter">Verify Job Log</CardTitle>
          <CardDescription className="text-base font-medium">
            Confirm manual work completion for <br/><span className="text-primary font-black uppercase tracking-tighter">@{worker?.username}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-10">
          <div className="p-8 bg-muted/20 rounded-[2rem] border-2 border-dashed border-muted relative group">
            <h3 className="font-black text-2xl text-primary leading-tight">{job.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{job.description}</p>
            {job.photoUrl && (
              <div className="mt-6 rounded-3xl overflow-hidden border-4 border-white shadow-xl aspect-video relative group">
                <img src={job.photoUrl} alt="Job proof" className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                {job.aiVerified && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="h-3.5 w-3.5" /> AI Analyzed
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-center">Rate the professional quality</Label>
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-all hover:scale-150 hover:-rotate-12 active:scale-95"
                >
                  <Star 
                    className={cn(
                      "h-12 w-12 transition-colors",
                      star <= rating ? "fill-secondary text-secondary" : "text-muted"
                    )} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="comment" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Add Feedback (Optional)</Label>
            <Textarea 
              id="comment" 
              placeholder="e.g. Excellent masonry work on my wall. Very reliable professional in Mulanje." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] rounded-[1.5rem] bg-muted/10 border-2 focus:border-primary transition-colors text-sm"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-6 p-10 pt-0">
          <Button 
            className="w-full h-18 py-8 rounded-full text-xl font-black shadow-[0_20px_40px_-15px_rgba(0,121,107,0.3)] hover:scale-[1.02] transition-transform active:scale-95" 
            onClick={handleVerify}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <CheckCircle2 className="mr-3 h-6 w-6" />}
            Confirm Completion
          </Button>
          <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
             <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Secure Link</div>
             <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
             <div className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> AI Protected</div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
