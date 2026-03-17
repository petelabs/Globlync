
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
  Lock as LockIcon, 
  Moon, 
  Sun, 
  Zap, 
  ZapOff, 
  Crown, 
  CreditCard, 
  Mail, 
  Loader2, 
  ShieldAlert, 
  Building2, 
  MapPin, 
  Globe, 
  Briefcase, 
  Search, 
  Info, 
  AlertTriangle, 
  Heart,
  ExternalLink
} from "lucide-react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
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
import { Logo } from "@/components/Navigation";

const DELETION_REASONS = [
  "Not finding enough networking value",
  "Too difficult to use",
  "I have privacy concerns",
  "Receiving too many notifications",
  "Found another platform I prefer",
  "Just testing the app",
  "Technical bugs and errors",
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
  const [deleteStep, setDeleteStep] = useState(1);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherDescription, setOtherDescription] = useState("");
  const [password, setPassword] = useState("");
  const [confirmDeleteWord, setConfirmDeleteWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);

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

  const scrubFirestoreData = async () => {
    if (!user || !db) return;
    const profileRef = doc(db, "workerProfiles", user.uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      if (data.username) {
        await deleteDoc(doc(db, "usernames", data.username.toLowerCase())).catch(() => {});
      }
      if (data.referralCode) {
        await deleteDoc(doc(db, "referralCodes", data.referralCode.toUpperCase())).catch(() => {});
      }
    }
    await deleteDoc(profileRef);
  };

  const handleDeleteAccount = async (useFallback: boolean = false) => {
    if (!user || !db) return;
    
    if (confirmDeleteWord.toLowerCase() !== "delete") {
      toast({ variant: "destructive", title: "Verification Failed", description: "Please type the word DELETE correctly." });
      return;
    }

    setIsDeleting(true);
    setDeletionError(null);

    try {
      if (!useFallback) {
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
      }

      fetch('/api/account-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid,
          reasons: selectedReasons,
          description: otherDescription
        })
      }).catch(() => {});

      await scrubFirestoreData();

      if (!useFallback) {
        await deleteUser(user);
      } else {
        await signOut(auth);
      }

      setDeleteStep(5);
      setTimeout(() => {
        setIsDeleteDialogOpen(false);
        router.push("/");
      }, 8000); 

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login' || error.code === 'auth/wrong-password') {
        setDeletionError("Security session expired or incorrect details. Use the 'Scrub My Data' option below to exit instantly.");
      } else {
        setDeletionError("Something went wrong with Auth. You can still use the 'Scrub My Data' option to remove your professional presence.");
      }
      toast({ variant: "destructive", title: "Auth Failed", description: "Check details or use fallback." });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto px-2 pb-24">
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

      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Platform & Legal
          </CardTitle>
          <CardDescription>Official headquarters and professional links.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="platform" className="border-none px-6">
              <AccordionTrigger className="text-sm font-bold py-4 hover:no-underline">
                <Briefcase className="h-4 w-4 mr-2 text-primary" /> Platform Links
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <nav className="grid gap-3">
                  <Link href="/about" className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/5 transition-colors">
                    <span className="text-xs font-bold">Our Founding Story</span>
                    <Heart className="h-3.5 w-3.5 opacity-40 fill-primary/20" />
                  </Link>
                  <Link href="/search" className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/5 transition-colors">
                    <span className="text-xs font-bold">Find Professionals</span>
                    <Search className="h-3.5 w-3.5 opacity-40" />
                  </Link>
                  <Link href="/jobs" className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/5 transition-colors">
                    <span className="text-xs font-bold">Global Jobs</span>
                    <Briefcase className="h-3.5 w-3.5 opacity-40" />
                  </Link>
                </nav>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="legal" className="border-none px-6 border-t">
              <AccordionTrigger className="text-sm font-bold py-4 hover:no-underline">
                <Shield className="h-4 w-4 mr-2 text-primary" /> Legal & Support
              </AccordionTrigger>
              <AccordionContent className="pb-6 space-y-4">
                <div className="grid gap-2">
                  <Link href="/contact" className="flex items-center gap-3 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-3.5 w-3.5" /> Contact Support
                  </Link>
                  <Link href="/privacy" className="flex items-center gap-3 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="h-3.5 w-3.5" /> Privacy Policy
                  </Link>
                  <Link href="/terms" className="flex items-center gap-3 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="h-3.5 w-3.5" /> Terms of Service
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="hq" className="border-none px-6 border-t">
              <AccordionTrigger className="text-sm font-bold py-4 hover:no-underline">
                <Building2 className="h-4 w-4 mr-2 text-primary" /> About Globlync
              </AccordionTrigger>
              <AccordionContent className="pb-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary shrink-0"><Logo className="scale-75" /></div>
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-tight">Globlync Global</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Building a verifiable labor market for every professional everywhere.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 pt-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Global HQ (Roots)</p>
                        <p className="text-[11px] font-medium text-muted-foreground">Petediano Tech • Dzenje Village<br/>Mulanje, Malawi</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5 fill-primary/10" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Founder & Developer</p>
                        <a href="https://peterdamiano.vercel.app" target="_blank" className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                          Peter Damiano <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
              <LockIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Password & Auth</p>
                <p className="text-xs text-muted-foreground">Managed via {user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}</p>
              </div>
            </div>
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
              setConfirmDeleteWord("");
              setDeletionError(null);
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
                    <DialogTitle className="text-2xl font-black tracking-tight">Are you sure?</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed">
                      We're sad to see you go. Are you sure you want to start the account deletion process?
                    </DialogDescription>
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
                    <DialogTitle className="text-xl font-black tracking-tight">Understand the Impact</DialogTitle>
                  </div>
                  <DialogDescription className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <p>Deleting your account will <span className="text-destructive font-black">permanently remove</span> your profile, posts, networking history, and all professional evidence from our database.</p>
                    <p className="bg-muted/50 p-4 rounded-xl border-l-4 border-primary font-medium text-xs">
                      Note: You can still create another account using the same email at a later time if you change your mind.
                    </p>
                  </DialogDescription>
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
                      Continue to Final Gate
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
                    <DialogTitle className="text-2xl font-black tracking-tight text-destructive">Identity Verification</DialogTitle>
                    <DialogDescription className="font-medium text-sm pt-2 leading-relaxed">
                      Choose your method to confirm deletion.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-8 space-y-6">
                    {deletionError && (
                      <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20 text-destructive text-[10px] font-bold leading-tight">
                        {deletionError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Option 1: Re-authenticate & Full Delete</p>
                      {user.providerData[0]?.providerId === 'password' ? (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Enter Password</Label>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-12 rounded-xl bg-muted/10 border-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <Button 
                            variant="destructive"
                            className="w-full h-14 rounded-full font-black text-sm shadow-xl" 
                            disabled={!password || isDeleting}
                            onClick={() => handleDeleteAccount(false)}
                          >
                            Delete Auth & Data
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full h-14 rounded-xl border-2 font-bold" 
                          onClick={() => handleDeleteAccount(false)}
                          disabled={isDeleting}
                        >
                          <Globe className="mr-2 h-4 w-4" /> Delete via Google Confirmation
                        </Button>
                      )}
                    </div>

                    <div className="relative flex items-center justify-center py-2">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
                      <span className="relative bg-white px-4 text-[8px] font-black uppercase text-muted-foreground tracking-widest">Or fallback method</span>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Option 2: Scrub My Data Only (Zero Auth)</p>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-destructive">Type "DELETE" to permanently wipe your profile</Label>
                        <Input 
                          placeholder="Type DELETE" 
                          className="h-14 rounded-xl border-2 border-destructive/20 focus:border-destructive text-center font-black uppercase"
                          value={confirmDeleteWord}
                          onChange={(e) => setConfirmDeleteWord(e.target.value)}
                        />
                        <Button 
                          variant="ghost"
                          className="w-full h-14 rounded-full font-black uppercase text-xs text-destructive bg-destructive/5 hover:bg-destructive/10" 
                          disabled={confirmDeleteWord.toLowerCase() !== 'delete' || isDeleting}
                          onClick={() => handleDeleteAccount(true)}
                        >
                          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Permanently Wipe My Profile Now
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="p-8 pt-0 flex-col sm:flex-col gap-2">
                    <Button variant="ghost" className="w-full text-xs font-bold" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                      Cancel Deletion
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
                    <DialogTitle className="text-3xl font-black tracking-tight text-primary">We hear you.</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed px-4">
                      Your professional footprint has been scrubbed from Globlync. We'll try to fix the issues you mentioned. Please come back whenever you're ready to grow again.
                    </DialogDescription>
                  </div>
                  <div className="pt-4 space-y-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary/30 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Session Closing...</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <footer className="text-center py-6">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Globlync Global v1.6.0 • Est. 2026</p>
        <p className="text-[10px] text-muted-foreground mt-1">© 2026 Petediano Tech • Built with Trust</p>
      </footer>
    </div>
  );
}
