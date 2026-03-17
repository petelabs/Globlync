
"use client";

import { Card } from "@/components/ui/card";
import { MessageSquare, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MessagesPage() {
  return (
    <div className="flex flex-col gap-6 py-12 max-w-2xl mx-auto px-4 min-h-[70vh] items-center text-center">
      <div className="bg-primary/10 p-6 rounded-[2.5rem] mb-4 animate-float">
        <MessageSquare className="h-16 w-16 text-primary" />
      </div>
      
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary border border-secondary/20">
          <Clock className="h-3.5 w-3.5" />
          <span>Feature Launching Soon</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter">Secure <span className="text-primary">Messaging.</span></h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed font-medium">
          We are finalizing the end-to-end encryption for the Malawian professional network. Direct links between professionals will be active shortly.
        </p>
      </div>

      <Card className="border-none bg-muted/30 p-8 rounded-[2rem] max-w-md w-full mt-8">
        <div className="grid gap-6">
          <div className="flex items-start gap-4 text-left">
            <div className="bg-white p-2 rounded-xl shadow-sm"><ShieldCheck className="h-5 w-5 text-primary" /></div>
            <div>
              <h4 className="text-xs font-black uppercase">Verified Privacy</h4>
              <p className="text-[10px] text-muted-foreground leading-tight">Identity-locked channels for secure business inquiries.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-left">
            <div className="bg-white p-2 rounded-xl shadow-sm"><Sparkles className="h-5 w-5 text-secondary" /></div>
            <div>
              <h4 className="text-xs font-black uppercase">Reputation Linked</h4>
              <p className="text-[10px] text-muted-foreground leading-tight">See trust scores directly inside the chat window.</p>
            </div>
          </div>
        </div>
      </Card>

      <Button variant="outline" className="rounded-full font-black px-10 h-14 mt-8 border-2" asChild>
        <Link href="/profile">Return to My Hub</Link>
      </Button>

      <footer className="mt-12 opacity-40">
        <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest">
          <Sparkles className="h-3 w-3" /> Globlync Protection Upgrade in Progress
        </div>
      </footer>
    </div>
  );
}
