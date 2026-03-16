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
  AlertCircle,
  Clock
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
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
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

  const { data: posts, isLoading } = useCollection(postsQuery);

  // Check post count for the last 24 hours
  useEffect(() => {
    async function checkDailyLimit() {
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
    }
    
    checkDailyLimit();
  }, [db, user?.uid]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || !postsRef) return;

    if (dailyPostCount >= DAILY_POST_LIMIT) {
      toast({ 
        variant: "destructive", 
        title: "Daily Limit Reached", 
        description: `You can share up to ${DAILY_POST_LIMIT} professional insights every 24 hours. Keep them high quality!` 
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
      toast({ title: "Shared!", description: "Your insight is live on the global feed." });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to post" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!db) return;
    const postRef = doc(db, "posts", postId);
    updateDocumentNonBlocking(postRef, {
      likesCount: increment(1)
    });
  };

  if (!user) return null;

  const isLimitReached = dailyPostCount >= DAILY_POST_LIMIT;

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto px-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Professional Feed</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm font-medium">Real-time insights from the global network.</p>
          {!isCheckingLimit && (
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
              isLimitReached ? "bg-orange-500/10 text-orange-600" : "bg-primary/5 text-primary/60"
            )}>
              {DAILY_POST_LIMIT - dailyPostCount} Posts Remaining Today
            </span>
          )}
        </div>
      </header>

      {/* Post Composer */}
      <Card className={cn(
        "border-none shadow-xl rounded-[2rem] overflow-hidden bg-white transition-all",
        isLimitReached && "opacity-80"
      )}>
        <CardContent className="p-6">
          <form onSubmit={handlePost} className="space-y-4">
            <div className="flex gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/10">
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea 
                  placeholder={isLimitReached ? "Daily quota reached. Check back later!" : "Share a professional insight, tip, or update..."} 
                  className="min-h-[100px] border-none focus-visible:ring-0 text-lg resize-none p-0 bg-transparent placeholder:text-muted-foreground/40 disabled:cursor-not-allowed"
                  value={content}
                  onChange={(e) => setContent(e.target.value.substring(0, MAX_POST_LENGTH))}
                  maxLength={MAX_POST_LENGTH}
                  disabled={isLimitReached || isPosting}
                />
                
                {isLimitReached && (
                  <div className="bg-orange-500/5 p-3 rounded-xl border border-orange-500/10 flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-top-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <p className="text-[10px] font-black uppercase text-orange-700 tracking-tight">Daily limit reached. Quality over quantity!</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                  <div className="flex items-center gap-4 text-primary/40">
                    <Sparkles className={cn("h-5 w-5", !isLimitReached && "animate-pulse")} />
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-[10px] font-black",
                      content.length >= MAX_POST_LENGTH - 20 ? "text-orange-500" : "text-muted-foreground/40"
                    )}>
                      {content.length} / {MAX_POST_LENGTH}
                    </span>
                    <Button 
                      type="submit" 
                      disabled={!content.trim() || isPosting || isLimitReached}
                      className="rounded-full font-black px-8 h-10 shadow-lg"
                    >
                      {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Post</>}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary/20" /></div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="border-none shadow-sm rounded-[2rem] hover:shadow-md transition-all overflow-hidden bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Link href={`/public/${post.authorId}`} className="flex gap-3 items-center group">
                    <Avatar className="h-10 w-10 border border-muted group-hover:scale-105 transition-transform">
                      <AvatarImage src={post.authorPhoto} />
                      <AvatarFallback>{post.authorName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col -space-y-0.5">
                      <span className="font-black text-sm group-hover:underline">{post.authorName}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {post.createdAt?.seconds 
                          ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true }) 
                          : "Just now"}
                      </span>
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                
                <p className="text-[17px] leading-relaxed text-foreground/90 whitespace-pre-wrap font-medium">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-muted/30">
                  <div className="flex gap-1 items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full h-9 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      <span className="text-[10px] font-black">{post.likesCount || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full h-9 hover:text-primary hover:bg-primary/5">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      <span className="text-[10px] font-black">{post.commentsCount || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full h-9">
                      <Repeat className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full h-9" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/feed#${post.id}`);
                    toast({ title: "Link Copied" });
                  }}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-4 border-dashed">
            <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
            <p className="text-muted-foreground font-black text-lg">No posts yet.</p>
            <p className="text-xs text-muted-foreground/60">Be the first to share an insight with the global network!</p>
          </div>
        )}
      </div>
    </div>
  );
}
