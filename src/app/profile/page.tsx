
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Camera, 
  Briefcase, 
  Mail, 
  Sparkles, 
  Loader2, 
  QrCode, 
  ExternalLink,
  Settings,
  User as UserIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { generateProfessionalBio } from "@/ai/flows/generate-bio-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setTrade(profile.tradeSkill || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const checkUsername = async (val: string) => {
    if (!db || !val || val.length < 3 || val === profile?.username) {
      setUsernameStatus("idle");
      setSuggestions([]);
      return;
    }
    
    setUsernameStatus("checking");
    const nameRef = doc(db, "usernames", val.toLowerCase());
    const snap = await getDoc(nameRef);
    
    if (snap.exists()) {
      setUsernameStatus("taken");
      // Generate suggestions
      const sugs = [
        `${val}${Math.floor(Math.random() * 999)}`,
        `${val}_pro`,
        `${val}_mw`
      ];
      setSuggestions(sugs);
    } else {
      setUsernameStatus("available");
      setSuggestions([]);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerRef || !db || !user) return;

    // Final check for username if it changed
    if (username !== profile?.username) {
      const nameRef = doc(db, "usernames", username.toLowerCase());
      const snap = await getDoc(nameRef);
      if (snap.exists() && snap.data().uid !== user.uid) {
        toast({ variant: "destructive", title: "Username Taken", description: "Please pick another username." });
        return;
      }

      // Claim new username
      await setDoc(nameRef, { uid: user.uid });
      // Release old username if exists
      if (profile?.username) {
        await deleteDoc(doc(db, "usernames", profile.username.toLowerCase()));
      }
    }

    const data = {
      name: user.displayName || "Worker",
      username: username.toLowerCase(),
      tradeSkill: trade,
      bio: bio,
      updatedAt: serverTimestamp(),
    };

    if (profile) {
      updateDocumentNonBlocking(workerRef, data);
    } else {
      setDocumentNonBlocking(workerRef, {
        ...data,
        id: user.uid,
        externalAuthId: user.uid,
        trustScore: 0,
        createdAt: serverTimestamp(),
        profilePictureUrl: user.photoURL || "",
        badgeIds: [],
      }, { merge: true });
    }

    toast({
      title: "Profile Updated",
      description: "Your Globlync identity is now live.",
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

  const publicUrl = user ? `${window.location.origin}/public/${user.uid}` : "";

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your Globlync professional presence.</p>
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-full">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Link>
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm text-center pt-6">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-xl">
                  <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-md border border-border">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.displayName || "Skilled Pro"}</h2>
                <p className="text-xs text-primary font-bold">@{username || "username"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-primary text-primary-foreground">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-center gap-2">
                <QrCode className="h-4 w-4" />
                Public QR
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-6">
              <div className="bg-white p-4 rounded-xl shadow-inner">
                {publicUrl && <QRCodeSVG value={publicUrl} size={160} fgColor="hsl(var(--primary))" />}
              </div>
              <Button variant="secondary" size="sm" className="w-full rounded-full text-xs" onClick={() => window.open(publicUrl, '_blank')}>
                <ExternalLink className="mr-1 h-3 w-3" /> Preview Public Page
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="grid gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Identity & Trade</CardTitle>
                <CardDescription>Pick a unique username and describe your skills.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
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
                  {usernameStatus === "taken" && (
                    <div className="mt-2 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <p className="text-xs font-bold text-destructive mb-2">Username is taken. Try these:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map(s => (
                          <button key={s} type="button" onClick={() => { setUsername(s); checkUsername(s); }} className="text-[10px] bg-white border px-2 py-1 rounded-full hover:bg-muted">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="trade">Trade / Occupation</Label>
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
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleGenerateBio} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      AI Improve
                    </Button>
                  </div>
                  <Textarea 
                    id="bio" 
                    placeholder="Describe your years of experience and specialties..."
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[120px]" 
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10">
                <Button type="submit" className="w-full rounded-full py-6 text-lg shadow-lg" disabled={usernameStatus === "taken"}>
                  Save Profile
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
