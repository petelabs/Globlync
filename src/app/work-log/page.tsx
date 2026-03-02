"use client";

import { useState, useRef } from "react";
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
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp, query, orderBy } from "firebase/firestore";
import { analyzeJobPhoto } from "@/ai/flows/analyze-job-photo-flow";

export default function WorkLogPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string);
        setAiAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiVerify = async () => {
    if (!photoDataUri || !description) {
      toast({
        variant: "destructive",
        title: "Information Required",
        description: "Please provide a description and a photo first.",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeJobPhoto({
        photoDataUri,
        description
      });
      setAiAnalysis(result);
      if (result.isMatch) {
        toast({
          title: "AI Verified!",
          description: "Gemini confirms your photo matches the work described.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not verify photo at this time.",
      });
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
      photoUrl: photoDataUri || "",
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
      setClientPhone("");
      setPhotoDataUri(null);
      setAiAnalysis(null);
      
      toast({
        title: "Job Logged Successfully",
        description: "Verification link generated below.",
      });
    } catch (e) {
      // Error handled by global emitter
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link Copies",
      description: "Send this to your client to get verified.",
    });
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <header>
        <h1 className="text-3xl font-bold">Evidence Log</h1>
        <p className="text-muted-foreground">Log your completed work, verify with AI, and build your trust score.</p>
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
                    <Input 
                      id="job-title" 
                      placeholder="e.g. Garden Landscaping" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Date Completed</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => d && setDate(d)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">What did you do?</Label>
                    <Textarea 
                      id="description" 
                      placeholder="e.g. Cleared weeds, planted 5 new shrubs..." 
                      className="min-h-[80px]" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Job Photo (Proof of work)</Label>
                    <div className="flex flex-col gap-3">
                      {photoDataUri ? (
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                          <img src={photoDataUri} alt="Preview" className="h-full w-full object-cover" />
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            className="absolute top-2 right-2 rounded-full opacity-90 hover:opacity-100"
                            onClick={() => setPhotoDataUri(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-32 border-dashed border-2 flex flex-col gap-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Upload or take a photo</span>
                        </Button>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                      
                      {photoDataUri && !aiAnalysis && (
                        <Button 
                          type="button" 
                          variant="secondary" 
                          className="w-full bg-accent text-accent-foreground"
                          onClick={handleAiVerify}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                          Verify Photo with AI
                        </Button>
                      )}

                      {aiAnalysis && (
                        <div className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border",
                          aiAnalysis.isMatch ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                        )}>
                          {aiAnalysis.isMatch ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />}
                          <div className="text-xs">
                            <p className="font-bold">{aiAnalysis.isMatch ? "AI Verified" : "AI Review Needed"}</p>
                            <p className="text-muted-foreground">{aiAnalysis.analysis}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full rounded-full py-6 text-lg mt-4 shadow-lg">
                    Log Job & Generate Link
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {lastGeneratedLink && (
                <Card className="border-2 border-primary bg-primary/5 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-primary" />
                      Ready for Client
                    </CardTitle>
                    <CardDescription>Share this link to get your verified rating.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="flex items-center gap-2 rounded-lg bg-background p-3 border">
                      <code className="text-[10px] truncate flex-1">{lastGeneratedLink}</code>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(lastGeneratedLink)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button className="w-full rounded-full" onClick={() => copyToClipboard(lastGeneratedLink)}>
                      Copy Link for SMS/WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="border-none bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-sm">Why AI Verification?</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>• AI-verified photos increase your Trust Score by +2 extra points.</p>
                  <p>• It prevents disputes by providing instant proof of completion.</p>
                  <p>• Verified photos help you earn "Evidence Master" badges.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-4">
            {isLoading ? (
              <p className="text-center py-10">Loading jobs...</p>
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="overflow-hidden border-none shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0">
                        <img 
                          src={job.photoUrl || `https://picsum.photos/seed/${job.id}/300/200`} 
                          alt={job.title} 
                          className="h-full w-full object-cover"
                          data-ai-hint="construction work"
                        />
                        {job.aiVerified && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <Sparkles className="h-2 w-2" /> AI Verified
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold">{job.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{job.description}</p>
                          </div>
                          {job.isVerified ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                        
                        <div className="mt-auto flex items-center gap-4 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1 uppercase tracking-wider">
                            <CalendarIcon className="h-3 w-3" /> {format(new Date(job.dateCompleted), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground">No jobs logged yet. Log your first job to start building trust!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
