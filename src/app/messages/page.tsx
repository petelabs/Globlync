
"use client";

import { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, orderBy, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, Loader2, Sparkles, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  const isUnlocked = (profile?.referralCount || 0) >= 1;

  if (!user) return null;

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 p-6 text-center max-w-lg mx-auto">
        <div className="bg-primary/10 p-10 rounded-[3rem] shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 animate-pulse">
            <MessageSquare className="h-24 w-24" />
          </div>
          <Gift className="h-20 w-20 text-primary relative z-10 animate-bounce" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter">Messaging <span className="text-primary">Locked.</span></h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            To protect professional privacy, in-app messaging is only available to active contributors. 
            <b>Invite at least 1 professional</b> to join your network to unlock private chat forever.
          </p>
        </div>
        <Card className="w-full border-none bg-muted/30 p-6 rounded-[2rem] text-left">
          <div className="flex gap-4">
            <div className="bg-white p-3 rounded-2xl h-fit shadow-sm">
              <Sparkles className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Why is this locked?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By growing the network, you increase the pool of verified work. This builds trust for everyone including yourself.
              </p>
            </div>
          </div>
        </Card>
        <Button size="lg" className="w-full rounded-full h-16 text-lg font-black shadow-xl" asChild>
          <Link href="/referrals">Invite Now to Unlock <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto px-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Professional Chats</h1>
          <p className="text-muted-foreground text-sm">Direct messaging with your global network.</p>
        </div>
        <div className="bg-primary/10 px-4 py-1.5 rounded-full flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary text-primary-foreground font-black text-[10px] uppercase">Unlocked</Badge>
        </div>
      </header>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary/20" /></div>
        ) : chats && chats.length > 0 ? (
          chats.map((chat) => {
            const otherParticipantId = chat.participants.find((p: string) => p !== user.uid);
            // In a real app, you'd fetch the other user's profile info here.
            // For now, we link to the chatId.
            return (
              <Link key={chat.id} href={`/messages/${chat.id}`}>
                <Card className="border-none shadow-sm hover:shadow-xl transition-all cursor-pointer group rounded-[1.5rem]">
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
          <div className="text-center py-24 bg-muted/20 rounded-[3rem] border-4 border-dashed">
            <MessageSquare className="h-16 w-16 mx-auto mb-6 opacity-10" />
            <p className="text-muted-foreground font-black text-xl px-4">No active conversations.</p>
            <p className="text-xs text-muted-foreground/60 mt-2">Find professionals in the network to start connecting.</p>
            <Button variant="outline" className="mt-6 rounded-full font-black px-8" asChild>
              <Link href="/search">Find Professionals</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
