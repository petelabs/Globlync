
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Building2,
  ChevronRight,
  Loader2,
  ExternalLink,
  Globe,
  Sparkles,
  X,
  ArrowDown,
  Languages,
  PlusCircle,
  Megaphone,
  CheckCircle2,
  Award,
  Wallet,
  Zap,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdBanner } from "@/components/AdBanner";
import { searchJoobleJobs } from "./actions";
import { formatDistanceToNow } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, serverTimestamp, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const SUGGESTED_KEYWORDS = ["Accountant", "Driver", "Developer", "Sales", "Nurse", "Security"];

export default function JobsBoardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // New Job Form State
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    applyLink: ""
  });

  const communityJobsRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "communityJobs");
  }, [db]);

  const communityQuery = useMemoFirebase(() => {
    if (!communityJobsRef) return null;
    return query(communityJobsRef, orderBy("createdAt", "desc"), limit(20));
  }, [communityJobsRef]);

  const { data: communityJobs } = useCollection(communityQuery);

  useEffect(() => {
    async function loadInitialJobs() {
      setIsInitialLoading(true);
      try {
        const results = await searchJoobleJobs("");
        setAllJobs(results.sort((a: any, b: any) => b.createdAt - a.createdAt));
      } catch (err) {
        console.error("Error loading initial jobs:", err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadInitialJobs();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    try {
      const results = await searchJoobleJobs(searchTerm);
      setAllJobs(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !communityJobsRef) return;

    setIsPostingJob(true);
    try {
      await addDocumentNonBlocking(communityJobsRef, {
        ...newJob,
        postedBy: user.uid,
        postedByName: user.displayName || "Malawian Professional",
        type: 'community',
        isFeatured: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      setNewJob({ title: "", company: "", location: "", description: "", applyLink: "" });
      setShowSuccessDialog(true);
      toast({ title: "Vacancy Live!", description: "Your local job has been posted." });
    } catch (err) {
      toast({ variant: "destructive", title: "Posting Failed" });
    } finally {
      setIsPostingJob(false);
    }
  };

  const openTranslation = (text: string) => {
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const translateUrl = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(cleanText)}&op=translate`;
    window.open(translateUrl, '_blank');
  };

  // Merge community jobs with Jooble jobs
  const displayJobs = [
    ...(communityJobs?.map(j => ({
      ...j,
      createdAt: j.createdAt?.seconds ? j.createdAt.seconds * 1000 : Date.now(),
      url: j.applyLink || "#"
    })) || []),
    ...allJobs
  ].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex flex-col gap-12 py-8 max-w-full mx-auto px-3 sm:px-4 overflow-x-hidden w-full">
      <header className="flex flex-col gap-10 w-full max-w-4xl mx-auto text-center py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">National Opportunity Engine</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
            Your Malawi <span className="text-primary">Career.</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            Search for verified vacancies across all 28 districts. Every listing is pulled from verified national and community sources.
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="space-y-6 w-full max-w-3xl mx-auto">
          <div className="relative group w-full">
            <Search className="absolute left-8 top-8 h-10 w-10 text-muted-foreground group-focus-within:text-primary transition-all scale-90" />
            <Input 
              placeholder="e.g. Driver, Sales, or Bank" 
              className="pl-20 h-24 rounded-[3rem] shadow-xl border-4 border-primary/5 text-2xl font-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-6 top-6 flex gap-2">
              <Button 
                type="submit" 
                className="h-12 md:h-14 rounded-full px-8 md:px-12 font-black uppercase shadow-2xl"
                disabled={isSearching}
              >
                {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : "Discovery"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {SUGGESTED_KEYWORDS.map(kw => (
              <button
                key={kw}
                type="button"
                onClick={() => { setSearchTerm(kw); handleSearch(); }}
                className="px-5 py-2.5 rounded-full bg-white border-2 border-primary/5 text-[10px] font-black text-primary hover:bg-primary hover:text-white transition-all uppercase shadow-sm"
              >
                {kw}
              </button>
            ))}
          </div>
        </form>

        <div className="flex justify-center mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="rounded-full font-black px-10 h-14 shadow-lg border-2 border-primary/10">
                <PlusCircle className="mr-2 h-5 w-5" /> Post a Community Vacancy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              {!user ? (
                <div className="p-10 text-center space-y-6">
                  <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Briefcase className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black">Employer Access Required</h2>
                  <p className="text-muted-foreground text-sm">Please sign in to post vacancies and access the Malawian talent pool.</p>
                  <Button className="w-full rounded-full h-12 font-black" asChild><Link href="/login">Sign In Now</Link></Button>
                </div>
              ) : (
                <div className="p-8 space-y-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Hire Local Talent</DialogTitle>
                    <DialogDescription className="font-medium">Post your job directly to the Globlync network.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePostJob} className="grid gap-4">
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Job Title</Label>
                      <Input placeholder="e.g. Senior Accountant" value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} required className="rounded-xl border-2 h-12" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Company / Enterprise</Label>
                      <Input placeholder="e.g. Malawi Tech Solutions" value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} required className="rounded-xl border-2 h-12" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Location (District)</Label>
                      <Input placeholder="e.g. Blantyre" value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} required className="rounded-xl border-2 h-12" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Job Description</Label>
                      <Textarea placeholder="Describe the role and requirements..." value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} required className="rounded-xl border-2 min-h-[100px]" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Application Link / WhatsApp</Label>
                      <Input placeholder="e.g. https://apply.here or 099..." value={newJob.applyLink} onChange={(e) => setNewJob({...newJob, applyLink: e.target.value})} className="rounded-xl border-2 h-12" />
                    </div>
                    <Button type="submit" className="w-full h-14 rounded-full font-black text-lg mt-4 shadow-xl" disabled={isPostingJob}>
                      {isPostingJob ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Megaphone className="mr-2 h-5 w-5" />}
                      Publish Opportunity
                    </Button>
                  </form>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Success Dialog for Featured Upsell */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-secondary p-10 flex flex-col items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"><Sparkles className="h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse" /></div>
            <div className="bg-white/20 p-6 rounded-full shadow-2xl backdrop-blur-md">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <div className="text-center text-secondary-foreground space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Vacancy Published!</h2>
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Global visibility active.</p>
            </div>
          </div>
          <div className="p-10 space-y-8 text-center">
            <div className="bg-muted/30 p-6 rounded-[2rem] border-2 border-dashed border-primary/20">
              <Badge className="bg-primary text-white font-black mb-3 px-4 py-1 rounded-full text-[10px] uppercase">Highly Recommended</Badge>
              <h3 className="text-xl font-black leading-tight text-primary">List on Top for 2 Weeks</h3>
              <p className="text-xs text-muted-foreground font-bold mt-2 leading-relaxed">
                Pay only <b>K1,000</b> to feature this job at the absolute top of the national directory. Featured jobs get 10x more verified applicants.
              </p>
            </div>
            <div className="grid gap-3">
              <Button size="lg" className="w-full rounded-full h-16 text-lg font-black bg-primary shadow-xl" asChild>
                <a href="https://wa.me/265987066051?text=Hi! I want to feature my job listing on Globlync. Here is my job title: " target="_blank">
                  <Wallet className="mr-2 h-5 w-5" /> Pay K1,000 Now
                </a>
              </Button>
              <Button variant="ghost" className="w-full font-bold text-xs" onClick={() => setShowSuccessDialog(false)}>
                Maybe Later, Keep Standard Listing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <section className="grid gap-6 w-full max-w-4xl mx-auto pb-20">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-lg font-black uppercase tracking-[0.2em] text-primary">
            {searchTerm ? `Results for "${searchTerm}"` : "Active National Vacancies"}
          </h2>
          {(isInitialLoading || isSearching) && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>

        {displayJobs.length > 0 ? (
          displayJobs.map((job) => (
            <Card key={job.id} className={`border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group border-l-8 rounded-[2.5rem] bg-white ${job.type === 'community' ? 'border-l-secondary' : 'border-l-transparent hover:border-l-primary'}`}>
              <CardHeader className="p-8 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {job.type === 'community' && <Badge className="bg-secondary/10 text-secondary border-none uppercase text-[8px] font-black px-2 py-0.5 rounded-full"><Sparkles className="h-2 w-2 mr-1" /> Community Post</Badge>}
                      {job.isFeatured && <Badge className="bg-primary text-white border-none uppercase text-[8px] font-black px-2 py-0.5 rounded-full"><Award className="h-2 w-2 mr-1" /> Featured</Badge>}
                    </div>
                    <CardTitle className="text-2xl font-black text-primary group-hover:underline cursor-pointer">
                      <a href={job.url} target="_blank" rel="noopener noreferrer">{job.title}</a>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-base font-bold mt-2 text-muted-foreground">
                      <Building2 className="h-5 w-5 text-primary/40" />
                      <span>{job.company}</span>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black px-4 py-1.5 rounded-full">
                    {job.remote ? "Remote Pro" : "On-Site"}
                  </Badge>
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
                    <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed line-clamp-3 text-muted-foreground font-medium">
                  {job.description ? job.description.replace(/<[^>]*>?/gm, '') : "View full description on the application page."}
                </p>
              </CardContent>
              <CardFooter className="bg-muted/30 p-6 flex justify-between items-center px-8">
                {job.type !== 'community' ? (
                  <Button variant="ghost" size="sm" onClick={() => openTranslation(job.description || job.title)} className="text-[10px] font-black uppercase text-primary/60">
                    <Languages className="h-3.5 w-3.5 mr-1.5" /> Translate
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-black text-secondary uppercase italic">
                    <Award className="h-3.5 w-3.5" /> Direct Community Post
                  </div>
                )}
                <Button className={`rounded-full font-black px-8 h-12 uppercase shadow-lg ${job.type === 'community' ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' : ''}`} asChild>
                  <a href={job.url} target="_blank">{job.type === 'community' ? 'Apply via Globlync' : 'Apply Now'} <ChevronRight className="ml-2 h-4 w-4" /></a>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (!isInitialLoading && !isSearching) ? (
          <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed mx-2 flex flex-col items-center gap-6">
            <Search className="h-16 w-16 text-muted-foreground/20" />
            <p className="text-muted-foreground font-black text-2xl">No matching roles found in Malawi.</p>
            <Button variant="outline" className="rounded-full font-black px-10 h-14" onClick={() => window.location.reload()}>Refresh All Listings</Button>
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
