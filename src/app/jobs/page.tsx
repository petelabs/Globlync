
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Building2,
  ChevronRight,
  Loader2,
  PlusCircle,
  Sparkles,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Trophy,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function JobsBoardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isPosting, setIsPosting] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    applyLink: "",
  });

  // Query community jobs from Firestore - OPEN RULES prevent errors
  const jobsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "communityJobs"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: communityJobs, isLoading } = useCollection(jobsQuery);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setIsPosting(true);
    try {
      await addDocumentNonBlocking(collection(db, "communityJobs"), {
        ...newJob,
        postedBy: user?.uid || "anonymous",
        postedByEmail: user?.email || "anonymous",
        isFeatured: false,
        createdAt: serverTimestamp(),
      });

      setNewJob({ title: "", company: "", location: "", description: "", applyLink: "" });
      setIsPosting(false);
      setIsSuccessOpen(true);
    } catch (err) {
      toast({ variant: "destructive", title: "Posting Failed", description: "Ensure you have a stable connection." });
      setIsPosting(false);
    }
  };

  const getWhatsAppFeaturedLink = () => {
    const text = encodeURIComponent(`Hi Globlync Admin! I just posted a job called "${newJob.title || 'a new vacancy'}" and I want to pay K1000 to feature it at the top for 2 weeks.`);
    return `https://wa.me/265987066051?text=${text}`;
  };

  return (
    <div className="flex flex-col gap-12 py-8 max-w-full mx-auto px-3 sm:px-4 overflow-x-hidden w-full">
      <header className="flex flex-col gap-10 w-full max-w-4xl mx-auto text-center py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Direct National Vacancies</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
            Malawi <span className="text-primary">Opportunities.</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            The national board for community-verified vacancies. Post roles directly or find your next milestone.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          {user ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full font-black px-10 h-16 shadow-2xl bg-primary text-white border-4 border-white/20 hover:scale-105 transition-transform">
                  <PlusCircle className="mr-3 h-6 w-6" /> Post a Vacancy (FREE)
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 bg-primary text-primary-foreground">
                  <DialogTitle className="text-2xl font-black tracking-tight">Post Local Vacancy</DialogTitle>
                  <DialogDescription className="text-primary-foreground/70 font-medium">
                    Your listing will go live instantly to the Malawian professional network.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePostJob} className="p-8 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest ml-1">Job Title</Label>
                    <Input id="title" placeholder="e.g. Senior Masonry Expert" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="company" className="text-[10px] font-black uppercase tracking-widest ml-1">Company / Entity</Label>
                      <Input id="company" placeholder="Local Enterprise" required value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest ml-1">Location</Label>
                      <Input id="location" placeholder="Mulanje, MWA" required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest ml-1">Requirements & Details</Label>
                    <Textarea id="desc" placeholder="Describe the role..." required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="min-h-[100px] rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="apply" className="text-[10px] font-black uppercase tracking-widest ml-1">How to Apply (Email or Link)</Label>
                    <Input id="apply" placeholder="jobs@example.mw" required value={newJob.applyLink} onChange={e => setNewJob({...newJob, applyLink: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-full font-black text-lg mt-4 shadow-xl" disabled={isPosting}>
                    {isPosting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                    Confirm & Post Vacancy
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button variant="outline" className="rounded-full font-black px-10 h-16 border-4" asChild>
              <Link href="/login">Sign In to Post Jobs</Link>
            </Button>
          )}

          <Button 
            variant="outline"
            className="rounded-full font-black px-10 h-16 shadow-[0_20px_40px_-10px_rgba(255,193,7,0.3)] bg-secondary hover:bg-secondary/90 text-secondary-foreground border-4 border-white/20"
            asChild
          >
            <a href="https://wa.me/265987066051" target="_blank">
              <MessageSquare className="mr-3 h-6 w-6" /> WhatsApp Support
            </a>
          </Button>
        </div>
      </header>

      {/* Success Dialog for Featured Upsell */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="rounded-[3rem] max-w-md p-10 text-center space-y-6">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-3xl font-black tracking-tight">Vacancy Live!</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              Your community vacancy is now visible to professionals across Malawi.
            </DialogDescription>
          </div>
          <Card className="border-none bg-secondary/10 p-6 rounded-3xl text-left border-2 border-secondary/20">
            <h4 className="font-black text-secondary text-sm flex items-center gap-2 mb-2 uppercase">
              <Sparkles className="h-4 w-4" /> Reach 10x More Pros
            </h4>
            <p className="text-xs font-bold leading-tight mb-4">Feature this job at the top of the board for 2 weeks for only <span className="text-primary font-black">K1000</span>.</p>
            <Button className="w-full rounded-full bg-secondary text-secondary-foreground font-black shadow-lg" asChild>
              <a href={getWhatsAppFeaturedLink()} target="_blank">Upgrade to Featured Listing</a>
            </Button>
          </Card>
          <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest" onClick={() => setIsSuccessOpen(false)}>
            Close & View Board
          </Button>
        </DialogContent>
      </Dialog>

      <section className="grid gap-6 w-full max-w-4xl mx-auto pb-20">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-lg font-black uppercase tracking-[0.2em] text-primary">
            Latest National Listings
          </h2>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>

        {communityJobs && communityJobs.length > 0 ? (
          communityJobs.map((job) => (
            <Card key={job.id} className="border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group border-l-8 rounded-[2.5rem] bg-white border-l-transparent hover:border-l-primary">
              <CardHeader className="p-8 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-black text-primary group-hover:underline cursor-pointer">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-base font-bold mt-2 text-muted-foreground">
                      <Building2 className="h-5 w-5 text-primary/40" />
                      <span>{job.company}</span>
                    </div>
                  </div>
                  {job.isFeatured && (
                    <Badge className="bg-secondary text-secondary-foreground border-none uppercase text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg animate-pulse">
                      <Sparkles className="mr-1.5 h-3 w-3" /> Featured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-6 space-y-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase bg-muted/50 px-3 py-1.5 rounded-xl">
                    <MapPin className="h-4 w-4 text-primary/60" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase bg-muted/50 px-3 py-1.5 rounded-xl">
                    <Clock className="h-4 w-4 text-primary/60" />
                    <span>{job.createdAt ? formatDistanceToNow(new Date(job.createdAt.seconds * 1000), { addSuffix: true }) : "just now"}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed line-clamp-3 text-muted-foreground font-medium whitespace-pre-wrap">
                  {job.description}
                </p>
              </CardContent>
              <CardFooter className="bg-muted/30 p-6 flex justify-between items-center px-8">
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <AlertCircle className="h-3.5 w-3.5 opacity-40" /> Apply using your verified profile link
                </div>
                <Button className="rounded-full font-black px-8 h-12 uppercase shadow-lg group-hover:scale-105 transition-transform" asChild>
                  <a href={job.applyLink.includes('@') ? `mailto:${job.applyLink}` : job.applyLink} target="_blank">
                    Quick Apply <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : !isLoading ? (
          <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed mx-2 flex flex-col items-center gap-6">
            <Briefcase className="h-16 w-16 text-muted-foreground/20" />
            <p className="text-muted-foreground font-black text-2xl">No vacancies posted yet.</p>
            <p className="text-muted-foreground text-sm font-medium -mt-4">Help Malawian pros find work by posting your first community vacancy!</p>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {[1, 2, 3].map(i => <Card key={i} className="h-64 animate-pulse bg-muted/20 border-none rounded-[2.5rem]" />)}
          </div>
        )}
      </section>
    </div>
  );
}
