
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Briefcase, Mail, Phone, Sparkles, Loader2, QrCode, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateProfessionalBio } from "@/ai/flows/generate-bio-flow";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);

  const [trade, setTrade] = useState("");
  const [bio, setBio] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (profile) {
      setTrade(profile.tradeSkill || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerRef) return;

    const data = {
      name: user?.displayName || "Worker",
      tradeSkill: trade,
      bio: bio,
      updatedAt: serverTimestamp(),
    };

    if (profile) {
      updateDocumentNonBlocking(workerRef, data);
    } else {
      setDocumentNonBlocking(workerRef, {
        ...data,
        id: user?.uid,
        externalAuthId: user?.uid,
        trustScore: 0,
        createdAt: serverTimestamp(),
        profilePictureUrl: user?.photoURL || "",
        qrCodeUrl: "",
        publicReputationPageLink: `/public/${user?.uid}`,
      }, { merge: true });
    }

    toast({
      title: "Profile Updated",
      description: "Your professional details have been saved to Globlync.",
    });
  };

  const handleGenerateBio = async () => {
    if (!trade) {
      toast({
        variant: "destructive",
        title: "Trade Required",
        description: "Please enter your trade before generating a bio.",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateProfessionalBio({
        trade,
        experienceYears: 5,
        specialties: "Expert service and client satisfaction"
      });
      setBio(result.bio);
      toast({
        title: "Bio Generated",
        description: "AI has created a professional bio for you.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate bio at this time.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const publicUrl = user ? `${window.location.origin}/public/${user.uid}` : "";

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your Globlync professional presence and public reputation.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Avatar and QR */}
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
                <h2 className="text-xl font-bold">{user?.displayName || "Skilled Professional"}</h2>
                <p className="text-sm text-muted-foreground">{trade || "Specify your trade"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-primary text-primary-foreground">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-center gap-2">
                <QrCode className="h-4 w-4" />
                Your Public QR
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-6">
              <div className="bg-white p-4 rounded-xl shadow-inner">
                {publicUrl ? (
                  <QRCodeSVG 
                    value={publicUrl} 
                    size={160} 
                    fgColor="hsl(var(--primary))"
                    includeMargin={false}
                  />
                ) : (
                  <div className="h-40 w-40 bg-muted animate-pulse rounded-lg" />
                )}
              </div>
              <p className="text-[10px] text-center opacity-80 max-w-[160px]">
                Clients can scan this to view your verified work history and reviews.
              </p>
              <div className="flex gap-2 w-full">
                <Button variant="secondary" size="sm" className="flex-1 rounded-full text-xs" onClick={() => window.open(publicUrl, '_blank')}>
                  <ExternalLink className="mr-1 h-3 w-3" /> View Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="grid gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Professional Details</CardTitle>
                <CardDescription>This information will be visible on your public reputation page.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="trade">Trade / Occupation</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="trade" 
                      placeholder="e.g. Master Plumber"
                      value={trade} 
                      onChange={(e) => setTrade(e.target.value)}
                      className="pl-10 h-12" 
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary h-8"
                      onClick={handleGenerateBio}
                      disabled={isGenerating}
                    >
                      {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      AI Improve Bio
                    </Button>
                  </div>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell clients about your experience..."
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[120px]" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <CardDescription>Private information used for verification and account alerts.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" defaultValue={user?.email || ""} className="pl-10 h-12" readOnly />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10">
                <Button type="submit" className="w-full rounded-full py-6 text-lg shadow-lg">Save All Changes</Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
