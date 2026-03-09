
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc, collection, query, orderBy, limit, setDoc, serverTimestamp, increment, updateDoc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Briefcase, 
  MapPin, 
  Star, 
  MessageSquare, 
  Share2, 
  ArrowLeft,
  Loader2,
  ExternalLink,
  Crown,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function PublicProfilePage() {
  const { workerId } = useParams() as { workerId: string };
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isMessaging, setIsMessaging] = useState(false);

  const workerRef = useMemoFirebase(() => {
    if (!db || !workerId) return null;
    return doc(db, "workerProfiles", workerId);
  }, [db, workerId]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(workerRef);

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

  const ratingsQuery = useMemoFirebase(() => {
    if (!ratingsRef) return null;
    return query(ratingsRef, orderBy("ratedAt", "desc"), limit(5));
  }, [ratingsRef]);

  const { data: ratings } = useCollection(ratingsQuery);

  // Automated Profile View Tracker
  useEffect(() => {
    if (db && workerId && user?.uid !== workerId) {
      const timer = setTimeout(() => {
        const wRef = doc(db, "workerProfiles", workerId);
        updateDoc(wRef, {
          profileViews: increment(1),
          updatedAt: serverTimestamp()
        }).catch(() => {});
      }, 2000); // 2 second engagement threshold
      return () => clearTimeout(timer);
    }
  }, [db, workerId, user?.uid]);

  const handleMessage = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.uid === workerId) return;

    setIsMessaging(true);
    try {
      const chatId = [user.uid, workerId].sort().join('_');
      const chatDocRef = doc(db!, "chats", chatId);
      const chatSnap = await getDoc(chatDocRef);

      if (!chatSnap.exists()) {
        await setDoc(chatDocRef, {
          id: chatId,
          participants: [user.uid, workerId],
          participantNames: [user.displayName || "Client", profile?.name || "Professional"],
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          lastMessage: "Secure professional connection established."
        });
      }

      router.push(`/messages/${chatId}`);
    } catch (err) {
      toast({ variant: "destructive", title: "Connection Failed" });
    } finally {
      setIsMessaging(false);
    }
  };

  if (isProfileLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
      <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Professional Data...</p>
    </div>
  );

  if (!profile) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-black">Profile Not Found</h2>
      <Button variant="link" asChild><Link href="/">Return Home</Link></Button>
    </div>
  );

  const isPro = profile.isPro || (profile.referralCount || 0) >= 10;

  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto px-4">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button variant="outline" size="sm" className="rounded-full font-bold">
          <Share2 className="mr-2 h-4 w-4" /> Share Reputation
        </Button>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden text-center pt-8">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary shadow-2xl">
                  <AvatarImage src={profile.profilePictureUrl} className="object-cover" />
                  <AvatarFallback className="text-3xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                {isPro && (
                  <div className="absolute -top-2 -right-2 bg-secondary p-2 rounded-full border-4 border-white shadow-xl animate-bounce">
                    <Crown className="h-4 w-4 text-white fill-white" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black leading-tight">{profile.name}</h1>
                <p className="text-sm font-bold text-primary uppercase tracking-tighter">@{profile.username}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {profile.isAvailable ? (
                    <Badge className="bg-green-500 font-black">Available for Hire</Badge>
                  ) : (
                    <Badge variant="secondary" className="font-black">Currently Busy</Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <div className="bg-muted/30 p-6 border-t grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Global Views</p>
                <p className="text-xl font-black">{profile.profileViews || 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground">Trust Score</p>
                <p className="text-xl font-black text-primary">{profile.trustScore || 0}</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-3">
            <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl" onClick={handleMessage} disabled={isMessaging}>
              {isMessaging ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageSquare className="mr-2 h-5 w-5" />}
              Message Now
            </Button>
            {profile.whatsappNumber && (
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-lg border-2 border-green-500 text-green-600 hover:bg-green-50" asChild>
                <a href={`https://wa.me/${profile.whatsappNumber}`} target="_blank">
                  <WhatsAppIcon className="mr-2 h-6 w-6" /> WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Professional Expertise
            </h2>
            <Card className="border-none shadow-sm p-6 rounded-3xl bg-white">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black py-1.5 px-4 rounded-xl text-xs">
                    {profile.tradeSkill || "General Expert"}
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {profile.bio || "This professional is building an evidence-based reputation log."}
                </p>
                {profile.serviceAreas && profile.serviceAreas.length > 0 && (
                  <div className="pt-4 border-t flex flex-wrap gap-2 items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Coverage:</span>
                    {profile.serviceAreas.map(area => (
                      <Badge key={area} variant="secondary" className="text-[9px] font-bold">{area}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Verified Job Logs
              </h2>
              <Badge variant="secondary" className="font-black">{jobs?.length || 0} Total</Badge>
            </div>
            
            <div className="grid gap-4">
              {jobs && jobs.length > 0 ? (
                jobs.map(job => (
                  <Card key={job.id} className="overflow-hidden border-none shadow-sm rounded-[2rem] group hover:shadow-xl transition-all">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-40 aspect-square bg-muted shrink-0 relative overflow-hidden">
                        <img src={job.photoUrl} alt="Evidence" className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                        {job.aiVerified && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">AI VERIFIED</div>
                        )}
                      </div>
                      <div className="p-6 flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-black text-lg">{job.title}</h3>
                          <Badge className="bg-green-500/10 text-green-600 border-none font-black text-[10px]">VERIFIED</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        <div className="pt-2 flex items-center gap-4 text-[10px] font-black uppercase text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(job.dateCompleted), { addSuffix: true })}</span>
                          <span className="flex items-center gap-1 text-primary"><CheckCircle2 className="h-3 w-3" /> Client Confirmed</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-[2rem] border-4 border-dashed opacity-50">
                  <Briefcase className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest">No verified jobs logged yet</p>
                </div>
              )}
            </div>
          </section>

          {ratings && ratings.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                <Star className="h-5 w-5 text-secondary" /> Verified Ratings
              </h2>
              <div className="grid gap-3">
                {ratings.map((r, i) => (
                  <Card key={i} className="border-none shadow-sm p-6 rounded-[1.5rem] bg-secondary/5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className={`h-4 w-4 ${idx < r.score ? 'fill-secondary text-secondary' : 'text-muted'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-black uppercase opacity-40">Client Verified</span>
                    </div>
                    <p className="text-sm italic font-medium">"{r.comment || "Excellent professional quality work."}"</p>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
