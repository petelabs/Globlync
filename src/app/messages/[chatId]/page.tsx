
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  ArrowLeft, 
  Loader2, 
  Clock, 
  Lock,
  Hammer,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function ChatDetailPage() {
  const router = useRouter();
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto px-2 relative">
      {/* COMING SOON OVERLAY */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/40 backdrop-blur-[8px] rounded-[3rem] animate-in fade-in duration-500">
        <Card className="max-w-sm w-full border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <div className="p-10 text-center space-y-8">
            <div className="bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto text-primary animate-pulse">
              <Hammer className="h-12 w-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight">Coming Soon</h2>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                This professional channel is currently undergoing a security audit to ensure maximum privacy for your global network.
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <p className="text-[10px] font-black uppercase text-left tracking-tight leading-none text-muted-foreground">
                Encryption protocols are being updated to industry standards.
              </p>
            </div>
            <Button className="w-full rounded-full h-14 font-black text-lg" onClick={() => router.push("/messages")}>
              Return to Inbox
            </Button>
            <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary/30">
              <Sparkles className="h-3 w-3" /> Globlync Security v2.0
            </div>
          </div>
        </Card>
      </div>

      <header className="flex items-center gap-3 p-4 bg-card rounded-t-[2rem] border-b shadow-sm opacity-20 filter grayscale pointer-events-none">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/5 font-black text-xs">P</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-black text-sm">Secure Link</h3>
            <div className="text-[9px] font-black uppercase text-green-600">Secure Channel</div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 opacity-20 filter grayscale pointer-events-none">
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Lock className="h-3 w-3 text-primary/40" />
            <span className="text-[10px] font-black uppercase text-muted-foreground">End-to-End Encryption</span>
          </div>
        </div>
        <div className="flex justify-end"><div className="bg-primary h-12 w-2/3 rounded-2xl" /></div>
        <div className="flex justify-start"><div className="bg-white border h-12 w-1/2 rounded-2xl" /></div>
      </div>

      <footer className="p-4 bg-card rounded-b-[2rem] border-t shadow-inner opacity-20 filter grayscale pointer-events-none">
        <div className="flex gap-2">
          <div className="rounded-full h-12 bg-muted/30 flex-1" />
          <div className="rounded-full h-12 w-12 bg-primary shadow-lg" />
        </div>
      </footer>
    </div>
  );
}
