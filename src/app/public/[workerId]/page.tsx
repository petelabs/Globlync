
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit, increment, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  Star, 
  Globe, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  Award,
  Lock
} from "lucide-react";
import { useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);

  const workerRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return doc(db, "workerProfiles", workerId);
  }, [db, workerId]);

  const currentUserRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);
  const { data: currentUserProfile } = useDoc(currentUserRef);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "jobs");
  }, [db, workerId]);

  const jobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"), limit(10));
  }, [jobsRef]);

  const { data: jobs } = useCollection(jobsQuery);

  const ratingsRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return collection(db, "workerProfiles", workerId, "ratings");
  }, [db, workerId]);

  const { data: ratings } = useCollection(ratingsRef);

  // Auto-Increment Profile Views once per session/mount
  useEffect(() => {
    if (workerRef) {
      updateDocumentNonBlocking(workerRef, {
        profileViews: increment(1)
      });
    }
  }, [workerRef]);

  const handleMessage = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    const referralCount = currentUserProfile?.referralCount || 0;
    if (referralCount < 1) {
      setIsLockDialogOpen(true);
      return;
    }

    // Create or navigate to chat
    const chatId = [user.uid, workerId].sort().join('_');
    const chatRef = doc(db!, "chats", chatId);
    
    await setDoc(chatRef, {
      participants: [user.uid, workerId],
      updatedAt: serverTimestamp(),
    }, { merge: true });

    router.push(`/messages/${chatId}`);
  };

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto px-4">
      <Card className="border-none shadow-2xl overflow-hidden rounded-[3rem] bg-white">
        <div className="h-48 bg-primary relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/seed/123/1200/400')] bg-cover" />
          <div className="absolute -bottom-16 left-10">
            <Avatar className="h-32 w-32 border-8 border-white shadow-2xl">
              <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
              <AvatarFallback className="bg-secondary text-secondary-foreground font-black text-2xl">
                {profile.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardContent className="pt-20 px-10 pb-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter">{profile.name}</h1>
                {profile.isPro && (
                  <Badge className="bg-secondary text-secondary-foreground font-black px-3 py-1 rounded-full uppercase text-[10px]">VIP Pro</Badge>
                )}
              </div>
              <p className="text-primary font-bold uppercase tracking-[0.2em] text-sm">{profile.tradeSkill || "Verified Professional"}</p>
              <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {profile.serviceAreas?.[0] || "Remote / Global"}</div>
                <div className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> Professional Economy</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full font-black px-8 h-14 shadow-lg" onClick={handleMessage}>
                <MessageSquare className="mr-2 h-5 w-5" /> In-App Message
              </Button>
              {profile.whatsappNumber && (
                <Button size="lg" variant="secondary" className="rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black px-8 h-14 shadow-lg" asChild>
                  <a href={`https://wa.me/${profile.whatsappNumber}`} target="_blank">
                    <WhatsAppIcon className="mr-2 h-5 w-5" /> WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-muted">
            <div className="text-center p-4 bg-muted/20 rounded-3xl">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Trust Score</p>
              <p className="text-3xl font-black text-primary">{profile.trustScore}</p>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-3xl">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Global Views</p>
              <p className="text-3xl font-black text-primary">{profile.profileViews || 0}</p>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-3xl">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Verified Jobs</p>
              <p className="text-3xl font-black text-primary">{jobs?.length || 0}</p>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-3xl">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Client Rating</p>
              <p className="text-3xl font-black text-primary">
                {ratings && ratings.length > 0 
                  ? (ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length).toFixed(1) 
                  : "5.0"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              Verified Evidence Log
            </h2>
            <div className="grid gap-4">
              {jobs && jobs.length > 0 ? (
                jobs.map(job => (
                  <Card key={job.id} className="overflow-hidden border-none shadow-sm rounded-[2rem] group hover:shadow-xl transition-all">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      <div className="sm:w-48 aspect-video sm:aspect-square relative overflow-hidden bg-muted">
                        <img src={job.photoUrl} alt={job.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        {job.aiVerified && (
                          <div className="absolute top-3 left-3 bg-primary text-white text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <ShieldCheck className="h-3 w-3" /> AI VERIFIED
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-black text-xl group-hover:text-primary transition-colors">{job.title}</h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[8px] font-black">Success</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{job.description}</p>
                        <div className="mt-auto flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase">
                          <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(job.dateCompleted).toLocaleDateString()}</div>
                          <div className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Evidence Verified</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-4 border-dashed">
                  <p className="text-muted-foreground font-medium">No verified evidence logs found yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-accent/30">
            <CardHeader>
              <CardTitle className="text-lg">Professional Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground italic font-medium">
                "{profile.bio || "This professional is building their digital reputation evidence log."}"
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-lg">Verified Milestones</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {profile.badgeIds?.map((badge: string) => (
                <div key={badge} className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-muted/50">
                  <div className="bg-primary/10 p-2.5 rounded-xl">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{badge.replace('-', ' ')}</p>
                    <p className="text-[10px] text-muted-foreground">Evidence-based achievement</p>
                  </div>
                </div>
              ))}
              {!profile.badgeIds?.length && (
                <p className="text-xs text-muted-foreground text-center py-4">No public badges unlocked yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
          <div className="bg-primary p-10 text-center space-y-6">
            <div className="bg-white/20 p-6 rounded-[2rem] shadow-2xl backdrop-blur-md w-fit mx-auto">
              <Lock className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-white leading-none">Invitation Required</h2>
              <p className="text-white/80 font-medium text-sm">To protect our members from spam and ensure high-trust networking, you must unlock in-app messaging.</p>
            </div>
          </div>
          <CardContent className="p-10 text-center space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Invite just <b>1 professional</b> to join Globlync. Once they sign up, messaging is unlocked for your account forever.
            </p>
            <Button size="lg" className="w-full rounded-full h-16 text-lg font-black shadow-xl" asChild>
              <Link href="/referrals">Invite & Unlock Messaging <ChevronRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button variant="ghost" className="text-xs font-bold text-muted-foreground" onClick={() => setIsLockDialogOpen(false)}>Maybe Later</Button>
          </CardContent>
        </DialogContent>
      </Dialog>
    </div>
  );
}
