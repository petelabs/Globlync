
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
  MessageSquare,
  Plus,
  Trash2,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp, query, orderBy, doc } from "firebase/firestore";
import { analyzeJobPhoto } from "@/ai/flows/analyze-job-photo-flow";
import Link from "next/link";

const FREE_LIMIT = 1;
const PRO_LIMIT = 10;
const FREE_SIZE_LIMIT = 2 * 1024 * 1024; // 2MB
const PRO_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

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
  const isPro = profile?.activeBenefits?.some(b => new Date(b.expiresAt) > new Date()) || profile?.referralCount >= 10;
  
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientPhone, setClientPhone] = useState("");
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
          description: `Photo size must be under ${limit / (1024 * 1024)}MB. ${!isPro ? "Upgrade to Pro for 5MB limit." : ""}`,
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
      // Analyze the first photo for primary verification
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
      clientPhone,
      photoUrl: photos[0] || "", // Use first photo as primary
      allPhotos: photos,
      aiVerified: aiAnalysis?.isMatch || false,
      dateCompleted: date.toISOString(),
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const docRef = await addDocumentNonBlocking(jobsRef, newJob);
      const verificationUrl = `${window.location.origin}/v/${user.uid}/${docRef?.id}`;
      setLastGeneratedLink(verificationUrl);
      
      setTitle("");
      setDescription("");
      setPhotos([]);
      setAiAnalysis(null);
      
      toast({ title: "Job Logged Successfully" });
    } catch (e) {}
  };

  const currentLimit = isPro ? PRO_LIMIT : FREE_LIMIT;

  return (
    <div className="flex flex-col gap-6 py-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Evidence Log</h1>
        {!isPro && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-2xl">
            <Crown className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Free users are limited to 1 photo (2MB). <Link href="/pricing" className="text-primary font-bold underline">Upgrade to Pro</Link> for 10 HD photos (5MB).</p>
          </div>
        )}
      </header>

      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="log">Log New Job</TabsTrigger>
          <TabsTrigger value="history">Job History</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Log Completed Work</CardTitle>
                <CardDescription>Details for your client to verify.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJobLog} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input id="job-title" placeholder="e.g. Garden Landscaping" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Date Completed</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus /></PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">What did you do?</Label>
                    <Textarea id="description" placeholder="e.g. Cleared weeds, planted 5 new shrubs..." className="min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} required />
                  </div>

                  <div className="grid gap-2">
                    <Label className="flex justify-between items-center">
                      Job Photos ({photos.length} / {currentLimit})
                      {!isPro && photos.length >= FREE_LIMIT && (
                        <Badge variant="secondary" className="text-[10px]"><Crown className="h-2 w-2 mr-1" /> Pro Required for More</Badge>
                      )}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((uri, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border group">
                          <img src={uri} alt={`Job ${idx}`} className="h-full w-full object-cover" />
                          <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-destructive/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
                          {idx === 0 && <span className="absolute bottom-1 left-1 bg-primary/80 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase">Primary</span>}
                        </div>
                      ))}
                      {photos.length < currentLimit && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-muted/50 transition-colors">
                          <Camera className="h-6 w-6 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Add Photo</span>
                        </button>
                      )}
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    
                    {photos.length > 0 && !aiAnalysis && (
                      <Button type="button" variant="secondary" className="w-full bg-accent text-accent-foreground h-12" onClick={handleAiVerify} disabled={isAnalyzing}>
                        {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        Verify Primary Photo with AI
                      </Button>
                    )}

                    {aiAnalysis && (
                      <div className={cn("flex items-start gap-3 p-4 rounded-xl border-2", aiAnalysis.isMatch ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300")}>
                        {aiAnalysis.isMatch ? <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" /> : <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />}
                        <div className="text-sm">
                          <p className="font-bold">{aiAnalysis.isMatch ? "Proof Accepted" : "Proof Rejected"}</p>
                          <p className="text-muted-foreground text-xs leading-tight mt-1">{aiAnalysis.analysis}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full rounded-full py-6 text-lg mt-4 shadow-lg" disabled={photos.length === 0}>
                    Log Job & Generate Link
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {lastGeneratedLink && (
                <Card className="border-2 border-primary bg-primary/5 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" />Ready for Client</CardTitle>
                    <CardDescription>Share this link to get your verified rating.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-background p-3 border">
                      <code className="text-[10px] truncate flex-1">{lastGeneratedLink}</code>
                      <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(lastGeneratedLink); toast({ title: "Link Copied" }); }}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <Button className="w-full rounded-full h-12 font-bold" onClick={() => {
                      if (navigator.share) navigator.share({ title: 'Verify my work', text: 'Hi, please verify my job:', url: lastGeneratedLink });
                      else window.open(`https://wa.me/?text=${encodeURIComponent(`Hi, please verify my work on Globlync: ${lastGeneratedLink}`)}`, '_blank');
                    }}><Share2 className="h-4 w-4 mr-2" />Share Verification Link</Button>
                  </CardContent>
                </Card>
              )}

              <Card className="border-none bg-muted/30">
                <CardHeader><CardTitle className="text-sm">Maintenance & Support</CardTitle></CardHeader>
                <CardContent className="text-[10px] text-muted-foreground space-y-2">
                  <p>• Your support helps us recover costs for high-speed cloud storage and AI verification.</p>
                  <p>• Free tier: 1 Photo / 2MB. Pro tier: 10 Photos / 5MB.</p>
                  <p>• AI-verified jobs earn +2 extra trust points instantly.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted" /></div>
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="overflow-hidden border-none shadow-sm">
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0">
                      <img src={job.photoUrl || `https://picsum.photos/seed/${job.id}/300/200`} alt={job.title} className="h-full w-full object-cover" />
                      {job.aiVerified && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                          <Sparkles className="h-2 w-2" /> AI Verified
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold">{job.title}</h3>
                        {job.isVerified ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Clock className="h-4 w-4 text-amber-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>
                      <div className="mt-auto pt-4 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="font-bold uppercase tracking-widest">{format(new Date(job.dateCompleted), "MMM d, yyyy")}</span>
                        {job.allPhotos?.length > 1 && <span className="bg-muted px-2 py-0.5 rounded-full">{job.allPhotos.length} Photos</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed"><p className="text-muted-foreground">No jobs logged yet.</p></div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
