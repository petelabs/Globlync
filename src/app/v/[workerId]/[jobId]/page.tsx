"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, useCollection } from "@/firebase";
import { doc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle2, ShieldCheck, Loader2, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

    // Milestone: First Verified Job
    if (verifiedCount === 1 && !earnedBadges.includes('first-job')) {
      earnedBadges.push('first-job');
      awardedBadgeName = "First Verified Job";
    }

    // Milestone: Reliable Worker (5 Jobs)
    if (verifiedCount === 5 && !earnedBadges.includes('reliable-worker')) {
      earnedBadges.push('reliable-worker');
      awardedBadgeName = "Reliable Professional";
    }

    // Milestone: Perfect Rating Streak
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
        <h1 className="text-2xl font-bold">Verification Link Expired</h1>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  if (isDone || job.isVerified) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center max-w-md mx-auto px-4">
        {newBadge ? (
          <div className="bg-secondary/10 p-8 rounded-full animate-bounce">
            <Award className="h-20 w-20 text-secondary" />
          </div>
        ) : (
          <div className="bg-primary/10 p-6 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
        )}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{newBadge ? "Milestone Awarded!" : "Work Verified"}</h1>
          <p className="text-muted-foreground">
            {newBadge 
              ? `Your verification helped ${worker?.name} earn the "${newBadge}" badge!` 
              : `Thank you for verifying the work by ${worker?.name}. Your feedback is valuable.`}
          </p>
        </div>
        <Button variant="outline" className="rounded-full px-8" onClick={() => router.push("/")}>
          Return to Globlync
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg border-none shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verify Completion</CardTitle>
          <CardDescription>
            Confirm work by <strong>{worker?.name}</strong>
          </CardDescription>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left">
            <h3 className="font-bold text-lg">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.description}</p>
            {job.photoUrl && (
              <img src={job.photoUrl} alt="Job proof" className="mt-3 rounded-md w-full aspect-video object-cover border" />
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="space-y-4">
            <Label className="text-base">Rating</Label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-125"
                >
                  <Star 
                    className={cn(
                      "h-10 w-10",
                      star <= rating ? "fill-secondary text-secondary" : "text-muted"
                    )} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="comment">Feedback (Optional)</Label>
            <Textarea 
              id="comment" 
              placeholder="How was the quality of work?" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full h-14 rounded-full text-lg font-bold shadow-lg" 
            onClick={handleVerify}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Confirm & Verify
          </Button>
          <p className="text-[10px] text-center text-muted-foreground">
            Verifying confirms the job was completed as described.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
