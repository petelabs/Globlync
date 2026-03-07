
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gift, Zap, ShieldCheck, Star, Info, ChevronRight, Loader2, Sparkles, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RewardsPage() {
  // Replace this with your actual Adscend Media Wall URL
  const ADSCEND_URL = "https://adscendmedia.com/adwall/v2/YOUR_WALL_ID/YOUR_USER_ID";

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto px-4">
      <header className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Official Reward Center
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Earn Pro <span className="text-primary italic">Status.</span></h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
          Don't want to pay? Support the platform by completing a quick offer or survey to unlock professional VIP benefits for free.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none bg-primary/5 p-6 rounded-[2rem] text-center space-y-2">
          <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <h4 className="font-black text-xs uppercase tracking-tight">Step 1: Pick</h4>
          <p className="text-[10px] text-muted-foreground">Select an offer from our partners below.</p>
        </Card>
        <Card className="border-none bg-primary/5 p-6 rounded-[2rem] text-center space-y-2">
          <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-primary">
            <Award className="h-5 w-5" />
          </div>
          <h4 className="font-black text-xs uppercase tracking-tight">Step 2: Complete</h4>
          <p className="text-[10px] text-muted-foreground">Follow the instructions carefully to finish.</p>
        </Card>
        <Card className="border-none bg-primary/5 p-6 rounded-[2rem] text-center space-y-2">
          <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="font-black text-xs uppercase tracking-tight">Step 3: Earn</h4>
          <p className="text-[10px] text-muted-foreground">Automatic Pro status added to your profile.</p>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-muted/30 p-8 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Gift className="h-6 w-6 text-secondary" /> Global Offer Wall
            </CardTitle>
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-white">Verified Partner</Badge>
          </div>
          <CardDescription className="text-xs font-medium mt-1">
            Choose an action below. Note: Offers may take up to 24 hours to credit.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 min-h-[600px] relative">
          {/* Adscend Media Iframe Placeholder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/5 p-12 text-center gap-4">
             <div className="p-8 bg-white rounded-full shadow-inner animate-pulse">
                <Loader2 className="h-12 w-12 text-primary/30 animate-spin" />
             </div>
             <div className="space-y-1">
                <p className="font-black text-lg">Connecting to Adscend Media...</p>
                <p className="text-xs text-muted-foreground">The offer wall will load here. Ensure your ad-blocker is OFF.</p>
             </div>
             <Button variant="outline" className="rounded-full font-black text-[10px] uppercase mt-4">
                Manual Verification Check
             </Button>
          </div>
          
          {/* ACTUAL IFRAME (Uncomment and replace ID when ready) */}
          {/* <iframe src={ADSCEND_URL} className="w-full h-[800px] border-none" /> */}
        </CardContent>
      </Card>

      <footer className="bg-accent/30 p-8 rounded-[2rem] flex items-start gap-4 border-2 border-accent">
        <div className="bg-white p-2 rounded-xl text-secondary shadow-sm">
          <Info className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-sm uppercase tracking-tight">Engagement Notice</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By using the Reward Center, you help keep Globlync free for thousands of workers in Malawi. Thank you for your support.
          </p>
        </div>
      </footer>
    </div>
  );
}
