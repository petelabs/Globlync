
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { 
  Camera, 
  Briefcase, 
  Sparkles, 
  Loader2, 
  QrCode, 
  Settings,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Crown,
  TrendingUp,
  Star
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { generateProfessionalBio } from "@/ai/flows/generate-bio-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);

  const [username, setUsername] = useState("");
  const [trade, setTrade] = useState("");
  const [bio, setBio] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && user?.uid) {
      setProfileUrl(`${window.location.origin}/public/${user.uid}`);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setTrade(profile.tradeSkill || "");
      setBio(profile.bio || "");
      setIsAvailable(profile.isAvailable ?? true);
      setWhatsapp(profile.whatsappNumber || "");
      setPhone(profile.phoneNumber || "");
      setContactEmail(profile.contactEmail || user?.email || "");
      setServiceAreas(profile.serviceAreas || []);
    }
  }, [profile, user?.email]);

  const isPro = useMemo(() => {
    if (!profile) return false;
    const hasPaidVIP = profile.activeBenefits?.some((b: any) => b.expiresAt && new Date(b.expiresAt) > new Date());
    const hasReferralVIP = (profile.referralCount || 0) >= 10;
    return hasPaidVIP || hasReferralVIP || profile.isPro;
  }, [profile]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePic(reader.result as string);
        toast({ title: "Photo Ready", description: "Save profile to apply." });
      };
      reader.readAsDataURL(file);
    }
  };

  const checkUsername = async (val: string) => {
    if (!db || !val || val.length < 3 || val === profile?.username) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const nameRef = doc(db, "usernames", val.toLowerCase());
    const snap = await getDoc(nameRef);
    if (snap.exists() && snap.data().uid !== user?.uid) {
      setUsernameStatus("taken");
    } else {
      setUsernameStatus("available");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerRef || !db || !user) return;

    setIsSaving(true);
    const data: any = {
      tradeSkill: trade,
      bio: bio,
      isAvailable,
      whatsappNumber: whatsapp,
      phoneNumber: phone,
      contactEmail: contactEmail,
      serviceAreas,
      updatedAt: serverTimestamp(),
    };

    try {
      if (username.toLowerCase() !== profile?.username?.toLowerCase()) {
        const nameRef = doc(db, "usernames", username.toLowerCase());
        const snap = await getDoc(nameRef);
        if (snap.exists() && snap.data().uid !== user.uid) {
          toast({ variant: "destructive", title: "Username Taken" });
          setIsSaving(false);
          return;
        }
        await setDoc(nameRef, { uid: user.uid });
        if (profile?.username) {
          await deleteDoc(doc(db, "usernames", profile.username.toLowerCase()));
        }
        data.username = username.toLowerCase();
      }
      if (newProfilePic) data.profilePictureUrl = newProfilePic;
      updateDocumentNonBlocking(workerRef, data);
      toast({ title: "Profile Saved" });
      setNewProfilePic(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save Failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateBio = async () => {
    if (!trade) {
      toast({ variant: "destructive", title: "Trade Required" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateProfessionalBio({ trade });
      setBio(result.bio);
      if (workerRef) updateDocumentNonBlocking(workerRef, { lastBioPolishAt: new Date().toISOString() });
      toast({ title: "Bio Refined" });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user || isProfileLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Hub...</p>
    </div>
  );

  const displayPhoto = newProfilePic || profile?.profilePictureUrl || user?.photoURL || "";

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto px-2 pb-32 overflow-visible">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            My Hub
            {isPro && <Crown className="h-5 w-5 text-secondary fill-secondary" />}
          </h1>
          <p className="text-muted-foreground text-sm">Manage your networking identity and global ID.</p>
        </div>
        <div className="flex gap-2">
          {!isPro && (
            <Button variant="secondary" size="sm" asChild className="rounded-full font-black animate-pulse shadow-md">
              <Link href="/pricing">Upgrade to VIP</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link href="/settings"><Settings className="h-4 w-4" /></Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><TrendingUp className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Trust Score</p>
              <p className="text-xl font-black">{profile?.trustScore || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Star className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Rewards</p>
              <p className="text-xl font-black">{profile?.rewardCredits || 0} Cr</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl hidden md:block">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Briefcase className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Network</p>
              <p className="text-xl font-black">Global</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm text-center pt-6 overflow-hidden">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-32 w-32 border-4 border-primary shadow-xl group-hover:opacity-80 transition-opacity">
                  <AvatarImage src={displayPhoto} className="object-cover" />
                  <AvatarFallback className="text-2xl font-black">{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-md border border-border"><Camera className="h-4 w-4" /></Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile?.name || "Skilled Pro"}</h2>
                <Badge variant={isAvailable ? "default" : "secondary"} className="mt-1 font-black">
                  {isAvailable ? "Available for Hire" : "Currently Busy"}
                </Badge>
              </div>
            </CardContent>
            <div className="bg-muted/30 p-4 border-t flex items-center justify-between">
              <Label htmlFor="availability-toggle" className="text-xs font-bold uppercase tracking-widest">Global Visibility</Label>
              <Switch id="availability-toggle" checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] bg-primary text-primary-foreground overflow-hidden relative group">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><QrCode className="h-4 w-4" /> Professional ID</CardTitle></CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="bg-white p-4 rounded-3xl flex justify-center shadow-inner">
                {profileUrl ? <QRCodeSVG value={profileUrl} size={140} level="H" includeMargin={false} className="rounded-sm" /> : <div className="h-[140px] w-[140px] bg-muted animate-pulse rounded-xl" />}
              </div>
              <div className="bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-80 mb-1">Instant Trust Handle</p>
                <p className="text-lg font-black tracking-tight text-white leading-none break-all">@{username || "..."}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="grid gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Professional Identity</CardTitle>
                <CardDescription>Your unique ID is used for secure connections and identification.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Professional ID / Username</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="username" placeholder="e.g. john_pro" value={username} onChange={(e) => { setUsername(e.target.value); checkUsername(e.target.value); }} className={cn("pl-10 h-12 rounded-xl", usernameStatus === "available" && "border-green-500", usernameStatus === "taken" && "border-destructive")} />
                    <div className="absolute right-3 top-3.5">{usernameStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}{usernameStatus === "available" && <CheckCircle2 className="h-4 w-4 text-green-500" />}{usernameStatus === "taken" && <AlertCircle className="h-4 w-4 text-destructive" />}</div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="trade">Main Professional Skill</Label>
                  <div className="relative"><Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="trade" placeholder="e.g. Senior React Developer" value={trade} onChange={(e) => setTrade(e.target.value)} className="pl-10 h-12 rounded-xl" /></div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Professional Story</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleGenerateBio} disabled={isGenerating} className="font-bold h-8 text-primary"><Sparkles className="h-3 w-3 mr-1" /> AI Polish</Button>
                  </div>
                  <Textarea id="bio" placeholder="Describe your expertise..." value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px] rounded-xl" />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t">
                <Button type="submit" disabled={isSaving || usernameStatus === "taken"} className="w-full rounded-full py-6 text-lg shadow-lg font-black">{isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}Update Profile</Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
