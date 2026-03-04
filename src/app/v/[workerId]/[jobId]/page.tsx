
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, useCollection } from "@/firebase";
import { doc, collection, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle2, ShieldCheck, Loader2, Award, Sparkles, ChevronRight } from "lucide-react";
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
    const verifiedCount = (allJobs?.filter(j => j.isVerified).length || 0) + 1;
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Verification link not found.</h1>
        <p className="text-muted-foreground text-sm">It may have expired or been deleted.</p>
        <Button onClick={() => router.push("/")} className="rounded-full">Go to Home</Button>
      </div>
    );
  }

  if (isDone || job.isVerified) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-card">
          <div className="bg-primary p-12 flex flex-col items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <Sparkles className="h-64 w-64 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-6">
              {newBadge ? (
                <div className="bg-white/20 p-8 rounded-full animate-bounce shadow-2xl backdrop-blur-md">
                  <Award className="h-20 w-20 text-secondary" />
                </div>
              ) : (
                <div className="bg-white/20 p-8 rounded-full shadow-2xl backdrop-blur-md">
                  <CheckCircle2 className="h-16 w-16 text-white" />
                </div>
              )}
              <div className="text-center text-primary-foreground space-y-2">
                <h1 className="text-4xl font-black tracking-tighter">{newBadge ? "Milestone Unlocked!" : "Thank You!"}</h1>
                <p className="text-primary-foreground/80 font-medium text-lg">
                  {newBadge 
                    ? `You helped ${worker?.name} earn the "${newBadge}" badge!` 
                    : `You've successfully verified the work by ${worker?.name}.`}
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-10 text-center space-y-6">
            <p className="text-muted-foreground leading-relaxed text-sm">
              Your feedback helps build a safer, more transparent manual labor market in Malawi. Your contribution matters.
            </p>
            <Button size="lg" className="w-full rounded-full h-14 text-lg font-bold shadow-xl" asChild>
              <Link href="/">Back to Globlync</Link>
            </Button>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
              Evidence-Based Reputation • Malawi
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden rounded-[2.5rem]">
        <CardHeader className="text-center bg-muted/30 p-10">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-[2rem] shadow-inner">
              <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter">Verify Job</CardTitle>
          <CardDescription className="text-base">
            Confirm completion for <strong>{worker?.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="p-6 bg-muted/20 rounded-2xl border-2 border-dashed border-muted relative group">
            <h3 className="font-bold text-xl text-primary">{job.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
            {job.photoUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border-2 shadow-sm aspect-video">
                <img src={job.photoUrl} alt="Job proof" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center">How was the work?</Label>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-all hover:scale-125 hover:-rotate-6 active:scale-95"
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

          <div className="grid gap-2">
            <Label htmlFor="comment" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Add a Comment (Optional)</Label>
            <Textarea 
              id="comment" 
              placeholder="e.g. Very professional and fast! Highly recommended." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] rounded-2xl bg-muted/10 border-2"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 p-8 pt-0">
          <Button 
            className="w-full h-16 rounded-full text-xl font-black shadow-2xl hover:scale-[1.02] transition-transform" 
            onClick={handleVerify}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <CheckCircle2 className="mr-2 h-6 w-6" />}
            Confirm Completion
          </Button>
          <p className="text-[10px] text-center text-muted-foreground font-medium flex items-center justify-center gap-1">
             <Clock className="h-3 w-3" /> Secure Verification Powered by AI
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
