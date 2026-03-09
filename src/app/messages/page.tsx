
"use client";

import { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users, Loader2, Sparkles, Gift, ArrowRight, UserPlus, Search, Lock, ShieldCheck } from "lucide-react";
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

  const chatsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "chats");
  }, [db, user?.uid]);

  const chatsQuery = useMemoFirebase(() => {
    if (!chatsRef || !user?.uid) return null;
    return query(
      chatsRef, 
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );
  }, [chatsRef, user?.uid]);

  const { data: chats, isLoading } = useCollection(chatsQuery);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectId.trim() || !db) return;

    setIsSearching(true);
    try {
      const cleanId = connectId.trim().toLowerCase().replace('@', '');
      const nameRef = doc(db, "usernames", cleanId);
      const nameSnap = await getDoc(nameRef);

      if (nameSnap.exists()) {
        const targetUid = nameSnap.data().uid;
        if (targetUid === user?.uid) {
          toast({ variant: "destructive", title: "Invalid ID", description: "You cannot message yourself." });
          return;
        }
        setIsConnectOpen(false);
        router.push(`/public/${targetUid}`);
      } else {
        toast({ variant: "destructive", title: "ID Not Found", description: "Ensure the Professional ID is correct." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Connection Error" });
    } finally {
      setIsSearching(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto px-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Messages</h1>
          <p className="text-muted-foreground text-sm font-medium">Private professional conversations.</p>
        </div>
        <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full font-black px-6 shadow-xl gap-2 h-12">
              <UserPlus className="h-4 w-4" />
              New Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-8 max-w-md border-none shadow-2xl">
            <DialogHeader className="text-center space-y-3">
              <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-primary">
                <Lock className="h-8 w-8" />
              </div>
              <DialogTitle className="text-2xl font-black">Secure Connection</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                Enter the unique Professional ID or Username of the person you want to message.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleStartChat} className="space-y-6 pt-4">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="e.g. @dev_alex" 
                  className="pl-12 h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                  value={connectId}
                  onChange={(e) => setConnectId(e.target.value)}
                />
              </div>
              <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl" type="submit" disabled={isSearching || !connectId}>
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                Verify & Connect
              </Button>
              <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-60">Connections are monitored for professional compliance.</p>
            </form>
          </DialogContent>
        </Dialog>
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
                        {chat.lastMessage || "Tap to continue professional conversation..."}
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
            <p className="text-muted-foreground font-black text-xl px-4">No active connections.</p>
            <p className="text-xs text-muted-foreground/60 mt-2">Enter a Professional ID to start your first secure chat.</p>
            <Button variant="outline" className="mt-6 rounded-full font-black px-8 border-2 h-12" onClick={() => setIsConnectOpen(true)}>
              <Search className="mr-2 h-4 w-4" /> Find Professional ID
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
