
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Briefcase, 
  Sparkles, 
  Loader2, 
  QrCode, 
  ExternalLink,
  Settings,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { generateProfessionalBio } from "@/ai/flows/generate-bio-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const MALAWI_DISTRICTS = [
  // Northern Region
  "Chitipa", "Karonga", "Likoma", "Mzimba", "Nkhata Bay", "Rumphi", "Mzuzu City",
  // Central Region
  "Dedza", "Dowa", "Kasungu", "Lilongwe District", "Lilongwe City", "Mchinji", "Nkhotakota", "Ntcheu", "Ntchisi", "Salima",
  // Southern Region
  "Balaka", "Blantyre District", "Blantyre City", "Chikwawa", "Chiradzulu", "Machinga", "Mangochi", "Mulanje", "Mwanza", "Neno", "Nsanje", "Phalombe", "Thyolo", "Zomba District", "Zomba City"
];

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);

  const [username, setUsername] = useState("");
  const [trade, setTrade] = useState("");
  const [bio, setBio] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [isAreasOpen, setIsAreasOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setTrade(profile.tradeSkill || "");
      setBio(profile.bio || "");
      setIsAvailable(profile.isAvailable ?? true);
      setServiceAreas(profile.serviceAreas || []);
    }
  }, [profile]);

  const checkUsername = async (val: string) => {
    if (!db || !val || val.length < 3 || val === profile?.username) {
      setUsernameStatus("idle");
      return;
    }
    
    setUsernameStatus("checking");
    const nameRef = doc(db, "usernames", val.toLowerCase());
    const snap = await getDoc(nameRef);
    
    if (snap.exists()) {
      setUsernameStatus("taken");
    } else {
      setUsernameStatus("available");
    }
  };

  const toggleArea = (area: string) => {
    setServiceAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerRef || !db || !user) return;

    if (username !== profile?.username) {
      const nameRef = doc(db, "usernames", username.toLowerCase());
      const snap = await getDoc(nameRef);
      if (snap.exists() && snap.data().uid !== user.uid) {
        toast({ variant: "destructive", title: "Username Taken", description: "Please pick another username." });
        return;
      }
      await setDoc(nameRef, { uid: user.uid });
      if (profile?.username) {
        await deleteDoc(doc(db, "usernames", profile.username.toLowerCase()));
      }
    }

    const data = {
      name: user.displayName || "Worker",
      username: username.toLowerCase(),
      tradeSkill: trade,
      bio: bio,
      isAvailable,
      serviceAreas,
      updatedAt: serverTimestamp(),
    };

    updateDocumentNonBlocking(workerRef, data);

    toast({
      title: "Profile Updated",
      description: "Your professional status is now synchronized.",
    });
  };

  const handleGenerateBio = async () => {
    if (!trade) {
      toast({ variant: "destructive", title: "Trade Required", description: "Enter your trade first." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateProfessionalBio({ trade });
      setBio(result.bio);
      toast({ title: "Bio Improved", description: "AI has polished your professional story." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not refine bio." });
    } finally {
      setIsGenerating(false);
    }
  };

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/public/${user?.uid}` : "";

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Profile</h1>
          <p className="text-muted-foreground text-sm">Control your professional identity and availability.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-full hidden sm:flex">
            <Link href={`/public/${user?.uid}`}>
              <ExternalLink className="mr-2 h-4 w-4" /> View Public
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm text-center pt-6 overflow-hidden">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-xl">
                  <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button 
                  id="profile-camera-btn"
                  size="icon" 
                  variant="secondary" 
                  className="absolute bottom-0 right-0 rounded-full shadow-md border border-border"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.displayName || "Skilled Pro"}</h2>
                <Badge variant={isAvailable ? "default" : "secondary"} className="mt-1">
                  {isAvailable ? "Available for Hire" : "Busy"}
                </Badge>
              </div>
            </CardContent>
            <div className="bg-muted/30 p-4 border-t flex items-center justify-between">
              <Label htmlFor="availability-toggle" className="text-xs font-bold uppercase">Toggle Status</Label>
              <Switch id="availability-toggle" checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </Card>

          <Card className="border-none shadow-md bg-primary text-primary-foreground">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-center gap-2">
                <QrCode className="h-4 w-4" />
                Public QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-6 text-center">
              <div className="bg-white p-4 rounded-xl shadow-inner">
                {publicUrl && <QRCodeSVG value={publicUrl} size={160} fgColor="hsl(var(--primary))" />}
              </div>
              <p className="text-[10px] opacity-70">Clients scan this to verify your reputation on-site.</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="grid gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Professional Details</CardTitle>
                <CardDescription>Keep your skills and locations updated for clients.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Public Username</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="username" 
                      placeholder="e.g. john_plumber"
                      value={username} 
                      onChange={(e) => {
                        setUsername(e.target.value);
                        checkUsername(e.target.value);
                      }}
                      className={cn(
                        "pl-10 h-12",
                        usernameStatus === "available" && "border-green-500",
                        usernameStatus === "taken" && "border-destructive"
                      )} 
                    />
                    <div className="absolute right-3 top-3.5">
                      {usernameStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {usernameStatus === "available" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {usernameStatus === "taken" && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="trade">Main Trade / Occupation</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="trade" 
                      placeholder="e.g. Master Electrician"
                      value={trade} 
                      onChange={(e) => setTrade(e.target.value)}
                      className="pl-10 h-12" 
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Professional Summary</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleGenerateBio} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      AI Polish
                    </Button>
                  </div>
                  <Textarea 
                    id="bio" 
                    placeholder="Describe your years of experience and top services..."
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[100px]" 
                  />
                </div>

                <div className="grid gap-2">
                  <Collapsible open={isAreasOpen} onOpenChange={setIsAreasOpen} className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Service Areas ({serviceAreas.length} selected)
                      </Label>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          <ChevronDown className={cn("h-4 w-4 transition-transform", isAreasOpen && "rotate-180")} />
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {serviceAreas.slice(0, 5).map(area => (
                        <Badge key={area} variant="secondary" className="text-[8px]">{area}</Badge>
                      ))}
                      {serviceAreas.length > 5 && <Badge variant="outline" className="text-[8px]">+{serviceAreas.length - 5} more</Badge>}
                    </div>
                    <CollapsibleContent className="space-y-2 animate-in fade-in slide-in-from-top-1">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-muted/20 rounded-xl border max-h-[300px] overflow-y-auto">
                        {MALAWI_DISTRICTS.map(district => (
                          <button
                            key={district}
                            type="button"
                            onClick={() => toggleArea(district)}
                            className={cn(
                              "px-3 py-2 rounded-lg text-[10px] font-bold border transition-all text-left",
                              serviceAreas.includes(district) 
                                ? "bg-primary border-primary text-primary-foreground" 
                                : "bg-background border-muted text-muted-foreground hover:border-primary/50"
                            )}
                          >
                            {district}
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10">
                <Button 
                  id="profile-save-btn"
                  type="submit" 
                  className="w-full rounded-full py-6 text-lg shadow-lg font-bold" 
                  disabled={usernameStatus === "taken"}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
