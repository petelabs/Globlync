
"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Mail, Lock, LogIn, Sparkles, Wand2, Loader2 } from "lucide-react";
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
import Link from "next/link";
import { Logo } from "@/components/Navigation";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, addDoc } from "firebase/firestore";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"password" | "magic-link">("password");
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const referralCode = searchParams.get('ref');

  useEffect(() => {
    if (typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)) {
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
          .catch((error: any) => {
            toast({
              variant: "destructive",
              title: "Link Verification Failed",
              description: error.message,
            });
            setIsLoading(false);
          });
      }
    }
  }, [auth, router, toast]);

  const handlePostAuth = async (uid: string) => {
    if (!db) return;
    
    const profileRef = doc(db, "workerProfiles", uid);
    const snap = await getDoc(profileRef);
    
    if (!snap.exists()) {
      let invitedBy = "";
      if (referralCode) {
        const refMappingRef = doc(db, "referralCodes", referralCode);
        const refMappingSnap = await getDoc(refMappingRef);
        
        if (refMappingSnap.exists()) {
          invitedBy = refMappingSnap.data().uid;
          const inviterRef = doc(db, "workerProfiles", invitedBy);
          
          updateDoc(inviterRef, {
            referralCount: increment(1),
            updatedAt: serverTimestamp()
          }).catch(() => {});
        }
      }

      const newCode = `GL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      await setDoc(profileRef, {
        id: uid,
        name: auth.currentUser?.displayName || "New Worker",
        username: `worker_${uid.substring(0, 5)}`,
        tradeSkill: "",
        bio: "",
        trustScore: 0,
        referralCode: newCode,
        invitedBy,
        referralCount: 0,
        activeBenefits: [],
        badgeIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, "referralCodes", newCode), { uid });

      const notifRef = collection(db, "workerProfiles", uid, "notifications");
      await addDoc(notifRef, {
        type: "app",
        message: "Welcome to Globlync! Get Pro for only MWK 400 if you upgrade within the next 5 hours. Your support helps cover AI, storage, and maintenance.",
        isRead: false,
        createdAt: serverTimestamp()
      });
    }

    router.push("/dashboard");
    toast({ title: "Welcome to Globlync!" });
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.addScope('openid');

    try {
      const result = await signInWithPopup(auth, provider);
      await handlePostAuth(result.user.uid);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    
    const actionCodeSettings = {
      url: window.location.origin + '/login' + (referralCode ? `?ref=${referralCode}` : ''),
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast({
        title: "Link Sent!",
        description: "Check your email for your magic sign-in link.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send link",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      await handlePostAuth(result.user.uid);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-12 px-4">
      {referralCode && (
        <div className="mb-6 bg-secondary/10 border-2 border-secondary p-4 rounded-2xl flex items-center gap-3 animate-bounce shadow-lg">
          <Sparkles className="h-6 w-6 text-secondary" />
          <div className="text-left">
            <p className="text-xs font-black uppercase text-secondary">Invited Professional</p>
            <p className="text-[10px] font-medium opacity-80 leading-tight">Complete sign up to unlock your starter reputation points.</p>
          </div>
        </div>
      )}
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <Logo className="scale-125" />
          </div>
          <CardDescription>
            {isSignUp ? "Create an account to build your reputation" : "Sign in to manage your worker profile"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            variant="outline" 
            className="w-full rounded-full py-6 border-2 font-bold hover:bg-muted/50 transition-colors" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
          
          <div className="flex gap-2 p-1 bg-muted rounded-full mt-2">
            <button className={cn("flex-1 py-2 text-xs font-bold rounded-full transition-all", authMode === "password" ? "bg-white shadow-sm text-primary" : "text-muted-foreground")} onClick={() => setAuthMode("password")}>Password</button>
            <button className={cn("flex-1 py-2 text-xs font-bold rounded-full transition-all", authMode === "magic-link" ? "bg-white shadow-sm text-primary" : "text-muted-foreground")} onClick={() => setAuthMode("magic-link")}>Magic Link</button>
          </div>

          {authMode === "password" ? (
            <form onSubmit={handleEmailAuth} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="m@example.com" className="pl-10 h-12" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" className="pl-10 h-12" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
              <Button className="w-full h-12 rounded-full font-bold" type="submit" disabled={isLoading}>{isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}</Button>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkSignIn} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="magic-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="magic-email" type="email" placeholder="m@example.com" className="pl-10 h-12" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <Button className="w-full h-12 rounded-full font-bold" type="submit" disabled={isLoading}>{isLoading ? "Sending..." : "Send Magic Link"}<Wand2 className="ml-2 h-4 w-4" /></Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground w-full">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-semibold hover:underline">{isSignUp ? "Sign In" : "Sign Up"}</button>
          </p>
          <div className="flex gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
