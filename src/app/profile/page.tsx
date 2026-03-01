"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Briefcase, Mail, Phone, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateProfessionalBio } from "@/ai/flows/generate-bio-flow";
import { useUser } from "@/firebase";

export default function ProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [trade, setTrade] = useState("Master Plumber");
  const [bio, setBio] = useState("Over 10 years of experience in residential and commercial plumbing.");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your professional details have been saved.",
    });
  };

  const handleGenerateBio = async () => {
    setIsGenerating(true);
    try {
      const result = await generateProfessionalBio({
        trade,
        experienceYears: 10,
        specialties: "Emergency repairs and bathroom installations"
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

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your Globlync professional presence.</p>
      </header>

      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-primary shadow-xl">
            <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} />
            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-md border border-border">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{user?.displayName || "Skilled Professional"}</h2>
          <p className="text-muted-foreground">{trade}</p>
        </div>
      </div>

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
                  value={trade} 
                  onChange={(e) => setTrade(e.target.value)}
                  className="pl-10 h-12" 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Base Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="location" defaultValue="New York, NY" className="pl-10 h-12" />
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
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px]" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription>Private information used for verification and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" defaultValue={user?.email || ""} className="pl-10 h-12" readOnly />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" defaultValue="+1 234 567 8900" className="pl-10 h-12" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="rounded-full py-6 text-lg">Save All Changes</Button>
      </form>
    </div>
  );
}
