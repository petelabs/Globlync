
"use client";

import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  Camera, 
  CheckCircle2, 
  Send, 
  Clock, 
  Copy, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Share2,
  Plus,
  Trash2,
  Crown,
  Facebook,
  Twitter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp, query, orderBy, doc } from "firebase/firestore";
import { analyzeJobPhoto } from "@/ai/flows/analyze-job-photo-flow";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const FREE_LIMIT = 1;
const PRO_LIMIT = 10;
const FREE_SIZE_LIMIT = 5 * 1024 * 1024; // Increased to 5MB
const PRO_SIZE_LIMIT = 10 * 1024 * 1024; // Increased to 10MB

// Official WhatsApp Logo as Inline SVG
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function WorkLogPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);
  const isPro = profile?.activeBenefits?.some(b => new Date(b.expiresAt) > new Date()) || (profile?.referralCount || 0) >= 10;
  
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ isMatch: boolean; analysis: string } | null>(null);
  const [lastGeneratedLink, setLastGeneratedLink] = useState<string | null>(null);

  const jobsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "jobs");
  }, [db, user?.uid]);

  const jobsQuery = useMemoFirebase(() => {
    if (!jobsRef) return null;
    return query(jobsRef, orderBy("createdAt", "desc"));
  }, [jobsRef]);

  const { data: jobs, isLoading } = useCollection(jobsQuery);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const limit = isPro ? PRO_SIZE_LIMIT : FREE_SIZE_LIMIT;
      if (file.size > limit) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: `Photo size must be under ${limit / (1024 * 1024)}MB. Upgrade to VIP for higher limits.`,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
        setAiAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setAiAnalysis(null);
  };

  const handleAiVerify = async () => {
    if (photos.length === 0 || !description) {
      toast({
        variant: "destructive",
        title: "Information Required",
        description: "Please provide a description and at least one photo first.",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeJobPhoto({
        photoDataUri: photos[0],
        description
      });
      setAiAnalysis(result);
      if (result.isMatch) {
        toast({ title: "AI Verified!", description: "Gemini confirms your primary photo matches the work." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Analysis Failed", description: "Could not verify photo." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleJobLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobsRef || !user) return;

    const newJob = {
      workerId: user.uid,
      title,
      description,
      photoUrl: photos[0] || "",
      allPhotos: photos,
      aiVerified: aiAnalysis?.isMatch || false,
      dateCompleted: date.toISOString(),
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDocumentNonBlocking(jobsRef, newJob);
      if (docRef) {
        // Build professional domain link
        const verificationUrl = `https://globlync.vercel.app/v/${user.uid}/${docRef.id}`;
        setLastGeneratedLink(verificationUrl);
        
        setTitle("");
        setDescription("");
        setPhotos([]);
        setAiAnalysis(null);
        
        toast({ title: "Job Logged Successfully" });
      }
    } catch (e) {}
  };

  const shareNative = async () => {
    if (!lastGeneratedLink) return;
    const shareData = {
      title: 'Verify My Work on Globlync',
      text: `Hi! I've completed the "${title}" job. Please verify it here:`,
      url: lastGeneratedLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const shareWhatsApp = () => {
    if (!lastGeneratedLink) return;
    const text = encodeURIComponent(`Hi! Please verify my work completion on Globlync for "${title}": ${lastGeneratedLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareFacebook = () => {
    if (!lastGeneratedLink) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(lastGeneratedLink)}`;
    window.open(url, '_blank');
  };

  const shareTwitter = () => {
    if (!lastGeneratedLink) return;
    const text = encodeURIComponent(`Verify my professional work on Globlync! #skilledworker #globlync`);
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(lastGeneratedLink)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    if (!lastGeneratedLink) return;
    navigator.clipboard.writeText(lastGeneratedLink);
    toast({ title: "Link Copied", description: "Ready to paste anywhere." });
  };

  const currentLimit = isPro ? PRO_LIMIT : FREE_LIMIT;

  return (
    <div className="flex flex-col gap-6 py-4 px-2">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Evidence Log</h1>
        {!isPro && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-2xl">
            <Crown className="h-4 w-4 text-primary" />
            <p className="text-[10px] sm:text-xs text-muted-foreground">Standard limit: 5MB per photo. <Link href="/pricing" className="text-primary font-bold underline">Upgrade to VIP</Link> for 10MB limit.</p>
          </div>
        )}
      </header>

      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="log" className="rounded-lg font-bold">Log New Job</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg font-bold">Job History</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none shadow-md rounded-[2rem]">
              <CardHeader>
                <CardTitle className="text-xl">Log Completed Work</CardTitle>
                <CardDescription>Details for your client to verify your expertise.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJobLog} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="job-title" className="text-[10px] font-black uppercase tracking-widest ml-1">Job Title</Label>
                    <Input id="job-title" placeholder="e.g. Garden Landscaping" value={title} onChange={(e) => setTitle(e.target.value)} required className="h-12 rounded-xl" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Date Completed</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal h-12 rounded-xl", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden"><Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus /></PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest ml-1">Work Description</Label>
                    <Textarea id="description" placeholder="e.g. Cleared weeds, planted 5 new shrubs..." className="min-h-[80px] rounded-xl" value={description} onChange={(e) => setDescription(e.target.value)} required />
                  </div>

                  <div className="grid gap-2">
                    <Label className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest ml-1">
                      Job Photos ({photos.length} / {currentLimit})
                      {!isPro && photos.length >= FREE_LIMIT && (
                        <Badge variant="secondary" className="text-[8px] bg-secondary/20 text-secondary border-none"><Crown className="h-2 w-2 mr-1" /> VIP Required</Badge>
                      )}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((uri, idx) => (
                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border group">
                          <img src={uri} alt={`Job ${idx}`} className="h-full w-full object-cover" />
                          <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><Trash2 className="h-3 w-3" /></button>
                          {idx === 0 && <span className="absolute bottom-2 left-2 bg-primary/90 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase shadow-lg">Primary</span>}
                        </div>
                      ))}
                      {photos.length < currentLimit && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all group">
                          <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary">Add Photo</span>
                        </button>
                      )}
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    
                    {photos.length > 0 && !aiAnalysis && (
                      <Button type="button" variant="secondary" className="w-full bg-accent text-accent-foreground h-14 rounded-xl font-bold shadow-sm" onClick={handleAiVerify} disabled={isAnalyzing}>
                        {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        AI Quality Analysis
                      </Button>
                    )}

                    {aiAnalysis && (
                      <div className={cn("flex items-start gap-3 p-4 rounded-2xl border-2", aiAnalysis.isMatch ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200")}>
                        {aiAnalysis.isMatch ? <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" /> : <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />}
                        <div className="text-sm">
                          <p className="font-black text-xs uppercase tracking-tight">{aiAnalysis.isMatch ? "Proof Accepted" : "AI Flags Review"}</p>
                          <p className="text-muted-foreground text-[11px] font-medium leading-tight mt-1">{aiAnalysis.analysis}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full rounded-full py-8 text-xl mt-4 shadow-xl font-black" disabled={photos.length === 0}>
                    Log & Create Client Link
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {lastGeneratedLink && (
                <Card className="border-2 border-primary bg-primary/5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl font-black"><Send className="h-6 w-6 text-primary" />Verify Ready!</CardTitle>
                    <CardDescription className="text-sm font-medium">Share this unique link with your client to build your score.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 px-8">
                    <div className="flex items-center gap-2 rounded-2xl bg-white p-4 border-2 border-primary/10 group shadow-inner">
                      <code className="text-xs truncate flex-1 font-mono text-primary font-bold">{lastGeneratedLink}</code>
                      <Button size="icon" variant="ghost" onClick={copyToClipboard} className="h-10 w-10 text-primary">
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black h-14 text-lg shadow-lg" onClick={shareWhatsApp}>
                        <WhatsAppIcon className="mr-2 h-6 w-6" /> WhatsApp
                      </Button>
                      <Button variant="outline" className="rounded-full h-14 border-primary text-primary font-black text-lg shadow-sm" onClick={shareNative}>
                        <Share2 className="mr-2 h-6 w-6" /> Share
                      </Button>
                    </div>

                    <div className="flex justify-center gap-6 pb-2">
                      <button onClick={shareFacebook} className="p-4 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform shadow-xl">
                        <Facebook className="h-6 w-6" />
                      </button>
                      <button onClick={shareTwitter} className="p-4 bg-black text-white rounded-full hover:scale-110 transition-transform shadow-xl">
                        <Twitter className="h-6 w-6" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-none bg-muted/30 rounded-[2rem]">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest opacity-70">Trust Transparency</CardTitle></CardHeader>
                <CardContent className="text-[11px] text-muted-foreground space-y-3 px-6 pb-8">
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                    <p>Your unique link allows clients to verify work without signing in, protecting your reputation.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                    <p>Every verified job adds significant points to your global <span className="font-black">National Trust Score</span>.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                    <p>VIP status unlocks high-speed storage for 10 HD photos per job log.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary/30" /></div>
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="overflow-hidden border-none shadow-sm group hover:shadow-xl transition-all rounded-3xl">
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="relative aspect-video w-full sm:w-56 bg-muted shrink-0">
                      <img src={job.photoUrl || `https://picsum.photos/seed/${job.id}/300/200`} alt={job.title} className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-700" />
                      {job.aiVerified && (
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                          <Sparkles className="h-3 w-3" /> AI VERIFIED
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-xl group-hover:text-primary transition-colors leading-tight">{job.title}</h3>
                        {job.isVerified ? (
                          <div className="bg-green-500/10 text-green-600 p-1.5 rounded-full"><CheckCircle2 className="h-5 w-5" /></div>
                        ) : (
                          <div className="bg-amber-500/10 text-amber-600 p-1.5 rounded-full"><Clock className="h-5 w-5" /></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>
                      <div className="mt-auto pt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-bold uppercase tracking-widest text-[9px] text-muted-foreground">{format(new Date(job.dateCompleted), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="outline" size="sm" className="h-8 rounded-full text-[10px] uppercase font-black px-4 border-primary/20 hover:border-primary text-primary" onClick={() => {
                             const url = `https://globlync.vercel.app/v/${user.uid}/${job.id}`;
                             navigator.clipboard.writeText(url);
                             toast({ title: "Link Copied", description: "Verification link is ready to share." });
                           }}>
                             <Copy className="h-3.5 w-3.5 mr-2" /> Share Link
                           </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-24 bg-muted/20 rounded-[3rem] border-4 border-dashed border-muted flex flex-col items-center gap-4">
                <div className="bg-white p-6 rounded-full shadow-inner"><Plus className="h-12 w-12 text-muted-foreground/30" /></div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-black text-lg">No jobs logged yet.</p>
                  <p className="text-xs text-muted-foreground/60 max-w-[200px] mx-auto">Start building your national portfolio by logging your first job today!</p>
                </div>
                <Button className="rounded-full mt-2 font-black px-8" onClick={() => document.querySelector('[value="log"]')?.click()}>Log My First Job</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
