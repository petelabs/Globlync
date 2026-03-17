
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "react-router-dom";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, query, orderBy, limit, serverTimestamp, setDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  ArrowLeft, 
  Loader2, 
  Lock,
  Sparkles,
  ShieldCheck,
  UserCircle,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import { useParams as useNextParams } from "next/navigation";

export default function ChatDetailPage() {
  const params = useNextParams() as { chatId: string };
  const { user } = useUser();
  const db = useFirestore();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatId = params.chatId;

  const chatRef = useMemoFirebase(() => {
    if (!db || !chatId) return null;
    return doc(db, "chats", chatId);
  }, [db, chatId]);

  const messagesRef = useMemoFirebase(() => {
    if (!db || !chatId) return null;
    return collection(db, "chats", chatId, "messages");
  }, [db, chatId]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesRef) return null;
    return query(messagesRef, orderBy("createdAt", "asc"), limit(100));
  }, [messagesRef]);

  const { data: chat } = useDoc(chatRef);
  const { data: messages, isLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || !messagesRef || !chatRef) return;

    const messageContent = text.trim();
    setText("");

    // Initialize chat document if it doesn't exist (using deterministic participants)
    const participants = chatId.split("_");
    if (participants.length === 2 && participants.includes(user.uid)) {
      await setDoc(chatRef, {
        participants,
        lastMessage: messageContent,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    // Add message
    addDocumentNonBlocking(messagesRef, {
      text: messageContent,
      senderId: user.uid,
      senderName: user.displayName || "Professional",
      createdAt: serverTimestamp(),
    });

    // Update parent for inbox ordering
    updateDocumentNonBlocking(chatRef, {
      lastMessage: messageContent,
      lastMessageAt: serverTimestamp(),
    });
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto px-2 relative">
      <header className="flex items-center gap-3 p-4 bg-card rounded-t-[2rem] border-b shadow-sm z-10">
        <Button variant="ghost" size="icon" className="rounded-full shrink-0" asChild>
          <Link href="/messages"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
            <AvatarFallback className="bg-primary/5 font-black text-xs">P</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-black text-sm uppercase tracking-tight truncate">Professional Link</h3>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <div className="text-[9px] font-black uppercase text-green-600 tracking-widest">Secure Gateway Active</div>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full opacity-20"><MoreVertical className="h-4 w-4" /></Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 scrollbar-hide">
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border shadow-sm">
            <Lock className="h-3 w-3 text-primary/40" />
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Identity Verified & Encrypted</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary/20" /></div>
        ) : messages && messages.length > 0 ? (
          messages.map((m, idx) => {
            const isMe = m.senderId === user.uid;
            return (
              <div key={m.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-3xl text-sm font-medium shadow-sm ${
                  isMe 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-white text-foreground rounded-tl-none border'
                }`}>
                  <p className="leading-relaxed break-words">{m.text}</p>
                  <p className={`text-[8px] mt-1 font-bold uppercase tracking-widest opacity-40 ${isMe ? 'text-right' : 'text-left'}`}>
                    {m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-30">
            <ShieldCheck className="h-12 w-12 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest max-w-[200px]">Send a message to open this professional channel.</p>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <footer className="p-4 bg-card rounded-b-[2rem] border-t shadow-inner">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            placeholder="Type your professional inquiry..." 
            className="rounded-full h-14 px-6 bg-muted/20 border-2 focus-visible:ring-primary/20 text-sm font-medium"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-14 w-14 shrink-0 shadow-lg hover:scale-105 transition-transform"
            disabled={!text.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <div className="mt-3 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          <Sparkles className="h-2.5 w-2.5" /> Built by Globlync Protection
        </div>
      </footer>
    </div>
  );
}
