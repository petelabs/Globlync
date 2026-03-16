
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  Sparkles, 
  Loader2, 
  TrendingUp,
  MoreHorizontal,
  Repeat,
  LayoutGrid,
  Clock,
  RefreshCw,
  Hammer,
  ShieldCheck
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, serverTimestamp, doc, increment, where, getDocs, Timestamp } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MAX_POST_LENGTH = 280;
const DAILY_POST_LIMIT = 5;

export default function FeedPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dailyPostCount, setDailyPostCount] = useState(0);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);

  const postsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "posts");
  }, [db]);

  const postsQuery = useMemoFirebase(() => {
    if (!postsRef) return null;
    return query(postsRef, orderBy("createdAt", "desc"), limit(50));
  }, [postsRef]);

  const { data: posts, isLoading: isFeedLoading } = useCollection(postsQuery);

  const checkDailyLimit = async () => {
    if (!db || !user?.uid) return;
    
    setIsCheckingLimit(true);
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const q = query(
        collection(db, "posts"),
        where("authorId", "==", user.uid),
        where("createdAt", ">=", Timestamp.fromDate(twentyFourHoursAgo))
      );
      
      const snap = await getDocs(q);
      setDailyPostCount(snap.size);
    } catch (err) {
      console.error("Error checking post limit:", err);
    } finally {
      setIsCheckingLimit(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      checkDailyLimit();
    }
  }, [db, user?.uid]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || !postsRef) return;

    if (dailyPostCount >= DAILY_POST_LIMIT) {
      toast({ 
        variant: "destructive", 
        title: "Daily Limit Reached", 
        description: `Quality over quantity. You've hit your ${DAILY_POST_LIMIT} posts limit.` 
      });
      return;
    }

    setIsPosting(true);
    try {
      await addDocumentNonBlocking(postsRef, {
        content: content.trim(),
        authorId: user.uid,
        authorName: user.displayName || "Professional",
        authorPhoto: user.photoURL || "",
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
      });
      setContent("");
      setDailyPostCount(prev => prev + 1);
      toast({ title: "Insight Shared!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Action Failed" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    checkDailyLimit().finally(() => {
      setTimeout(() => setIsRefreshing(false), 800);
      toast({ title: "Feed Updated" });
    });
  };

  const handleLike = (postId: string) => {
    if (!db || !user) {
      toast({ title: "Sign in to like" });
      return;
    }
    const postRef = doc(db, "posts", postId);
    updateDocumentNonBlocking(postRef, {
      likesCount: increment(1)
    });
  };

  if (isUserLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4 text-center px-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Syncing Feed...</p>
    </div>
  );

  const isLimitReached = dailyPostCount >= DAILY_POST_LIMIT;

  return (
    <div className="relative flex flex-col gap-6 py-4 max-w-2xl mx-auto px-4 min-h-[70vh]">
      {/* COMING SOON OVERLAY */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-[6px] rounded-[3rem] animate-in fade-in duration-700">
        <Card className="max-w-sm w-full border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden bg-white">
          <div className="bg-primary p-10 flex flex-col items-center gap-6 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Hammer className="h-32 w-32 -rotate-12" />
            </div>
            <div className="bg-white/20 p-6 rounded-[2rem] shadow-xl backdrop-blur-md animate-bounce">
              <Sparkles className="h-10 w-10 text-secondary fill-secondary" />
            </div>
            <div className="space-y-2 relative z-10">
              <h2 className="text-3xl font-black tracking-tighter">Coming Soon.</h2>
              <p className="text-sm font-medium opacity-90 leading-tight">We are improving our social network engine to handle thousands of global professional connections.</p>
            </div>
          </div>
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Network Audit</span>
                <span>92% Complete</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[92%] animate-pulse" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
              "Building a secure professional stage. We're ensuring every insight shared meets global trust standards."
            </p>
            <Button className="w-full rounded-full h-12 font-black shadow-lg" asChild>
              <Link href="/profile">Back to My Hub</Link>
            </Button>
            <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary/40">
              <Clock className="h-3 w-3" /> Global Social Launch Coming Soon
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BLURRED BACKGROUND UI */}
      <div className="opacity-20 pointer-events-none filter grayscale">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black tracking-tight">Professional Feed</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh} 
              className={cn("rounded-full h-10 w-10 bg-primary/5 text-primary hover:bg-primary/10", isRefreshing && "animate-spin")}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm font-medium">Real-time insights from the network.</p>
            {user && !isCheckingLimit && (
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                isLimitReached ? "bg-orange-500/10 text-orange-600" : "bg-primary/5 text-primary/60"
              )}>
                {Math.max(0, DAILY_POST_LIMIT - dailyPostCount)} Posts Remaining Today
              </span>
            )}
          </div>
        </header>

        {user && (
          <Card className={cn(
            "border-none shadow-xl rounded-[2rem] overflow-hidden bg-white transition-all mt-6",
            isLimitReached && "opacity-80"
          )}>
            <CardContent className="p-6">
              <form onSubmit={handlePost} className="space-y-4">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarFallback className="bg-primary/5 font-black">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea 
                      placeholder="Share a professional update..." 
                      className="min-h-[100px] border-none focus-visible:ring-0 text-lg resize-none p-0 bg-transparent placeholder:text-muted-foreground/40 disabled:cursor-not-allowed"
                      value={content}
                      onChange={(e) => setContent(e.target.value.substring(0, MAX_POST_LENGTH))}
                      maxLength={MAX_POST_LENGTH}
                      disabled={isLimitReached || isPosting}
                    />
                    <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                      <div className="flex items-center gap-4 text-primary/40">
                        <Sparkles className={cn("h-5 w-5", !isLimitReached && "animate-pulse")} />
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!content.trim() || isPosting || isLimitReached}
                        className="rounded-full font-black px-8 h-10 shadow-lg"
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 mt-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-none shadow-sm rounded-[2rem] bg-white h-40" />
          ))}
        </div>
      </div>
    </div>
  );
}
