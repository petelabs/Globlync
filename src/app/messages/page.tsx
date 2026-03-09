"use client";

import { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, orderBy, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, Loader2, Sparkles, Gift, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const { user } = useUser();
  const db = useFirestore();

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);

  const chatsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "chats");
  }, [db, user?.uid]);

  const chatsQuery = useMemoFirebase(() => {
    if (!chatsRef) return null;
    return query(
      chatsRef, 
      where("participants", "array-contains", user!.uid),
      orderBy("updatedAt", "desc")
    );
  }, [chatsRef]);

  const { data: chats, isLoading } = useCollection(chatsQuery);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto px-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Professional Chats</h1>
          <p className="text-muted-foreground text-sm">Direct messaging with your global network.</p>
        </div>
        <div className="bg-primary/10 px-4 py-1.5 rounded-full flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-primary">Live Now</span>
        </div>
      </header>

      {/* Soft Incentive Banner */}
      <Card className="border-none bg-secondary/10 p-6 rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Users className="h-12 w-12" />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
          <div className="bg-white p-3 rounded-2xl shadow-sm">
            <Gift className="h-6 w-6 text-secondary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-black text-sm uppercase tracking-tight">Invite to Unlock Free VIP</h4>
            <p className="text-xs text-muted-foreground font-medium">Invite 10 professionals to get 7 days of Pro VIP status for free!</p>
          </div>
          <Button size="sm" className="rounded-full font-black px-6 shadow-md" asChild>
            <Link href="/referrals">Invite Now</Link>
          </Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary/20" /></div>
        ) : chats && chats.length > 0 ? (
          chats.map((chat) => {
            return (
              <Link key={chat.id} href={`/messages/${chat.id}`}>
                <Card className="border-none shadow-sm hover:shadow-xl transition-all cursor-pointer group rounded-[1.5rem] bg-white">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-muted group-hover:border-primary transition-colors">
                      <AvatarFallback className="bg-muted/50 font-black text-lg">P</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-black text-base">Conversation</h3>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                          {chat.updatedAt?.seconds ? formatDistanceToNow(new Date(chat.updatedAt.seconds * 1000), { addSuffix: true }) : "Recent"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate font-medium">
                        {chat.lastMessage || "Tap to start professional conversation..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-24 bg-muted/20 rounded-[3rem] border-4 border-dashed border-muted/20">
            <MessageSquare className="h-16 w-16 mx-auto mb-6 opacity-10" />
            <p className="text-muted-foreground font-black text-xl px-4">No active conversations.</p>
            <p className="text-xs text-muted-foreground/60 mt-2">Find professionals in the network to start connecting.</p>
            <Button variant="outline" className="mt-6 rounded-full font-black px-8 border-2" asChild>
              <Link href="/search">Find Professionals</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
