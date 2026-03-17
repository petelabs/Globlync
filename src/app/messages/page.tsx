
"use client";

import { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Loader2, Sparkles, Gift, Search, ArrowRight, UserCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const { user } = useUser();
  const db = useFirestore();

  const chatsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "chats");
  }, [db, user?.uid]);

  const chatsQuery = useMemoFirebase(() => {
    if (!chatsRef || !user?.uid) return null;
    return query(
      chatsRef, 
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc"),
      limit(50)
    );
  }, [chatsRef, user?.uid]);

  const { data: chats, isLoading } = useCollection(chatsQuery);

  if (!user) return (
    <div className="flex min-h-[60vh] items-center justify-center text-center p-8">
      <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Sign in to access secure messages</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto px-4 min-h-[70vh]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Messages</h1>
          <p className="text-muted-foreground text-sm font-medium">End-to-end encrypted professional link.</p>
        </div>
        <Button variant="outline" className="rounded-full font-black px-6 shadow-sm gap-2 h-12" asChild>
          <Link href="/search">
            <Search className="h-4 w-4" />
            Find Pros
          </Link>
        </Button>
      </header>

      <Card className="border-none bg-secondary/10 p-6 rounded-[2rem]">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm"><Gift className="h-6 w-6 text-secondary" /></div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-black text-sm uppercase tracking-tight">Invite to Unlock Free VIP</h4>
            <p className="text-xs text-muted-foreground font-medium">Build your network and earn Pro status!</p>
          </div>
          <Button variant="secondary" size="sm" asChild className="rounded-full font-black px-6">
            <Link href="/referrals">Invite Now</Link>
          </Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Encrypted Inbox...</p>
          </div>
        ) : chats && chats.length > 0 ? (
          chats.map((chat) => {
            // Find the other participant's ID
            const otherId = chat.participants.find((id: string) => id !== user.uid);
            const dateStr = chat.lastMessageAt?.seconds 
              ? formatDistanceToNow(new Date(chat.lastMessageAt.seconds * 1000), { addSuffix: true })
              : "";

            return (
              <Link key={chat.id} href={`/messages/${chat.id}`}>
                <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-[1.5rem] bg-white group border-l-4 border-l-transparent hover:border-l-primary overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/5">
                      <AvatarFallback className="bg-primary/5 font-black text-lg">P</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-black text-sm truncate uppercase tracking-tight">Secure Professional Link</h3>
                        <span className="text-[9px] font-bold text-muted-foreground">{dateStr}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium truncate italic">
                        {chat.lastMessage || "Start a conversation..."}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed mx-2 flex flex-col items-center gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm mb-2">
              <MessageSquare className="h-12 w-12 text-muted-foreground/20" />
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Your inbox is empty</p>
              <p className="text-[10px] text-muted-foreground/60 max-w-[200px] mx-auto leading-relaxed">Find a professional in the directory to start a secure conversation.</p>
            </div>
            <Button size="sm" className="rounded-full px-8 font-black uppercase text-[10px] mt-2" asChild>
              <Link href="/search">Open Directory</Link>
            </Button>
          </div>
        )}
      </div>

      <footer className="text-center py-10 opacity-40">
        <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest">
          <Sparkles className="h-3 w-3" /> Globlync Secure Messaging v2.1
        </div>
      </footer>
    </div>
  );
}
