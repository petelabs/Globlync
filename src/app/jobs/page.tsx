
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Camera, CheckCircle2, QrCode, Send, Clock, MapPin, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp, query, orderBy } from "firebase/firestore";

export default function JobsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientPhone, setClientPhone] = useState("");
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

  const handleJobLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobsRef || !user) return;

    const newJob = {
      workerId: user.uid,
      title,
      description,
      clientPhone,
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
      title: "Link Copied",
      description: "You can now paste it into an SMS or WhatsApp message.",
    });
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <header>
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <p className="text-muted-foreground">Log your work and get client verifications to build your Trust Score.</p>
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
                <CardDescription>Enter details to generate a verification link for your client.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJobLog} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="job-title">Job Title / Type of Work</Label>
                    <Input 
                      id="job-title" 
                      placeholder="e.g. Kitchen Sink Repair" 
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
                    <Label htmlFor="client-phone">Client Phone Number (for your records)</Label>
                    <Input 
                      id="client-phone" 
                      type="tel" 
                      placeholder="+1 234 567 8900" 
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Briefly describe what you did..." 
                      className="min-h-[80px]" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full rounded-full py-6 text-lg">
                    Log Job & Get Link
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {lastGeneratedLink && (
                <Card className="border-2 border-primary bg-primary/5 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-primary" />
                      Verification Ready
                    </CardTitle>
                    <CardDescription>Send this link to your client to get verified.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="flex items-center gap-2 rounded-lg bg-background p-3 border">
                      <code className="text-xs truncate flex-1">{lastGeneratedLink}</code>
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(lastGeneratedLink)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 rounded-full" onClick={() => window.open(`sms:${clientPhone}?body=Hi! Please verify the work I completed for you: ${lastGeneratedLink}`)}>
                        Send via SMS
                      </Button>
                      <Button variant="outline" className="flex-1 rounded-full" asChild>
                        <a href={lastGeneratedLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" /> Preview
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-none bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-sm">Why Verify?</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>• Verified jobs boost your Trust Score by +5 points.</p>
                  <p>• Clients are 3x more likely to hire workers with verified proof.</p>
                  <p>• Verified ratings unlock exclusive milestone badges.</p>
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
                          src={`https://picsum.photos/seed/${job.id}/300/200`} 
                          alt={job.title} 
                          className="h-full w-full object-cover"
                          data-ai-hint="construction work"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.description}</p>
                          </div>
                          {job.isVerified ? (
                            <Badge className="bg-primary hover:bg-primary/90">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                              <Clock className="mr-1 h-3 w-3" /> Pending
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" /> {format(new Date(job.dateCompleted), "PPP")}
                          </span>
                        </div>
                        
                        {!job.isVerified && (
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="secondary" className="flex-1 rounded-full" onClick={() => copyToClipboard(`${window.location.origin}/v/${user?.uid}/${job.id}`)}>
                              <Send className="mr-2 h-3 w-3" /> Copy Link
                            </Button>
                          </div>
                        )}
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
