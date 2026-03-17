
"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Mail, 
  Lock, 
  Sparkles, 
  Loader2, 
  Gift, 
  CheckCircle2, 
  Ticket, 
  Timer,
  Phone,
  ArrowRight,
  ChevronLeft,
  Fingerprint,
  Smartphone,
  Heart,
  Globe
} from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Navigation";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type AuthMethod = "choice" | "phone" | "email-pass" | "email-link" | "google";

function LoginContent() {
  const [method, setMethod] = useState<AuthMethod>("choice");
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [desiredUsername, setDesiredUsername] = useState("");
  const [manualReferral, setManualReferral] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [timeLeft, setTimeLeft] = useState({h: 23, m: 59, s: 59});
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const urlReferral = searchParams?.get('ref') || "";

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeLeft({
        h: 23 - now.getHours(),
        m: 59 - now.getMinutes(),
        s: 59 - now.getSeconds()
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (auth && isSignInWithEmailLink(auth, window.location.href)) {
      let emailForLink = window.localStorage.getItem('emailForSignIn');
      if (!emailForLink) {
        emailForLink = window.prompt('Please provide your email for confirmation');
      }
      if (emailForLink) {
        setIsLoading(true);
        signInWithEmailLink(auth, emailForLink, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            handlePostAuth(result.user.uid);
          })
          .catch(() => {
            toast({ variant: "destructive", title: "Link Expired", description: "The magic link is no longer valid." });
            setIsLoading(false);
          });
      }
    }
  }, [auth]);

  const handlePostAuth = async (uid: string, manualName?: string, manualUsername?: string) => {
    if (!db) return;
    
    const profileRef = doc(db, "workerProfiles", uid);
    const snap = await getDoc(profileRef);
    const alreadyExists = snap.exists();
    
    setIsReturningUser(alreadyExists);

    if (!alreadyExists) {
      let invitedBy = "";
      const finalReferral = urlReferral || manualReferral;

      if (finalReferral) {
        try {
          const referralDocRef = doc(db, "referralCodes", finalReferral.trim().toUpperCase());
          const referralDocSnap = await getDoc(referralDocRef);
          
          if (referralDocSnap.exists()) {
            invitedBy = referralDocSnap.data().uid;
            const inviterRef = doc(db, "workerProfiles", invitedBy);
            
            updateDoc(inviterRef, {
              referralCount: increment(1),
              trustScore: increment(20),
              updatedAt: serverTimestamp()
            }).catch(() => {});

            const inviterNotifRef = collection(db, "workerProfiles", invitedBy, "notifications");
            addDoc(inviterNotifRef, {
              type: "profile_update",
              message: "Referral Success! Someone joined Globlync using your link. You earned +20 Trust Score.",
              isRead: false,
              createdAt: serverTimestamp()
            }).catch(() => {});
          }
        } catch (e) {
          console.warn("Referral propagation failed.");
        }
      }

      const yellowAvatar = PlaceHolderImages.find(img => img.id === 'avatar-default-yellow')?.imageUrl || "";
      const newCode = `GL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const finalName = manualName || auth.currentUser?.displayName || "New Professional";
      
      const firstName = finalName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const fallbackUsername = `gl_${firstName}_${uid.substring(0, 4)}`;
      const finalUsername = (manualUsername || desiredUsername)?.toLowerCase() || fallbackUsername;

      // FIRST 500 BONUS LOGIC
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      const earlyBirdBenefit = {
        type: "First 500 Legacy Pro",
        expiresAt: expiryDate.toISOString(),
        amountPaid: 0,
        paidAt: new Date().toISOString(),
        isBonusApplied: true
      };

      try {
        await setDoc(profileRef, {
          id: uid,
          name: finalName,
          username: finalUsername,
          tradeSkill: "",
          bio: "",
          profilePictureUrl: yellowAvatar,
          trustScore: invitedBy ? 10 : 0,
          profileViews: 0,
          referralCode: newCode,
          invitedBy,
          referralCount: 0,
          activeBenefits: [earlyBirdBenefit],
          badgeIds: ["early-pioneer"],
          onboardingCompleted: false,
          isPro: true, // Auto-pro for first 500
          isAvailable: true,
          contactEmail: auth.currentUser?.email || email || (phoneNumber ? `${phoneNumber}@phone.globlync` : ""),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setDoc(doc(db, "usernames", finalUsername), { uid }).catch(() => {});
        setDoc(doc(db, "referralCodes", newCode), { uid }).catch(() => {});

        const notifRef = collection(db, "workerProfiles", uid, "notifications");
        addDoc(notifRef, {
          type: "app",
          message: "Welcome Pioneer! You've been granted 30 Days of Pro VIP status for being one of the first 500 users.",
          isRead: false,
          createdAt: serverTimestamp()
        }).catch(() => {});

      } catch (e: any) {
        console.error("Profile setup failed.");
      }
    }

    setIsSuccess(true);
    
    setTimeout(() => {
      router.push("/profile");
      toast({ 
        title: alreadyExists ? "Welcome Back!" : "Account Secured!", 
        description: alreadyExists ? "Ready to manage your hub." : "Welcome to the global network." 
      });
    }, 1800);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handlePostAuth(result.user.uid);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: "Ensure popups are allowed." });
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    
    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast({ title: "Check Your Email", description: "We sent a magic link to your inbox." });
      setMethod("choice");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp && (!fullName || !desiredUsername)) {
      toast({ variant: "destructive", title: "Incomplete", description: "Name and Username are required." });
      setIsLoading(false);
      return;
    }

    const finalIdentifier = method === "email-pass" ? email : `${phoneNumber}@phone.globlync`;

    try {
      if (isSignUp) {
        const nameRef = doc(db!, "usernames", desiredUsername.toLowerCase());
        const nameSnap = await getDoc(nameRef);
        if (nameSnap.exists()) {
          toast({ variant: "destructive", title: "Username Taken", description: "Please pick another." });
          setIsLoading(false);
          return;
        }

        const result = await createUserWithEmailAndPassword(auth, finalIdentifier, password);
        await handlePostAuth(result.user.uid, fullName, desiredUsername);
      } else {
        const result = await signInWithEmailAndPassword(auth, finalIdentifier, password);
        await handlePostAuth(result.user.uid);
      }
    } catch (error: any) {
      let msg = error.message;
      if (error.code === 'auth/invalid-credential') msg = "Incorrect details.";
      if (error.code === 'auth/email-already-in-use') msg = "Email already registered. Try signing in.";
      
      toast({ variant: "destructive", title: "Auth Failed", description: msg });
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className={cn(
            "p-10 rounded-full shadow-2xl animate-bounce",
            isReturningUser ? "bg-secondary/10" : "bg-primary/10"
          )}>
            {isReturningUser ? (
              <Heart className="h-24 w-24 text-secondary fill-secondary" />
            ) : (
              <CheckCircle2 className="h-24 w-24 text-primary" />
            )}
          </div>
          <Sparkles className="absolute -top-4 -right-4 h-10 w-10 text-secondary fill-secondary animate-pulse" />
        </div>
        <div className="space-y-3">
          <h2 className={cn(
            "text-5xl font-black tracking-tighter",
            isReturningUser ? "text-secondary" : "text-primary"
          )}>
            {isReturningUser ? "Welcome Back!" : "Account Secured!"}
          </h2>
          <p className="text-muted-foreground text-xl font-medium uppercase tracking-widest">
            {isReturningUser ? "We missed your insights." : "Welcome to the global network."}
          </p>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-12 px-4 max-w-4xl mx-auto">
      <div className="w-full text-center mb-10 space-y-4">
        <Logo className="scale-125 mb-4 mx-auto" />
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
          Join <span className="text-primary">500+</span> Professionals.
        </h1>
        <p className="text-muted-foreground font-medium max-w-md mx-auto">
          One tap to secure your unique professional handle and start building global trust.
        </p>
      </div>

      <Card className="w-full max-w-md border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden">
        <div className="bg-orange-500 text-white p-3 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest">
          <Timer className="h-3 w-3" />
          +7 BONUS PRO DAYS Ends in {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
        </div>

        <CardContent className="p-8">
          {method === "choice" && (
            <div className="grid gap-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-black text-sm uppercase tracking-tight">Quick Sign-Up</h3>
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-[10px] font-black text-primary underline uppercase">
                  {isSignUp ? "Already a pro?" : "Need an ID?"}
                </button>
              </div>
              
              <Button 
                variant="outline" 
                className="h-20 rounded-2xl border-2 font-black shadow-sm group hover:border-primary/40 transition-all"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="bg-white p-2 rounded-xl border-2 shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black">Continue with Google</p>
                    <p className="text-[10px] opacity-60">Verified in one tap</p>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-20 rounded-2xl border-2 border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-700 font-black"
                onClick={() => setMethod("phone")}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="bg-white p-2 rounded-xl border-2 shrink-0">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black">Phone Number</p>
                    <p className="text-[10px] opacity-60">Malawi Local Support</p>
                  </div>
                </div>
              </Button>

              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
                <span className="relative bg-white px-4 text-[8px] font-black uppercase text-muted-foreground tracking-widest">Other Professional Methods</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="ghost" size="sm" className="h-12 rounded-xl text-[10px] font-black uppercase border border-dashed" onClick={() => setMethod("email-pass")}>
                  <Mail className="mr-2 h-3.5 w-3.5" /> Email
                </Button>
                <Button variant="ghost" size="sm" className="h-12 rounded-xl text-[10px] font-black uppercase border border-dashed" onClick={() => setMethod("email-link")}>
                  <Fingerprint className="mr-2 h-3.5 w-3.5" /> Magic Link
                </Button>
              </div>
            </div>
          )}

          {method !== "choice" && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={() => setMethod("choice")}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-primary mb-4"
              >
                <ChevronLeft className="h-3 w-3" /> Back to quick options
              </button>

              <form onSubmit={method === "email-link" ? handleMagicLink : handleAuth} className="grid gap-4">
                {isSignUp && (
                  <>
                    <div className="grid gap-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Full Name</Label>
                      <Input placeholder="e.g. John Doe" className="h-12 rounded-xl bg-muted/10 border-2" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="grid gap-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Desired @Username</Label>
                      <Input placeholder="e.g. john_pro" className="h-12 rounded-xl bg-muted/10 border-2" value={desiredUsername} onChange={(e) => setDesiredUsername(e.target.value)} required />
                    </div>
                  </>
                )}

                {method === "phone" ? (
                  <div className="grid gap-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Malawi Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input type="tel" placeholder="0989999999" className="h-12 pl-10 rounded-xl bg-muted/10 border-2" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="email@example.com" className="h-12 pl-10 rounded-xl bg-muted/10 border-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                )}

                {method !== "email-link" && (
                  <div className="grid gap-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="h-12 pl-10 rounded-xl bg-muted/10 border-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                )}

                <Button className="w-full h-16 rounded-full font-black text-lg shadow-xl mt-2 group" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {method === "email-link" ? "Send Magic Link" : isSignUp ? "Finish My Profile" : "Sign In to My Hub"}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-muted/30 p-6 flex flex-col gap-2">
          <p className="text-[9px] font-bold text-center text-muted-foreground uppercase tracking-widest">
            <Globe className="inline h-3 w-3 mr-1" /> Secure Global Entry v2.0
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-black text-[10px] uppercase tracking-widest animate-pulse">Initializing Secure Gateway...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
