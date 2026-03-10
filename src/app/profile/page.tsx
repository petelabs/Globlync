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
import { Progress } from "@/components/ui/progress";
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
  ChevronDown,
  Mail,
  Phone,
  Crown,
  Zap,
  Clock,
  TrendingUp,
  Star,
  Gift,
  Users,
  Copy,
  Share2,
  Lock as LockIcon,
  Coins,
  Timer
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { generateProfessionalBio } from "@/ai/flows/generate-bio-flow";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc, collection } from "firebase/firestore";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const MALAWI_DISTRICTS = [
  "Chitipa", "Karonga", "Likoma", "Mzimba", "Nkhata Bay", "Rumphi", "Mzuzu City",
  "Dedza", "Dowa", "Kasungu", "Lilongwe District", "Lilongwe City", "Mchinji", "Nkhotakota", "Ntcheu", "Ntchisi", "Salima",
  "Balaka", "Blantyre District", "Blantyre City", "Chikwawa", "Chiradzulu", "Machinga", "Mangochi", "Mulanje", "Mwanza", "Neno", "Nsanje", "Phalombe", "Thyolo", "Zomba District", "Zomba City"
];

const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; 

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "jobs");
  }, [db, user?.uid]);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "ratings");
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);
  const { data: allJobs } = useCollection(jobsRef);
  const { data: ratings } = useCollection(ratingsRef);

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
  const [isAreasOpen, setIsAreasOpen] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bioCooldownText, setBioCooldownText] = useState<string | null>(null);
  const [bonusTimeLeft, setBonusTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);

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
      
      if (profile.lastBioPolishAt && !profile.isPro) {
        const lastUsed = new Date(profile.lastBioPolishAt);
        const cooldownDays = 14;
        const resetDate = new Date(lastUsed.getTime() + cooldownDays * 24 * 60 * 60 * 1000);
        const now = new Date();
        
        if (now < resetDate) {
          const diffDays = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setBioCooldownText(`Reset in ${diffDays}d`);
        } else {
          setBioCooldownText(null);
        }
      }

      // Bonus Timer Logic
      const timer = setInterval(() => {
        const now = new Date();
        if (profile.createdAt) {
          const signupDate = profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt);
          const expiryDate = new Date(signupDate.getTime() + 24 * 60 * 60 * 1000);
          const diff = expiryDate.getTime() - now.getTime();

          if (diff > 0) {
            setBonusTimeLeft({
              h: Math.floor(diff / (1000 * 60 * 60)),
              m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
              s: Math.floor((diff % (1000 * 60)) / 1000)
            });
          } else {
            setBonusTimeLeft(null);
          }
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [profile, user?.email]);

  const isPro = useMemo(() => {
    if (!profile) return false;
    const hasPaidVIP = profile.activeBenefits?.some((b: any) => b.expiresAt && new Date(b.expiresAt) > new Date());
    const hasReferralVIP = (profile.referralCount || 0) >= 10;
    return hasPaidVIP || hasReferralVIP || profile.isPro;
  }, [profile]);

  const stats = useMemo(() => {
    const verifiedJobs = allJobs?.filter(j => j.isVerified) || [];
    const avgRating = ratings && ratings.length 
      ? ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length 
      : 0;
    
    return {
      totalVerified: verifiedJobs.length,
      averageRating: avgRating.toFixed(1),
      trustScore: profile?.trustScore || 0,
      profileViews: profile?.profileViews || 0,
      referralCount: profile?.referralCount || 0,
      rewardCredits: profile?.rewardCredits || 0
    };
  }, [allJobs, ratings, profile]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > IMAGE_SIZE_LIMIT) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select a photo under 5MB to ensure reliable syncing.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePic(reader.result as string);
        toast({ title: "Photo Ready", description: "Tap 'Save Professional Profile' below to apply." });
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

  const toggleArea = (area: string) => {
    setServiceAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
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
          toast({ variant: "destructive", title: "Username Taken", description: "Please pick another username." });
          setIsSaving(false);
          return;
        }
        
        await setDoc(nameRef, { uid: user.uid });
        if (profile?.username) {
          await deleteDoc(doc(db, "usernames", profile.username.toLowerCase()));
        }
        data.username = username.toLowerCase();
      }

      if (newProfilePic) {
        data.profilePictureUrl = newProfilePic;
      }

      updateDocumentNonBlocking(workerRef, data);
      
      toast({
        title: "Profile Saved",
        description: "Your professional status has been updated.",
      });
      setNewProfilePic(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save Failed", description: "Ensure photo size is small." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateBio = async () => {
    if (!trade) {
      toast({ variant: "destructive", title: "Trade Required", description: "Enter your trade first." });
      return;
    }
    
    if (bioCooldownText && !isPro) {
      toast({ 
        variant: "destructive", 
        title: "AI Tool on Cooldown", 
        description: `Free users can polish bios every 14 days. ${bioCooldownText}. Upgrade to VIP for unlimited use.` 
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProfessionalBio({ trade });
      setBio(result.bio);
      
      if (workerRef) {
        updateDocumentNonBlocking(workerRef, {
          lastBioPolishAt: new Date().toISOString()
        });
      }

      toast({ title: "Bio Refined", description: "AI has polished your professional story." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not refine bio." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyProfessionalId = () => {
    if (!username) return;
    navigator.clipboard.writeText(`@${username}`);
    toast({ title: "ID Copied", description: "Share this with others to connect." });
  };

  if (!user || isProfileLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing My Hub...</p>
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
          <p className="text-muted-foreground text-sm">Control your global visibility and private ID.</p>
        </div>
        <div className="flex gap-2">
          {!isPro && (
            <Button variant="secondary" size="sm" asChild className="rounded-full font-black animate-pulse shadow-md">
              <Link href="/pricing">Upgrade to VIP</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild className="rounded-full hidden sm:flex font-bold">
            <Link href={`/public/${user?.uid}`}>
              <ExternalLink className="mr-2 h-4 w-4" /> View Public
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><TrendingUp className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Trust Score</p>
              <p className="text-xl font-black">{stats.trustScore}</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Coins className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Rewards</p>
              <p className="text-xl font-black">{stats.rewardCredits} Cr</p>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Star className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Avg Rating</p>
              <p className="text-xl font-black">{stats.averageRating}</p>
            </div>
          </div>
        </Card>
      </div>

      {bonusTimeLeft && (
        <Card className="border-none bg-orange-500 text-white p-6 rounded-[2.5rem] shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl animate-bounce">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight leading-none">New User Bonus Active!</h3>
                <p className="text-xs font-bold opacity-80 mt-1">Upgrade now to get <b>+7 EXTRA DAYS</b> of Pro VIP access.</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="bg-black/10 px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-xl font-black">
                <Timer className="h-4 w-4" />
                {String(bonusTimeLeft.h).padStart(2, '0')}:{String(bonusTimeLeft.m).padStart(2, '0')}:{String(bonusTimeLeft.s).padStart(2, '0')}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-sm text-center pt-6 overflow-hidden">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-32 w-32 border-4 border-primary shadow-xl group-hover:opacity-80 transition-opacity">
                  <AvatarImage src={displayPhoto} className="object-cover" />
                  <AvatarFallback className="text-2xl font-black">{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <Button 
                  id="profile-camera-btn"
                  size="icon" 
                  variant="secondary" 
                  className="absolute bottom-0 right-0 rounded-full shadow-md border border-border"
                >
                  <Camera className="h-4 w-4" />
                </Button>
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
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <LockIcon className="h-20 w-20" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <QrCode className="h-4 w-4" /> My Professional ID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-xl font-black tracking-tight text-secondary leading-none break-all">@{username || "..."}</p>
                <p className="text-[10px] font-medium opacity-70 mt-2">Give this ID to others to connect securely.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1 rounded-full font-black text-[10px]" onClick={copyProfessionalId}>
                  <Copy className="mr-2 h-3 w-3" /> Copy ID
                </Button>
                <Button variant="secondary" size="sm" className="flex-1 rounded-full font-black text-[10px]">
                  <Share2 className="mr-2 h-3 w-3" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] bg-secondary text-secondary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Gift className="h-20 w-20" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Users className="h-4 w-4" /> Free VIP Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black">
                  <span>Next Milestone: 10 Invites</span>
                  <span>{stats.referralCount} / 10</span>
                </div>
                <Progress value={(stats.referralCount / 10) * 100} className="h-2 bg-white/20" />
              </div>
              <p className="text-[10px] font-medium leading-relaxed opacity-90">
                You've referred <b>{stats.referralCount}</b> professionals. Invite <b>{Math.max(0, 10 - stats.referralCount)}</b> more to unlock 7 days of Pro VIP status for free.
              </p>
              <Button variant="secondary" className="w-full rounded-full font-black shadow-lg bg-white text-secondary hover:bg-white/90" asChild>
                <Link href="/referrals">Invite & Earn</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="grid gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Professional Identity</CardTitle>
                <CardDescription>Your unique ID is used for secure connections. Browsing is disabled for your security.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Professional ID / Username</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="username" 
                      placeholder="e.g. john_pro"
                      value={username} 
                      onChange={(e) => {
                        setUsername(e.target.value);
                        checkUsername(e.target.value);
                      }}
                      className={cn(
                        "pl-10 h-12 rounded-xl",
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
                  <Label htmlFor="trade">Main Professional Skill</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="trade" 
                      placeholder="e.g. Senior React Developer"
                      value={trade} 
                      onChange={(e) => setTrade(e.target.value)}
                      className="pl-10 h-12 rounded-xl" 
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Professional Story</Label>
                    <div className="flex items-center gap-2">
                      {bioCooldownText && !isPro && (
                        <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {bioCooldownText}
                        </span>
                      )}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleGenerateBio} 
                        disabled={isGenerating || (!!bioCooldownText && !isPro)} 
                        className={cn(
                          "font-bold h-8 rounded-lg",
                          (bioCooldownText && !isPro) ? "opacity-50 grayscale" : "text-primary"
                        )}
                      >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                        AI Polish
                      </Button>
                    </div>
                  </div>
                  <Textarea 
                    id="bio" 
                    placeholder="Describe your expertise and top professional highlights..."
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[100px] rounded-xl" 
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Coverage Areas ({serviceAreas.length})</Label>
                  <Collapsible open={isAreasOpen} onOpenChange={setIsAreasOpen} className="w-full space-y-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-between h-12 rounded-xl">
                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Select Districts</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isAreasOpen && "rotate-180")} />
                      </Button>
                    </CollapsibleTrigger>
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
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Global Contact Info</CardTitle>
                <CardDescription>Visible on your public profile for client inquiries.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <div className="relative">
                    <WhatsAppIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="whatsapp" placeholder="e.g. 0987066051" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Direct Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" placeholder="e.g. 0987066051" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact-email">Professional Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10">
                <Button 
                  id="profile-save-btn"
                  type="submit"
                  disabled={isSaving || usernameStatus === "taken"}
                  className="w-full rounded-full py-6 text-lg shadow-lg font-black" 
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  Update Professional Profile
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
