
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp, collection, increment } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Share2, 
  Zap,
  TrendingUp,
  GraduationCap,
  Crown,
  PlayCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { COURSES, type Course } from "../page";
import { cn } from "@/lib/utils";

/**
 * YouTube Player logic for Watch-to-Earn.
 * Step 1: Load API Script.
 * Step 2: Initialize Player on target div.
 * Step 3: Listen for 'Ended' state (0).
 * Step 4: Fire Firestore reward logic.
 */

let apiLoaded = false;
const loadYoutubeApi = () => {
  if (apiLoaded || typeof window === 'undefined') return;
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  if (firstScriptTag && firstScriptTag.parentNode) {
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    apiLoaded = true;
  }
};

export default function CoursePlayerPage() {
  const { videoId } = useParams() as { videoId: string };
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const playerRef = useRef<any>(null);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessingReward, setIsProcessingReward] = useState(false);
  const [hasEarnedInThisSession, setHasEarnedInThisSession] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const course = COURSES.find(c => c.id === videoId);

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);

  useEffect(() => {
    if (profile && profile.completedCourses?.includes(videoId)) {
      setIsCompleted(true);
    }
  }, [profile, videoId]);

  useEffect(() => {
    loadYoutubeApi();
    
    // Define the global callback YouTube expects
    (window as any).onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    // If API already loaded, just init
    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    }
  }, [course]);

  const initPlayer = () => {
    if (!course || playerRef.current || !document.getElementById('yt-player')) return;
    
    playerRef.current = new (window as any).YT.Player('yt-player', {
      videoId: course.youtubeId,
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
        controls: 1,
        origin: window.location.origin
      },
      events: {
        onReady: () => setIsPlayerReady(true),
        onStateChange: (event: any) => {
          // YT.PlayerState.ENDED is 0
          if (event.data === 0) {
            handleVideoEnd();
          }
        }
      }
    });
  };

  const handleVideoEnd = async () => {
    if (isCompleted || hasEarnedInThisSession || !user || !workerRef || isProcessingReward || !course) return;

    setIsProcessingReward(true);
    try {
      const existingCompleted = profile?.completedCourses || [];
      const updatedCompleted = [...existingCompleted, videoId];
      
      const baseKP = course.reward || 5;
      const finalKP = profile?.isPro ? (baseKP * 2) : baseKP;
      const trustBoost = 2;

      const profileUpdate: any = {
        knowledgePoints: increment(finalKP),
        trustScore: increment(trustBoost),
        completedCourses: updatedCompleted,
        updatedAt: serverTimestamp()
      };

      const coursesInCategory = COURSES.filter(c => c.category === course.category);
      const completedInCategory = updatedCompleted.filter(id => 
        coursesInCategory.some(c => c.id === id)
      );

      let earnedBadgeName = null;
      if (completedInCategory.length === coursesInCategory.length) {
        const badgeSlug = `specialist-${course.category.toLowerCase().replace(/\s+/g, '-')}`;
        const existingBadges = profile?.badgeIds || [];
        
        if (!existingBadges.includes(badgeSlug)) {
          profileUpdate.badgeIds = [...existingBadges, badgeSlug];
          earnedBadgeName = `${course.category} Specialist`;
        }
      }

      updateDocumentNonBlocking(workerRef, profileUpdate);

      if (db) {
        const notifRef = collection(db, "workerProfiles", user.uid, "notifications");
        addDocumentNonBlocking(notifRef, {
          type: "badge_earned",
          message: earnedBadgeName 
            ? `Path Mastery Unlocked! You earned the "${earnedBadgeName}" badge and +${finalKP} KP.`
            : `Masterclass Finished! You earned +${finalKP} Knowledge Points and +${trustBoost} Trust Score for "${course.title}".`,
          isRead: false,
          createdAt: serverTimestamp()
        });
      }

      setIsCompleted(true);
      setHasEarnedInThisSession(true);
      toast({ 
        title: earnedBadgeName ? "Path Mastery!" : "Skill Certified!", 
        description: `${finalKP} KP awarded. ${profile?.isPro ? 'Pro 2x Bonus Applied!' : ''}` 
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingReward(false);
    }
  };

  if (!course) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Masterclass...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto px-4 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary font-black text-[8px] uppercase tracking-widest">{course.category}</Badge>
            {isCompleted && <Badge className="bg-green-500 text-white font-black text-[8px] uppercase tracking-widest">Completed</Badge>}
            {profile?.isPro && <Badge className="bg-secondary text-secondary-foreground font-black text-[8px] uppercase tracking-widest flex items-center gap-1"><Crown className="h-2 w-2" /> 2x Reward</Badge>}
          </div>
          <h1 className="text-xl font-black tracking-tight mt-1">{course.title}</h1>
        </div>
      </header>

      <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden bg-black shadow-2xl border-4 border-white group">
        {!isPlayerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20 backdrop-blur-sm z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div id="yt-player" className="w-full h-full" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-[2rem]">
            <CardContent className="p-8 space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Professional Insights
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {course.description} Mastering this module is essential for building a verifiable professional reputation. Watch to the end to earn your certification points.
              </p>
              <div className="pt-4 border-t flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>+{profile?.isPro ? (course.reward * 2) : course.reward} KP Reward</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>+2 Trust Score</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {isCompleted && (
            <Card className="border-none bg-green-500 text-white p-8 rounded-[2.5rem] shadow-xl animate-in zoom-in-95">
              <CardContent className="p-0 flex flex-col items-center text-center gap-6">
                <div className="bg-white/20 p-6 rounded-full shadow-2xl backdrop-blur-md animate-bounce">
                  <Award className="h-12 w-12 text-white" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tighter">Skill Verified!</h2>
                  <p className="text-sm font-medium opacity-90 leading-relaxed max-w-xs">
                    Module mastered. Your profile has been updated with {profile?.isPro ? (course.reward * 2) : course.reward} Knowledge Points.
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button variant="secondary" className="flex-1 rounded-full font-black bg-white text-green-600 hover:bg-white/90" onClick={() => router.push('/academy')}>
                    Browse Academy
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-full font-black border-white text-white hover:bg-white/10">
                    <Share2 className="mr-2 h-4 w-4" /> Share Proof
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1 space-y-6">
          {!profile?.isPro ? (
            <Card className="border-none bg-secondary/10 p-6 rounded-[2rem] border-2 border-secondary/20">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-secondary-foreground">
                  <Zap className="h-4 w-4 text-secondary fill-secondary" /> VIP Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <p className="text-[10px] font-medium leading-relaxed text-muted-foreground">
                  Pro VIP members earn <b>Double Knowledge Points</b> for every module completed in the Academy.
                </p>
                <Button className="w-full rounded-full font-black text-[10px] bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => router.push('/pricing')}>
                  Upgrade to Earn 2x
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none bg-primary/10 p-6 rounded-[2rem] border-2 border-primary/20">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Crown className="h-4 w-4 fill-primary" /> VIP Advantage
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-[10px] font-bold leading-relaxed text-primary">
                  VIP 2x Points Multiplier is ACTIVE. You are building your reputation twice as fast!
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm p-6 rounded-[2rem] bg-muted/30">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Mastery Progress</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black">
                <span>Certification</span>
                <span>{isCompleted ? '100%' : 'In Progress'}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full bg-primary transition-all duration-1000", isCompleted ? "w-full" : "w-[15%] animate-pulse")} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
