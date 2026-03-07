
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Settings, 
  Shield, 
  FileText, 
  LogOut, 
  Trash2, 
  Download, 
  ChevronRight, 
  Lock, 
  BellRing,
  ExternalLink,
  Moon,
  Sun,
  Zap,
  ZapOff,
  Crown,
  CreditCard,
  Mail,
  LifeBuoy,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Heart,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { useAuth, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

const DELETION_REASONS = [
  "Not finding enough work opportunities",
  "Too difficult to use",
  "I have privacy concerns",
  "Receiving too many notifications",
  "Found another platform I prefer",
  "Verification process is too complicated",
  "Just testing the app",
  "Technical bugs and errors",
  "Trust Score system is confusing",
  "Moving to a different career"
];

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [darkMode, setDarkMode] = useState(false);
  const [animationsDisabled, setAnimationsDisabled] = useState(false);
  
  // Deletion States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1); // 1: Confirmation, 2: Impact Info, 3: Reason, 4: Auth, 5: Success
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherDescription, setOtherDescription] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const isNoAnim = document.documentElement.classList.contains('no-animations');
    setDarkMode(isDark);
    setAnimationsDisabled(isNoAnim);
  }, []);

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  const toggleAnimations = (disabled: boolean) => {
    setAnimationsDisabled(disabled);
    if (disabled) {
      document.documentElement.classList.add('no-animations');
      localStorage.setItem('animationsDisabled', 'true');
    } else {
      document.documentElement.classList.remove('no-animations');
      localStorage.setItem('animationsDisabled', 'false');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
      toast({ title: "Signed Out" });
    } catch (error) {
      toast({ variant: "destructive", title: "Logout Failed" });
    }
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleDeleteAccount = async () => {
    if (!user || !db) return;
    setIsDeleting(true);

    try {
      // 1. Re-authenticate
      const providerId = user.providerData[0]?.providerId;
      if (providerId === 'password') {
        if (!password) {
          toast({ variant: "destructive", title: "Password Required" });
          setIsDeleting(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email!, password);
        await reauthenticateWithCredential(user, credential);
      } else if (providerId === 'google.com') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await reauthenticateWithPopup(user, provider);
      }

      // 2. Submit hidden feedback
      await fetch('/api/account-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid,
          reasons: selectedReasons,
          description: otherDescription
        })
      });

      // 3. Delete from Firestore
      await deleteDoc(doc(db, "workerProfiles", user.uid));
      // Cleanup Registry
      const userSnap = await doc(db, "workerProfiles", user.uid); // Reference for any username cleanup
      
      // 4. Final Delete Auth User
      await deleteUser(user);

      setDeleteStep(5);
      setTimeout(() => {
        setIsDeleteDialogOpen(false);
        router.push("/");
      }, 8000); 

    } catch (error: any) {
      console.error(error);
      let msg = "Security verification failed. Please try logging in again first.";
      if (error.code === 'auth/wrong-password') msg = "Incorrect password.";
      if (error.code === 'auth/popup-blocked') msg = "The verification popup was blocked by your browser.";
      
      toast({ 
        variant: "destructive", 
        title: "Deletion Failed", 
        description: msg
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto px-2">
      <header>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">Manage your account, appearance, and privacy.</p>
      </header>

      <Card className="border-none shadow-md bg-primary text-primary-foreground rounded-[2rem] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Billing & Subscription
          </CardTitle>
          <CardDescription className="text-primary-foreground/70">Manage your Pro features and benefits.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5" />
              <div>
                <p className="text-sm font-bold">Pro VIP Status</p>
                <p className="text-xs opacity-80">Check your current benefits and expiry.</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" asChild className="rounded-full font-black">
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-accent/30 rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" />
            Help & Support
          </CardTitle>
          <CardDescription>Need help with your account or professional profile?</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button variant="outline" className="w-full rounded-full border-primary text-primary font-bold bg-white h-12" asChild>
            <a href="mailto:globlync+support@gmail.com?subject=Globlync%20Support%20Request">
              <Mail className="mr-2 h-4 w-4" /> Email Support
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-xs font-bold uppercase tracking-widest opacity-60" asChild>
            <Link href="/contact">View All Contact Points</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>Customize your visual experience.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-sm font-bold">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Switch to a darker theme for night use.</p>
              </div>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                {animationsDisabled ? <ZapOff className="h-5 w-5 text-primary" /> : <Zap className="h-5 w-5 text-primary" />}
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="animations" className="text-sm font-bold">Reduce Animations</Label>
                <p className="text-xs text-muted-foreground">Turn off visual motion effects.</p>
              </div>
            </div>
            <Switch id="animations" checked={animationsDisabled} onCheckedChange={toggleAnimations} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-lg">Account & Security</CardTitle>
          <CardDescription>Secure your profile and manage sessions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="flex items-center justify-between p-4 rounded-2xl border bg-muted/30">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Password & Auth</p>
                <p className="text-xs text-muted-foreground">Managed via {user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border bg-muted/30">
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Alerts for verifications and badges</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full">ACTIVE</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button variant="outline" className="w-full rounded-full font-bold h-12" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) {
              setDeleteStep(1);
              setPassword("");
              setSelectedReasons([]);
              setOtherDescription("");
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 text-xs font-bold h-10">
                <Trash2 className="mr-2 h-4 w-4" /> Permanently Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              {deleteStep === 1 && (
                <div className="p-10 space-y-6 text-center">
                  <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight">Are you sure?</h2>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                      We're sad to see you go. Are you sure you want to start the account deletion process?
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-4">
                    <Button className="w-full rounded-full h-12 font-black" onClick={() => setDeleteStep(2)}>
                      Continue to Delete
                    </Button>
                    <Button variant="ghost" className="w-full font-bold text-xs" onClick={() => setIsDeleteDialogOpen(false)}>
                      Back to Settings
                    </Button>
                  </div>
                </div>
              )}

              {deleteStep === 2 && (
                <div className="p-10 space-y-6">
                  <div className="bg-primary/10 p-4 rounded-2xl flex items-center gap-4">
                    <ShieldAlert className="h-8 w-8 text-primary shrink-0" />
                    <h2 className="text-xl font-black tracking-tight">Understand the Impact</h2>
                  </div>
                  <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <p>Deleting your account will <span className="text-destructive font-black">permanently remove</span> your profile, trust score, verified jobs, and all professional evidence from our database.</p>
                    <p className="bg-muted/50 p-4 rounded-xl border-l-4 border-primary font-medium text-xs">
                      Note: You can still create another account using the same email at a later time if you change your mind.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-4">
                    <Button className="w-full rounded-full h-12 font-black" onClick={() => setDeleteStep(3)}>
                      I Understand, Continue
                    </Button>
                    <Button variant="ghost" className="w-full font-bold text-xs" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel & Keep My Account
                    </Button>
                  </div>
                </div>
              )}

              {deleteStep === 3 && (
                <>
                  <DialogHeader className="p-8 pb-4 bg-destructive/5">
                    <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2 text-destructive">
                      Help Us Improve
                    </DialogTitle>
                    <DialogDescription className="font-medium text-sm pt-2">
                      Please tell us why you are leaving. Your feedback is required to finalize deletion.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="px-8 py-4 space-y-4 max-h-[40vh] overflow-y-auto scrollbar-hide">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Reason(s)</p>
                    <div className="grid gap-3">
                      {DELETION_REASONS.map((reason) => (
                        <div key={reason} className="flex items-center space-x-3 bg-muted/30 p-3 rounded-xl border border-transparent hover:border-primary/20 transition-all cursor-pointer" onClick={() => toggleReason(reason)}>
                          <Checkbox checked={selectedReasons.includes(reason)} onCheckedChange={() => toggleReason(reason)} />
                          <Label className="text-xs font-bold leading-none cursor-pointer">{reason}</Label>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Anything else? (Optional)</Label>
                      <Textarea 
                        placeholder="Describe your experience or suggest improvements..." 
                        className="mt-2 rounded-xl text-xs min-h-[80px]"
                        value={otherDescription}
                        onChange={(e) => setOtherDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="p-8 pt-4 flex-col sm:flex-col gap-2">
                    <Button 
                      className="w-full rounded-full h-12 font-black text-sm" 
                      disabled={selectedReasons.length === 0}
                      onClick={() => setDeleteStep(4)}
                    >
                      Continue to Auth Verification
                    </Button>
                    <Button variant="ghost" className="w-full text-xs font-bold" onClick={() => setIsDeleteDialogOpen(false)}>
                      Stay with Globlync
                    </Button>
                  </DialogFooter>
                </>
              )}

              {deleteStep === 4 && (
                <>
                  <DialogHeader className="p-8 pb-4 bg-destructive/5">
                    <DialogTitle className="text-2xl font-black tracking-tight text-destructive">Final Verification</DialogTitle>
                    <DialogDescription className="font-medium text-sm pt-2 leading-relaxed">
                      To protect your professional data, please confirm your credentials one last time.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-8 space-y-6">
                    {user.providerData[0]?.providerId === 'password' ? (
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Enter Your Password</Label>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="h-12 rounded-xl"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="bg-muted/30 p-6 rounded-2xl text-center border-2 border-dashed">
                        <p className="text-xs font-bold mb-4">Confirm your identity via Google.</p>
                        <Button variant="outline" className="rounded-full bg-white font-black" onClick={handleDeleteAccount} disabled={isDeleting}>
                          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Verify Google Account
                        </Button>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="p-8 pt-0 flex-col sm:flex-col gap-2">
                    {user.providerData[0]?.providerId === 'password' && (
                      <Button 
                        variant="destructive"
                        className="w-full rounded-full h-14 font-black text-lg shadow-xl" 
                        disabled={!password || isDeleting}
                        onClick={handleDeleteAccount}
                      >
                        {isDeleting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Trash2 className="mr-2 h-5 w-5" />}
                        Delete Forever
                      </Button>
                    )}
                    <Button variant="ghost" className="w-full text-xs font-bold" onClick={() => setDeleteStep(3)} disabled={isDeleting}>
                      Back to Feedback
                    </Button>
                  </DialogFooter>
                </>
              )}

              {deleteStep === 5 && (
                <div className="p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Heart className="h-10 w-10 text-primary fill-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tight text-primary">We hear you.</h2>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed px-4">
                      We'll try to fix the issues you mentioned. Please, if you find free time, come back to our app. We keep on updating so you have a good experience in our app.
                    </p>
                  </div>
                  <div className="pt-4 space-y-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/30 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Clearing your professional footprint...</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card className="border-none shadow-sm rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-lg">Legal & Compliance</CardTitle>
          <CardDescription>Review our policies and data protection.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="privacy">
              <AccordionTrigger className="text-sm font-bold"><Shield className="h-4 w-4 mr-2 text-primary" /> Privacy Policy</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-4 pt-2 px-2">
                <p>We use your data to verify jobs and build your reputation. We help cover storage and AI costs through optional Pro subscriptions.</p>
                <Link href="/privacy" className="text-primary font-bold flex items-center gap-1">Read Full Privacy Policy <ExternalLink className="h-3 w-3" /></Link>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="terms">
              <AccordionTrigger className="text-sm font-bold"><FileText className="h-4 w-4 mr-2 text-primary" /> Terms of Service</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-4 pt-2 px-2">
                <p>By using Globlync, you agree to log only genuine work. Subscriptions help sustain high-speed infrastructure for the professional labor market.</p>
                <Link href="/terms" className="text-primary font-bold flex items-center gap-1">Read Full Terms <ExternalLink className="h-3 w-3" /></Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <footer className="text-center py-6">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Globlync Global v1.5.0 • Est. 2026</p>
        <p className="text-[10px] text-muted-foreground mt-1">© 2026 Petediano Tech • Built with Trust</p>
      </footer>
    </div>
  );
}
