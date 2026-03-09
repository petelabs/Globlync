
"use client";

import { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, Loader2, Sparkles, Gift, ArrowRight, UserPlus, Search, Lock, ShieldCheck, Clock, Hammer } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function MessagesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [connectId, setConnectId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);

  // Note: We keep the UI structure but overlay it with a maintenance message
  const chats: any[] = []; // Empty for placeholder while in maintenance
  const isLoading = false;

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Upgrade in Progress", description: "Secure messaging is currently being tuned for global scale." });
  };

  if (!user) return null;

  return (
    <div className="relative flex flex-col gap-6 py-4 max-w-2xl mx-auto px-4 min-h-[70vh]">
      {/* MAINTENANCE OVERLAY */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-[6px] rounded-[3rem] animate-in fade-in duration-700">
        <Card className="max-w-sm w-full border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden">
          <div className="bg-primary p-10 flex flex-col items-center gap-6 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Hammer className="h-32 w-32 -rotate-12" />
            </div>
            <div className="bg-white/20 p-6 rounded-[2rem] shadow-xl backdrop-blur-md animate-bounce">
              <Sparkles className="h-10 w-10 text-secondary fill-secondary" />
            </div>
            <div className="space-y-2 relative z-10">
              <h2 className="text-3xl font-black tracking-tighter">Feature Upgrade.</h2>
              <p className="text-sm font-medium opacity-90 leading-tight">We are improving our secure messaging engine to handle thousands of global connections.</p>
            </div>
          </div>
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Network Tuning</span>
                <span>85% Complete</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[85%] animate-pulse" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
              "Building trust takes time. We're ensuring every professional conversation is end-to-end encrypted."
            </p>
            <Button className="w-full rounded-full h-12 font-black shadow-lg" asChild>
              <Link href="/profile">Back to My Hub</Link>
            </Button>
            <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary/40">
              <Clock className="h-3 w-3" /> Global Rollout Coming Soon
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BLURRED BACKGROUND UI (SO THE FEATURE IS STILL "SHOWN") */}
      <div className="opacity-30 pointer-events-none filter grayscale">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Messages</h1>
            <p className="text-muted-foreground text-sm font-medium">Private professional conversations.</p>
          </div>
          <Button className="rounded-full font-black px-6 shadow-xl gap-2 h-12">
            <UserPlus className="h-4 w-4" />
            New Chat
          </Button>
        </header>

        <Card className="border-none bg-secondary/10 p-6 rounded-[2rem] mt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm"><Gift className="h-6 w-6 text-secondary" /></div>
            <div className="flex-1">
              <h4 className="font-black text-sm uppercase tracking-tight">Invite to Unlock Free VIP</h4>
              <p className="text-xs text-muted-foreground font-medium">Invite 10 professionals to get 7 days of Pro VIP status!</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-3 mt-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-none shadow-sm rounded-[1.5rem] bg-white opacity-50">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-muted">
                  <AvatarFallback className="bg-muted/50 font-black text-lg">P</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-full bg-muted/50 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
