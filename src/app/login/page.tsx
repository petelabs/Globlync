"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Mail, Lock, Sparkles, Wand2, Loader2, Gift, ShieldCheck, Users, Globe, User, CheckCircle2, Ticket } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Logo } from "@/components/Navigation";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";

function LoginContent() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [desiredUsername, setDesiredUsername] = useState("");
  const [manualReferral, setManualReferral] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const urlReferral = searchParams?.get('ref') || "";

  const handlePostAuth = async (uid: string, manualName?: string, manualUsername?: string) => {
    if (!db) return;
    
    const profileRef = doc(db, "workerProfiles", uid);
    const snap = await getDoc(profileRef);
    
    if (!snap.exists()) {
      let invitedBy = "";
      const finalReferral = urlReferral || manualReferral;

      if (finalReferral) {
        const referralDocRef = doc(db, "referralCodes", finalReferral.trim().toUpperCase());
        const referralDocSnap = await getDoc(referralDocRef);
        
        if (referralDocSnap.exists()) {
          invitedBy = referralDocSnap.data().uid;
          const inviterRef = doc(db, "workerProfiles", invitedBy);
          
          updateDoc(inviterRef, {
            referralCount: increment(1),
            updatedAt: serverTimestamp()
          }).catch(() => {});

          const inviterNotifRef = collection(db, "workerProfiles", invitedBy, "notifications");
          addDoc(inviterNotifRef, {
            type: "profile_update",
            message: "New Referral! Someone joined Globlync using your link.",
            isRead: false,
            createdAt: serverTimestamp()
          }).catch(() => {});
        }
      }

      // Professional Gradient Avatars
      const defaultAvatars = PlaceHolderImages.filter(img => img.id.startsWith('avatar-default-')).map(img => img.imageUrl);
      const fallbackTeal = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImcxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDA3OTZCO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDA0RDQwO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnMSkiLz48L3N2Zz4=";
      const randomAvatar = defaultAvatars.length > 0 ? defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)] : fallbackTeal;
      const profilePictureUrl = auth.currentUser?.photoURL || randomAvatar;

      const newCode = `GL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const finalName = manualName || auth.currentUser?.displayName || "New Worker";
      const fallbackUsername = `globlync_${finalName.toLowerCase().replace(/\s+/g, '_')}_${uid.substring(0, 4)}`;
      const finalUsername = manualUsername?.toLowerCase() || fallbackUsername;

      await setDoc(profileRef, {
        id: uid,
        name: finalName,
        username: finalUsername,
        tradeSkill: "",
        bio: "",
        profilePictureUrl,
        trustScore: invitedBy ? 10 : 0,
        referralCode: newCode,
        invitedBy,
        referralCount: 0,
        activeBenefits: [],
        badgeIds: [],
        onboardingCompleted: false,
        isPro: false,
        contactEmail: auth.currentUser?.email || email || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Registry entries
      await setDoc(doc(db, "usernames", finalUsername), { uid });
      await setDoc(doc(db, "referralCodes", newCode), { uid });

      const notifRef = collection(db, "workerProfiles", uid, "notifications");
      await addDoc(notifRef, {
        type: "app",
        message: "Welcome to Globlync! Start by logging your work to build an evidence-based professional reputation.",
        isRead: false,
        createdAt: serverTimestamp()
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      toast({ title: "Welcome to Globlync!" });
    }, 1500);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      await handlePostAuth(result.user.uid);
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      let errorMessage = "Ensure you are using a standard browser and check your internet.";
      if (error.code === 'auth/popup-blocked') errorMessage = "The sign-in popup was blocked. Please allow popups for this site.";
      if (error.code === 'auth/unauthorized-domain') errorMessage = "This domain is not authorized. Please check your Firebase Console settings.";
      
      toast({ 
        variant: "destructive", 
        title: "Login Failed", 
        description: errorMessage 
      });
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp && (!fullName || !desiredUsername)) {
      toast({ variant: "destructive", title: "Registration Incomplete", description: "Name and Desired Username are required." });
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const nameRef = doc(db!, "usernames", desiredUsername.toLowerCase());
        const nameSnap = await getDoc(nameRef);
        if (nameSnap.exists()) {
          toast({ variant: "destructive", title: "Username Taken", description: "Please pick another username." });
          setIsLoading(false);
          return;
        }

        const result = await createUserWithEmailAndPassword(auth, email, password);
        await handlePostAuth(result.user.uid, fullName, desiredUsername);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await handlePostAuth(result.user.uid);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth Failed", description: error.message });
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 animate-in fade-in zoom-in-95 duration-500 text-center px-4">
        <div className="bg-primary/10 p-8 rounded-full shadow-2xl animate-bounce">
          <CheckCircle2 className="h-20 w-20 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-primary">Success!</h2>
          <p className="text-muted-foreground text-lg font-medium">Preparing your professional dashboard...</p>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 min-h-[80vh] items-center gap-12 py-12 px-4 max-w-6xl mx-auto">
      <div className="space-y-8 text-center lg:text-left">
        <div className="flex justify-center lg:justify-start">
          <Logo className="scale-150 mb-4" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
          Build your <span className="text-primary italic">Professional Identity.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
          Join the global network. Log verified work, earn trust points, and connect with remote opportunities worldwide.
        </p>
        
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <div className="bg-primary/10 p-3 rounded-2xl"><ShieldCheck className="h-6 w-6 text-primary" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Verified Trust</p>
          </div>
          <div className="flex flex-col items-center lg:items-start gap-2">
            <div className="bg-secondary/10 p-3 rounded-2xl"><Users className="h-6 w-6 text-secondary" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Artisan Hub</p>
          </div>
          <div className="flex flex-col items-center lg:items-start gap-2">
            <div className="bg-blue-500/10 p-3 rounded-2xl"><Globe className="h-6 w-6 text-blue-500" /></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Global Scale</p>
          </div>
        </div>
      </div>

      <div className="relative">
        {isLoading && !isSuccess && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-[3rem] animate-in fade-in duration-300">
             <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
             <p className="font-black text-primary uppercase tracking-widest text-xs">
                {isSignUp ? "Creating Account..." : "Signing In..."}
             </p>
          </div>
        )}
        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8 pt-10 text-center">
            <CardDescription className="font-bold text-sm">
              {isSignUp ? "Create your professional account" : "Welcome back to Globlync"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 p-8">
            <Button 
              variant="outline" 
              className="w-full rounded-full py-8 border-2 font-black text-base hover:bg-muted/50 transition-all active:scale-95 flex items-center justify-center" 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
            
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
              <span className="relative bg-white px-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Or use email</span>
            </div>

            <form onSubmit={handleEmailAuth} className="grid gap-4">
              {isSignUp && (
                <>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Full Name</Label>
                    <Input placeholder="e.g. John Doe" className="h-14 rounded-2xl bg-muted/10 border-2" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Desired Username</Label>
                    <Input placeholder="e.g. jdoe_plumber" className="h-14 rounded-2xl bg-muted/10 border-2" value={desiredUsername} onChange={(e) => setDesiredUsername(e.target.value)} required />
                  </div>
                  {!urlReferral && (
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60 flex items-center gap-1">
                        <Ticket className="h-3 w-3" /> Referral Code (Optional)
                      </Label>
                      <Input placeholder="e.g. GL-ABC123" className="h-14 rounded-2xl bg-primary/5 border-2 border-dashed border-primary/20" value={manualReferral} onChange={(e) => setManualReferral(e.target.value.toUpperCase())} />
                    </div>
                  )}
                </>
              )}
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Email</Label>
                <Input type="email" placeholder="professional@example.com" className="h-14 rounded-2xl bg-muted/10 border-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Password</Label>
                <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-muted/10 border-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button className="w-full h-16 rounded-full font-black text-lg shadow-xl mt-2 active:scale-95" type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-8 pt-0">
            <p className="text-center text-sm font-medium text-muted-foreground">
              {isSignUp ? "Already part of the network?" : "New professional?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-black hover:underline transition-colors">{isSignUp ? "Sign In" : "Register Free"}</button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-black text-[10px] uppercase tracking-widest animate-pulse">Initializing Global Gateway...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
