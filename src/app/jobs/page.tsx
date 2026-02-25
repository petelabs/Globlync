
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
import { CalendarIcon, Camera, CheckCircle2, QrCode, Send, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function JobsPage() {
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const handleJobLog = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Job Logged Successfully",
      description: "Now share the verification link with your client.",
    });
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <header>
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <p className="text-muted-foreground">Log your work and get client verifications.</p>
      </header>

      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="log">Log New Job</TabsTrigger>
          <TabsTrigger value="history">Job History</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <Card className="max-w-2xl mx-auto border-none shadow-md">
            <CardHeader>
              <CardTitle>Log Completed Work</CardTitle>
              <CardDescription>Enter details about your job to generate a verification request.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJobLog} className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="job-title">Job Title / Skill</Label>
                  <Input id="job-title" placeholder="e.g. Toilet Repair, House Painting" required />
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
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="client-phone">Client Phone Number (for SMS verification)</Label>
                  <Input id="client-phone" type="tel" placeholder="+1 234 567 8900" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea id="description" placeholder="Describe what you did..." className="min-h-[100px]" />
                </div>

                <div className="grid gap-2">
                  <Label>Job Photos (Optional)</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground font-semibold">Click to upload photo</p>
                      </div>
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-full py-6 text-lg">
                  Generate Verification Link
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-4">
            {[
              { 
                id: "1", 
                title: "Roof Leak Fix", 
                client: "Sarah Miller", 
                date: "Oct 12, 2023", 
                status: "verified", 
                location: "Downtown" 
              },
              { 
                id: "2", 
                title: "Electrical Rewiring", 
                client: "Grand Hotel", 
                date: "Oct 08, 2023", 
                status: "pending", 
                location: "West Side" 
              },
              { 
                id: "3", 
                title: "Kitchen Tiling", 
                client: "David Jones", 
                date: "Sep 28, 2023", 
                status: "verified", 
                location: "North Suburbs" 
              },
            ].map((job) => (
              <Card key={job.id} className="overflow-hidden border-none shadow-sm">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative aspect-video w-full sm:w-48 bg-muted shrink-0">
                      <img 
                        src={`https://picsum.photos/seed/job-${job.id}/300/200`} 
                        alt={job.title} 
                        className="h-full w-full object-cover"
                        data-ai-hint="construction work"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">Client: {job.client}</p>
                        </div>
                        {job.status === "verified" ? (
                          <Badge className="bg-primary hover:bg-primary/90">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            <Clock className="mr-1 h-3 w-3" /> Pending Verification
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" /> {job.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                      </div>
                      
                      {job.status === "pending" && (
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="secondary" className="flex-1 rounded-full">
                            <Send className="mr-2 h-3 w-3" /> Resend SMS
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 rounded-full">
                            <QrCode className="mr-2 h-3 w-3" /> Show QR
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
