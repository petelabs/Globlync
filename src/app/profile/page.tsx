
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, MapPin, Briefcase, Mail, Phone, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { toast } = useToast();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your professional details have been saved.",
    });
  };

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your professional information and credentials.</p>
      </header>

      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-primary shadow-xl">
            <AvatarImage src="https://picsum.photos/seed/profile-current/200/200" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-md border border-border">
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">John Doe</h2>
          <p className="text-muted-foreground">Skill: Plumbing Specialist</p>
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
                <Input id="trade" defaultValue="Master Plumber" className="pl-10" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Base Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="location" defaultValue="New York, NY" className="pl-10" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Input id="bio" defaultValue="Over 10 years of experience in residential and commercial plumbing." />
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
                <Input id="email" type="email" defaultValue="john.doe@example.com" className="pl-10" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" defaultValue="+1 234 567 8900" className="pl-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Account Security</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" type="button" className="w-full justify-start rounded-full">
              <Lock className="mr-2 h-4 w-4" /> Change Password
            </Button>
            <Button variant="destructive" type="button" className="w-full justify-start rounded-full">
              <Briefcase className="mr-2 h-4 w-4" /> Archive Account
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" className="rounded-full py-6 text-lg">Save All Changes</Button>
      </form>
    </div>
  );
}
