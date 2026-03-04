
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Mail, Lock, LogIn, Sparkles, Wand2 } from "lucide-react";
import { useAuth } from "@/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"password" | "magic-link">("password");
  
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Handle incoming magic link
  useEffect(() => {
    if (typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)) {
      let emailForLink = window.localStorage.getItem('emailForSignIn');
      if (!emailForLink) {
        emailForLink = window.prompt('Please provide your email for confirmation');
      }
      if (emailForLink) {
        setIsLoading(true);
        signInWithEmailLink(auth, emailForLink, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            router.push("/dashboard");
            toast({ title: "Success", description: "You are now signed in!" });
          })
          .catch((error: any) => {
            toast({
              variant: "destructive",
              title: "Link Verification Failed",
              description: error.message,
            });
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [auth, router, toast]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    
    const actionCodeSettings = {
      url: window.location.origin + '/login',
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
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Globlync</CardTitle>
          <CardDescription>
            {isSignUp ? "Create an account to build your reputation" : "Sign in to manage your worker profile"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" className="w-full rounded-full py-6" onClick={handleGoogleLogin} disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
          
          <div className="flex gap-2 p-1 bg-muted rounded-full">
            <button 
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-full transition-all",
                authMode === "password" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
              )}
              onClick={() => setAuthMode("password")}
            >
              Password
            </button>
            <button 
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-full transition-all",
                authMode === "magic-link" ? "bg-white shadow-sm text-primary" : "text-muted-foreground"
              )}
              onClick={() => setAuthMode("magic-link")}
            >
              Magic Link
            </button>
          </div>

          {authMode === "password" ? (
            <form onSubmit={handleEmailAuth} className="grid gap-4 animate-in fade-in duration-300">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className="pl-10 h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10 h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button className="w-full h-12 rounded-full" type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkSignIn} className="grid gap-4 animate-in fade-in duration-300">
              <div className="grid gap-2">
                <Label htmlFor="magic-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="m@example.com"
                    className="pl-10 h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center px-4">
                We'll email you a one-time link that signs you in instantly. No password required.
              </p>
              <Button className="w-full h-12 rounded-full" type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Magic Link"}
                <Wand2 className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
