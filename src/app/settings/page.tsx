"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  PlayCircle
} from "lucide-react";
import { useAuth, useUser, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { doc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [darkMode, setDarkMode] = useState(false);
  const [animationsDisabled, setAnimationsDisabled] = useState(false);

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

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

  const restartTutorial = () => {
    if (workerRef) {
      updateDocumentNonBlocking(workerRef, {
        onboardingCompleted: false,
        updatedAt: serverTimestamp()
      });
      router.push("/dashboard");
      toast({ title: "Tutorial Restarted", description: "Let's walk through the basics again!" });
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

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account, appearance, and privacy.</p>
      </header>

      {/* Subscription Section */}
      <Card className="border-none shadow-md bg-primary text-primary-foreground">
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
                <p className="text-sm font-bold">Pro Account Status</p>
                <p className="text-xs opacity-80">Check your current benefits and expiry.</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" asChild className="rounded-full">
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Help */}
      <Card className="border-none shadow-sm bg-secondary/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-secondary" />
            Getting Started
          </CardTitle>
          <CardDescription>Need a refresher on how to use Globlync?</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full rounded-full border-secondary text-secondary hover:bg-secondary hover:text-white font-bold"
            onClick={restartTutorial}
          >
            Restart Tutorial Walkthrough
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card className="border-none shadow-sm">
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

      {/* Account Section */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Account & Security</CardTitle>
          <CardDescription>Secure your profile and manage sessions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Password & Auth</p>
                <p className="text-xs text-muted-foreground">Managed via {user.providerData[0]?.providerId || "Email"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Alerts for verifications and badges</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-primary px-2">ACTIVE</span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full font-bold" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardFooter>
      </Card>

      {/* Privacy & Legal Section */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Legal & Compliance</CardTitle>
          <CardDescription>Review our policies and data protection.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="privacy">
              <AccordionTrigger className="text-sm font-bold"><Shield className="h-4 w-4 mr-2" /> Privacy Policy</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-4 pt-2">
                <p>We use your data to verify jobs and build your reputation. We help cover storage and AI costs through optional Pro subscriptions.</p>
                <Link href="/privacy" className="text-primary font-bold">Read Full Privacy Policy <ExternalLink className="inline h-3 w-3" /></Link>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="terms">
              <AccordionTrigger className="text-sm font-bold"><FileText className="h-4 w-4 mr-2" /> Terms of Service</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-4 pt-2">
                <p>By using Globlync, you agree to log only genuine work. Subscriptions help sustain high-speed infrastructure for the Malawian labor market.</p>
                <Link href="/terms" className="text-primary font-bold">Read Full Terms <ExternalLink className="inline h-3 w-3" /></Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <footer className="text-center py-6">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Globlync Professional v1.2.0 • Est. 2026</p>
        <p className="text-[10px] text-muted-foreground mt-1">© 2026 Petediano Tech • Built with Trust</p>
      </footer>
    </div>
  );
}
