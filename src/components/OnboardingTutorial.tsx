
"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  title: string;
  message: string;
  path: string;
  targetId?: string;
  arrow?: "up" | "down" | "none";
};

const TUTORIAL_STEPS: Step[] = [
  {
    id: "welcome",
    title: "Welcome to Globlync!",
    message: "Let's build your professional reputation. First, we need to set up your profile.",
    path: "/dashboard",
    arrow: "none"
  },
  {
    id: "goto-profile",
    title: "Find Your Profile",
    message: "Tap on your profile icon in the navigation bar to start customizing your professional identity.",
    path: "/dashboard",
    targetId: "nav-user-menu",
    arrow: "up"
  },
  {
    id: "upload-photo",
    title: "Look Professional",
    message: "A professional photo builds instant trust. Tap the camera to upload a clear photo of yourself.",
    path: "/profile",
    targetId: "profile-camera-btn",
    arrow: "down"
  },
  {
    id: "save-profile",
    title: "Finalize Setup",
    message: "Tell us your trade and save your settings to go live!",
    path: "/profile",
    targetId: "profile-save-btn",
    arrow: "up"
  }
];

export function OnboardingTutorial() {
  const { user } = useUser();
  const db = useFirestore();
  const pathname = usePathname();
  const router = useRouter();
  
  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);
  const [currentStepIdx, setCurrentStepIdx] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (profile && profile.onboardingCompleted === false && currentStepIdx === null) {
      setCurrentStepIdx(0);
      setIsVisible(true);
    }
  }, [profile, currentStepIdx]);

  useEffect(() => {
    const step = TUTORIAL_STEPS[currentStepIdx ?? -1];
    if (step && step.targetId) {
      const el = document.getElementById(step.targetId);
      if (el) {
        setRect(el.getBoundingClientRect());
      }
    } else {
      setRect(null);
    }
  }, [currentStepIdx, pathname]);

  useEffect(() => {
    const handleUpdate = () => {
      const step = TUTORIAL_STEPS[currentStepIdx ?? -1];
      if (step && step.targetId) {
        const el = document.getElementById(step.targetId);
        if (el) setRect(el.getBoundingClientRect());
      }
    };
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [currentStepIdx]);

  const handleNext = () => {
    if (currentStepIdx === null) return;
    const nextIdx = currentStepIdx + 1;
    if (nextIdx < TUTORIAL_STEPS.length) {
      const nextStep = TUTORIAL_STEPS[nextIdx];
      if (pathname !== nextStep.path) {
        router.push(nextStep.path);
      }
      setCurrentStepIdx(nextIdx);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (workerRef) {
      updateDocumentNonBlocking(workerRef, {
        onboardingCompleted: true,
        updatedAt: serverTimestamp()
      });
    }
    setIsVisible(false);
    setCurrentStepIdx(null);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible || currentStepIdx === null) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIdx];
  const isWrongPage = pathname !== currentStep.path;
  
  // Decide where to put the card so it doesn't cover the spotlight
  // If the target element is in the top half of the screen, move the card to the bottom
  const cardPositionClass = rect && rect.top < 400 ? "bottom-10" : "top-10";

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      {/* Dark Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity pointer-events-auto" 
        onClick={handleSkip}
      />

      {/* Spotlight Effect */}
      {rect && !isWrongPage && (
        <div 
          className="absolute border-4 border-secondary shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] rounded-xl pointer-events-auto transition-all duration-500 ease-in-out"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        >
          {/* Animated Arrow */}
          {currentStep.arrow === "up" && (
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center">
              <ArrowUp className="h-12 w-12 text-secondary" />
            </div>
          )}
          {currentStep.arrow === "down" && (
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center">
              <ArrowDown className="h-12 w-12 text-secondary" />
            </div>
          )}
        </div>
      )}

      {/* Tutorial Card */}
      <div className={cn("absolute left-1/2 -translate-x-1/2 w-full max-w-xs px-4 transition-all duration-500 pointer-events-auto", cardPositionClass)}>
        <Card className="shadow-2xl border-none animate-in zoom-in-95 duration-300">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-lg font-bold">{currentStep.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-xs text-muted-foreground leading-relaxed px-4">
            {currentStep.message}
            {isWrongPage && (
               <p className="mt-2 text-[10px] font-black text-primary animate-pulse flex items-center justify-center gap-1">
                 <ChevronRight className="h-3 w-3" /> Auto-navigating to {currentStep.path.replace('/', '')}...
               </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-2">
            <Button 
              className="w-full rounded-full h-10 font-bold shadow-lg text-sm" 
              onClick={isWrongPage ? () => router.push(currentStep.path) : handleNext}
            >
              {currentStepIdx === TUTORIAL_STEPS.length - 1 ? "Finish Tutorial" : "Continue"}
              {currentStepIdx < TUTORIAL_STEPS.length - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground h-6" onClick={handleSkip}>
              Skip Tutorial
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
