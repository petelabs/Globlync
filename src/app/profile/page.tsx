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
  Sparkles, 
  Loader2, 
  QrCode, 
  Settings,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Crown,
  TrendingUp,
  Star,
  Clock,
  Gift,
  Copy,
  Users,
  Download,
  Palette,
  Check
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { generateProfessionalBio } from "@/ai/flows/generate-bio-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, addDays, isAfter } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toPng } from 'html-to-image';

type CardTheme = "teal" | "amber" | "cosmic" | "midnight";

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [cardTheme, setCardTheme] = useState<CardTheme>("teal");
  const [isDownloading, setIsDownloading] = useState(false);

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
    }
  }, [profile, user?.email]);

  const canChangeUsername = useMemo(() => {
    if (!profile?.lastUsernameChangeAt) return true;
    const lastChange = profile.lastUsernameChangeAt.toDate ? profile.lastUsernameChangeAt.toDate() : new Date(profile.lastUsernameChangeAt);
    const cooldownEnd = addDays(lastChange, 14); // 14-day integrity cooldown
    return isAfter(new Date(), cooldownEnd);
  }, [profile?.lastUsernameChangeAt]);

  const cooldownDate = useMemo(() => {
    if (!profile?.lastUsernameChangeAt) return null;
    const lastChange = profile.lastUsernameChangeAt.toDate ? profile.lastUsernameChangeAt.toDate() : new Date(profile.lastUsernameChangeAt);
    return addDays(lastChange, 14);
  }, [profile?.lastUsernameChangeAt]);

  const isPro = useMemo(() => {
    if (!profile) return false;
    const hasPaidVIP = profile.activeBenefits?.some((b: any) => b.expiresAt && new Date(b.expiresAt) > new Date());
    return hasPaidVIP || profile.isPro;
  }, [profile]);

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
      updatedAt: serverTimestamp(),
    };

    try {
      if (username.toLowerCase() !== profile?.username?.toLowerCase()) {
        if (!canChangeUsername) {
          toast({ variant: "destructive", title: "Integrity Locked", description: "Username changes allowed once every 14 days." });
          setIsSaving(false);
          return;
        }
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
        data.lastUsernameChangeAt = serverTimestamp();
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
      toast({ title: "Bio Refined" });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/login?ref=${profile?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Invite Link Copied" });
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(profile?.referralCode || "");
    toast({ title: "Code Copied" });
  };

  const downloadIDCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1 });
      const link = document.createElement('a');
      link.download = `globlync-id-${profile?.username || 'pro'}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "ID Card Saved!", description: "Share your professional status with the world." });
    } catch (err) {
      toast({ variant: "destructive", title: "Download Failed", description: "Could not generate ID card image." });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!user || isProfileLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Hub...</p>
    </div>
  );

  const themeConfig = {
    teal: "bg-primary text-white",
    amber: "bg-[#FFC107] text-[#0f172a]",
    cosmic: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white",
    midnight: "bg-[#0f172a] text-emerald-400 border-2 border-emerald-500/20",
  };

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto px-2 pb-32">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">My Hub {isPro && <Crown className="h-5 w-5 text-secondary fill-secondary" />}</h1>
          <p className="text-muted-foreground text-sm">Manage your networking identity and national ID.</p>
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-full"><Link href="/settings"><Settings className="h-4 w-4" /></Link></Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><TrendingUp className="h-4 w-4" /></div>
            <div><p className="text-[10px] font-black uppercase text-muted-foreground">Trust Score</p><p className="text-xl font-black">{profile?.trustScore || 0}</p></div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Star className="h-4 w-4" /></div>
            <div><p className="text-[10px] font-black uppercase text-muted-foreground">Verified</p><p className="text-xl font-black">{profile?.referralCount || 0}</p></div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-secondary/10 p-4 rounded-3xl col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl text-secondary"><Users className="h-4 w-4" /></div>
            <div><p className="text-[10px] font-black uppercase text-muted-foreground">Invites</p><p className="text-xl font-black">{profile?.referralCount || 0}</p></div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm text-center pt-6 overflow-hidden">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" id="profile-camera-btn" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-32 w-32 border-4 border-primary shadow-xl">
                  <AvatarImage src={newProfilePic || profile?.profilePictureUrl || ""} className="object-cover" />
                  <AvatarFallback className="text-2xl font-black">{profile?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-md"><Camera className="h-4 w-4" /></Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setNewProfilePic(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile?.name}</h2>
                <Badge variant={isAvailable ? "default" : "secondary"} className="mt-1 font-black">{isAvailable ? "Available for Hire" : "Currently Busy"}</Badge>
              </div>
            </CardContent>
            <div className="bg-muted/30 p-4 border-t flex items-center justify-between">
              <Label htmlFor="availability-toggle" className="text-xs font-bold uppercase">Visibility</Label>
              <Switch id="availability-toggle" checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </Card>

          {/* CUSTOMIZABLE QR ID CARD DIALOG */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full rounded-3xl h-24 text-lg font-black shadow-xl bg-primary text-white border-4 border-white/20 hover:scale-[1.02] transition-transform">
                <QrCode className="mr-3 h-8 w-8" /> Customize My Digital ID
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
              <DialogHeader className="p-8 bg-muted/30">
                <DialogTitle className="text-2xl font-black tracking-tighter">Share Your Reputation</DialogTitle>
                <DialogDescription className="font-medium text-sm pt-2">Download your professional card to share on social media.</DialogDescription>
              </DialogHeader>
              
              <div className="p-8 space-y-8">
                {/* THE CARD PREVIEW */}
                <div 
                  ref={cardRef}
                  className={cn(
                    "relative aspect-[4/5] rounded-[2.5rem] p-8 flex flex-col items-center justify-between shadow-2xl overflow-hidden",
                    themeConfig[cardTheme]
                  )}
                >
                  {/* Watermark Logo */}
                  <div className="absolute top-8 left-8 opacity-40 flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest uppercase">Globlync Pro</span>
                  </div>

                  <div className="flex flex-col items-center mt-10 gap-4 text-center">
                    <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl">
                      <AvatarImage src={profile?.profilePictureUrl || ""} className="object-cover" />
                      <AvatarFallback className="font-black text-xl">{profile?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{profile?.name}</h3>
                      <p className={cn(
                        "text-xs font-bold uppercase tracking-[0.2em] opacity-80",
                        cardTheme === "midnight" ? "text-emerald-400" : ""
                      )}>
                        @{profile?.username}
                      </p>
                    </div>
                  </div>

                  {/* QR CODE CONTAINER */}
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border-4 border-black/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                    {profileUrl ? (
                      <QRCodeSVG 
                        value={profileUrl} 
                        size={160} 
                        level="H" 
                        includeMargin={false}
                        fgColor={cardTheme === "midnight" ? "#0f172a" : "#000000"}
                      />
                    ) : <div className="h-[160px] w-[160px] animate-pulse bg-muted rounded-xl" />}
                  </div>

                  <div className="w-full text-center space-y-2 mb-4">
                    <div className="inline-flex items-center gap-2 bg-black/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{profile?.trustScore} Verified Trust Score</span>
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Build Your Reputation • Malawi Global Network</p>
                  </div>
                </div>

                {/* THEME SELECTOR */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Card Theme</span>
                  </div>
                  <div className="flex gap-3">
                    {(Object.keys(themeConfig) as CardTheme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setCardTheme(t)}
                        className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border-2",
                          cardTheme === t ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100",
                          themeConfig[t]
                        )}
                      >
                        {cardTheme === t && <Check className="h-5 w-5" />}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full h-16 rounded-full font-black text-lg shadow-xl"
                  onClick={downloadIDCard}
                  disabled={isDownloading}
                >
                  {isDownloading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Download className="mr-2 h-5 w-5" />}
                  Download Pro ID Card
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card className="border-none shadow-lg bg-secondary/10 p-6 rounded-[2.5rem] border-2 border-secondary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-secondary" />
                <h3 className="font-black text-sm uppercase tracking-tight">Invite & Earn</h3>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-8 text-[9px] font-black uppercase tracking-widest"><Link href="/referrals">Roadmap</Link></Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-white px-3 py-2.5 rounded-xl border-2 border-secondary/20 flex-1 text-center font-black text-primary uppercase tracking-tighter">
                  {profile?.referralCode || "LOADING..."}
                </code>
                <Button size="icon" variant="secondary" className="h-11 w-11 shrink-0 rounded-xl shadow-sm" onClick={copyReferralCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="secondary" className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] shadow-md" onClick={copyInviteLink}>
                Copy Professional Invite Link
              </Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="grid gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Professional Identity</CardTitle>
                <CardDescription>Manage your unique handle and skill set.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="username">Professional ID / Username</Label>
                    {!canChangeUsername && cooldownDate && (
                      <span className="text-[9px] font-black uppercase text-destructive flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Change available in {formatDistanceToNow(cooldownDate)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input 
                      id="username" 
                      placeholder="e.g. john_pro" 
                      value={username} 
                      onChange={(e) => { setUsername(e.target.value); checkUsername(e.target.value); }} 
                      disabled={!canChangeUsername}
                      className={cn(
                        "flex h-12 w-full rounded-xl border-2 bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        !canChangeUsername && "opacity-50 cursor-not-allowed"
                      )}
                    />
                    <div className="absolute right-3 top-3.5">
                      {usernameStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin" />}
                      {usernameStatus === "available" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {usernameStatus === "taken" && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="trade">Main Professional Skill</Label>
                  <Input id="trade" placeholder="e.g. Electrician" value={trade} onChange={(e) => setTrade(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Professional Story</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleGenerateBio} disabled={isGenerating} className="text-primary font-bold h-8"><Sparkles className="h-3 w-3 mr-1" /> AI Polish</Button>
                  </div>
                  <Textarea id="bio" placeholder="Describe your expertise..." value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px] rounded-xl" />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t">
                <Button type="submit" id="profile-save-btn" disabled={isSaving || usernameStatus === "taken"} className="w-full rounded-full py-6 text-lg font-black shadow-lg">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}Update Profile
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}