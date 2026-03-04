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
  ZapOff
} from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [darkMode, setDarkMode] = useState(false);
  const [animationsDisabled, setAnimationsDisabled] = useState(false);

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
      toast({
        title: "Signed Out",
        description: "You have been successfully logged out of Globlync.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "There was an error signing you out.",
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      variant: "destructive",
      title: "Action Restricted",
      description: "Please contact support@globlync.pro to request account deletion.",
    });
  };

  const handleDownloadData = () => {
    toast({
      title: "Data Request Received",
      description: "Your work history report will be sent to your email shortly.",
    });
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
            <Switch 
              id="dark-mode" 
              checked={darkMode} 
              onCheckedChange={toggleDarkMode} 
            />
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
            <Switch 
              id="animations" 
              checked={animationsDisabled} 
              onCheckedChange={toggleAnimations} 
            />
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
            <Button variant="ghost" size="sm" onClick={() => toast({ title: "Social auth managed by provider" })}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-bold">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Alerts for job verifications and badges</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <span className="text-xs font-bold text-primary">ENABLED</span>
            </Button>
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
          <CardDescription>Review our terms of service and how we protect your data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="privacy">
              <AccordionTrigger className="text-sm font-bold">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Privacy Policy
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-4">
                <p><strong>1. Data Collection:</strong> We collect your professional trade, job descriptions, and photos to build your digital reputation.</p>
                <p><strong>2. Usage:</strong> Data is used to verify jobs and calculate Trust Scores.</p>
                <Button variant="link" size="sm" className="p-0 h-auto text-primary font-bold" asChild>
                  <Link href="/privacy">Read Full Privacy Policy <ExternalLink className="ml-1 h-3 w-3" /></Link>
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="terms">
              <AccordionTrigger className="text-sm font-bold">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Terms of Service
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-4">
                <p><strong>1. Conduct:</strong> You agree to log only genuine work. Fraudulent logs will result in account suspension.</p>
                <Button variant="link" size="sm" className="p-0 h-auto text-primary font-bold" asChild>
                  <Link href="/terms">Read Full Terms of Service <ExternalLink className="ml-1 h-3 w-3" /></Link>
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Data & Deletion Section */}
      <Card className="border-none shadow-sm border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          <CardDescription>Sensitive account actions and data exports.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">Export My Data</p>
              <p className="text-xs text-muted-foreground">Get a CSV of all your verified jobs and ratings.</p>
            </div>
            <Button variant="outline" size="sm" className="font-bold" onClick={handleDownloadData}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-destructive">Delete My Account</p>
              <p className="text-xs text-muted-foreground">Permanently remove your reputation and data.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="font-bold">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    professional reputation, all verified job logs, and earned badges.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground font-bold">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <footer className="text-center py-6">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Globlync Professional v1.2.0 • Est. 2026</p>
        <p className="text-[10px] text-muted-foreground mt-1">© 2026 Petediano Tech • Built with Trust</p>
      </footer>
    </div>
  );
}
