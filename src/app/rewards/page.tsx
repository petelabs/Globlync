"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gift, Zap, ShieldCheck, Star, Info, ChevronRight, Loader2, Sparkles, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase";

export default function RewardsPage() {
  const { user } = useUser();
  
  // NOTE: Replace 'YOUR_MONLIX_APP_ID' with your actual ID from Monlix Dashboard
  // Monlix typically uses a URL format like: https://monlix.com/wall/[APP_ID]/[USER_ID]
  const MONLIX_URL = user ? `https://monlix.com/wall/YOUR_MONLIX_APP_ID/${user.uid}` : null;

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto px-4">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Official Reward Center
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Earn Pro <span className="text-primary">Status.</span></h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed font-medium">
          Support the platform that grows your reputation. Complete quick tasks from our partner <b>Monlix</b> to unlock VIP benefits instantly without paying cash.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-primary/5 p-6 rounded-[2rem] text-center space-y-2 border border-primary/10">
          <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <h4 className="font-black text-[10px] uppercase tracking-widest">1. Select</h4>
          <p className="text-[10px] text-muted-foreground font-medium">Pick a survey or task below.</p>
        </div>
        <div className="bg-primary/5 p-6 rounded-[2rem] text-center space-y-2 border border-primary/10">
          <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-primary">
            <Award className="h-5 w-5" />
          </div>
          <h4 className="font-black text-[10px] uppercase tracking-widest">2. Finish</h4>
          <p className="text-[10px] text-muted-foreground font-medium">Complete the simple steps.</p>
        </div>
        <div className="bg-primary/5 p-6 rounded-[2rem] text-center space-y-2 border border-primary/10">
          <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="font-black text-[10px] uppercase tracking-widest">3. Unlock</h4>
          <p className="text-[10px] text-muted-foreground font-medium">Get VIP status automatically.</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white min-h-[700px]">
        <CardHeader className="bg-muted/30 p-8 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Gift className="h-6 w-6 text-secondary" /> Monlix Offer Wall
            </CardTitle>
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-white">Official Partner</Badge>
          </div>
          <CardDescription className="text-xs font-bold mt-1 text-muted-foreground">
            Tasks refresh daily. Please allow up to 24 hours for credits to appear on your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 relative h-full">
          {/* Monlix Iframe Overlay (Shows until URL is provided and user is logged in) */}
          {(!MONLIX_URL || MONLIX_URL.includes("YOUR_MONLIX_APP_ID")) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/5 p-12 text-center gap-4">
               <div className="p-8 bg-white rounded-full shadow-inner animate-pulse">
                  <Loader2 className="h-12 w-12 text-primary/30 animate-spin" />
               </div>
               <div className="space-y-1">
                  <p className="font-black text-lg text-primary">Connecting to Monlix Network...</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground max-w-xs">
                    {user ? "System is verifying your account for secure rewards." : "Please sign in to access professional rewards."}
                  </p>
               </div>
            </div>
          ) : (
            <iframe 
              src={MONLIX_URL} 
              className="w-full h-[800px] border-none" 
              title="Monlix Offer Wall" 
              allow="camera; microphone"
            />
          )}
        </CardContent>
      </Card>

      <footer className="bg-primary/5 p-8 rounded-[2rem] flex items-start gap-4 border border-primary/10">
        <div className="bg-white p-2 rounded-xl text-primary shadow-sm">
          <Info className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-[10px] uppercase tracking-widest">Partner Compliance</h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Globlync partners with <b>Monlix</b> to provide professional incentives. Using VPNs or proxy services to complete tasks will result in an immediate reward ban.
          </p>
        </div>
      </footer>
    </div>
  );
}
