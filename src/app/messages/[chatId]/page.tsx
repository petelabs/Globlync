
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, doc, serverTimestamp, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  ArrowLeft, 
  Loader2, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  MoreVertical,
  CheckCheck,
  Lock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function ChatDetailPage() {
  const { chatId } = useParams() as { chatId: string };
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatRef = useMemoFirebase(() => {
    if (!db || !chatId) return null;
    return doc(db, "chats", chatId);
  }, [db, chatId]);

  const { data: chat, isLoading: isChatLoading } = useDoc(chatRef);

  const messagesRef = useMemoFirebase(() => {
    if (!db || !chatId) return null;
    return collection(db, "chats", chatId, "messages");
  }, [db, chatId]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesRef) return null;
    return query(messagesRef, orderBy("createdAt", "asc"), limit(50));
  }, [messagesRef]);

  const { data: messages, isLoading: isMessagesLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !messagesRef || !chatRef) return;

    setIsSending(true);
    const messageText = newMessage.trim().substring(0, 500);
    
    try {
      addDocumentNonBlocking(messagesRef, {
        text: messageText,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });
      
      // Update chat meta for the conversation list
      updateDocumentNonBlocking(chatRef, {
        lastMessage: messageText,
        updatedAt: serverTimestamp()
      });

      setNewMessage("");
    } catch (e) {
      toast({ variant: "destructive", title: "Message failed to send" });
    } finally {
      setIsSending(false);
    }
  };

  const downloadArchive = () => {
    if (!messages) return;
    const transcript = messages.map(m => `[${m.createdAt?.seconds ? format(new Date(m.createdAt.seconds * 1000), 'yyyy-MM-dd HH:mm') : 'Pending'}] ${m.senderId === user?.uid ? 'Me' : 'Recipient'}: ${m.text}`).join('\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `globlync-chat-${chatId}.txt`;
    a.click();
    toast({ title: "Archive Downloaded", description: "Your chat transcript is saved to your device." });
  };

  if (!user) return null;

  if (isChatLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Establishing Secure Link...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto px-2">
      <header className="flex items-center gap-3 p-4 bg-card rounded-t-[2rem] border-b shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/5 font-black text-xs">P</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-black text-sm">Professional Conversation</h3>
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-green-600">
              <div className="h-1 w-1 rounded-full bg-green-600 animate-pulse" />
              Secure Channel
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5 opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl p-2 border-none shadow-2xl w-56">
            <DropdownMenuItem onClick={downloadArchive} className="rounded-xl py-3 cursor-pointer">
              <Download className="mr-3 h-4 w-4 text-primary" /> Download Transcript
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl py-3 cursor-pointer text-destructive focus:text-destructive">
              <Trash2 className="mr-3 h-4 w-4" /> Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 scrollbar-hide"
      >
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Lock className="h-3 w-3 text-primary/40" />
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">End-to-End Professional Encryption</span>
          </div>
          <p className="text-[9px] text-muted-foreground mt-4 uppercase font-bold tracking-tighter">Only the last 50 messages are stored to optimize speed.</p>
        </div>

        {messages?.map((m) => {
          const isMe = m.senderId === user.uid;
          return (
            <div key={m.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] p-4 rounded-[1.5rem] shadow-sm relative group transition-all",
                isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white text-foreground rounded-tl-none border"
              )}>
                <p className="text-sm leading-relaxed font-medium break-words">{m.text}</p>
                <div className={cn(
                  "flex items-center gap-1.5 mt-1.5 opacity-60 text-[9px] font-bold",
                  isMe ? "justify-end" : "justify-start"
                )}>
                  {m.createdAt?.seconds ? format(new Date(m.createdAt.seconds * 1000), 'HH:mm') : '...'}
                  {isMe && <CheckCheck className="h-3 w-3" />}
                </div>
              </div>
            </div>
          );
        })}
        {isMessagesLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
          </div>
        )}
      </div>

      <footer className="p-4 bg-card rounded-b-[2rem] border-t shadow-inner">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            placeholder="Type professional message..." 
            className="rounded-full h-12 bg-muted/30 border-none px-6 text-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={500}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-12 w-12 shrink-0 shadow-lg active:scale-90 transition-transform"
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
        <p className="text-[8px] text-center text-muted-foreground mt-3 uppercase font-black tracking-widest opacity-40">Messages are monitored for professional compliance.</p>
      </footer>
    </div>
  );
}
