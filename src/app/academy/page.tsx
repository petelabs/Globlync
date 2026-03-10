
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Globe, 
  Zap,
  Star,
  Award,
  BookOpen,
  Target,
  Hammer,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

export interface Course {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: "Remote Pro" | "Financial Excellence" | "Reputation Mastery" | "Trade Mastery";
  duration: string;
  reward: number;
  icon: any;
}

/**
 * UNRESTRICTED PROFESSIONAL CONTENT
 * Selected from high-stability educational channels (Google, Khan Academy, Website Learners)
 */
export const COURSES: Course[] = [
  {
    id: "rep-101",
    title: "Digital Reputation & Trust",
    description: "Learn how digital trust is built and why your Globlync score is a lifelong professional asset.",
    youtubeId: "20HeVmvS0sc",
    category: "Reputation Mastery",
    duration: "12 mins",
    reward: 5,
    icon: Target
  },
  {
    id: "rem-101",
    title: "Professional Remote Habits",
    description: "Essential habits and tools for succeeding in the global remote workspace.",
    youtubeId: "nu5p9ZUXpfU",
    category: "Remote Pro",
    duration: "15 mins",
    reward: 5,
    icon: Globe
  },
  {
    id: "fin-101",
    title: "Business Finance Mastery",
    description: "Master the basics of business financial literacy from Khan Academy experts.",
    youtubeId: "ni1B_Hre8_Y",
    category: "Financial Excellence",
    duration: "10 mins",
    reward: 5,
    icon: Zap
  },
  {
    id: "rem-102",
    title: "Building Your Digital Brand",
    description: "Learn how to present your skills online using insights from Website Learners.",
    youtubeId: "27p9In6ZRXM",
    category: "Remote Pro",
    duration: "14 mins",
    reward: 5,
    icon: BookOpen
  },
  {
    id: "trade-101",
    title: "Technical Quality Assurance",
    description: "Global quality standards and technical benchmarks for skilled professional operations.",
    youtubeId: "ZIm_v9_ljRA",
    category: "Trade Mastery",
    duration: "12 mins",
    reward: 5,
    icon: Hammer
  },
  {
    id: "rep-102",
    title: "Evidence-Based Communication",
    description: "How to communicate with global clients using verifiable evidence and professional logs.",
    youtubeId: "nu5p9ZUXpfU",
    category: "Reputation Mastery",
    duration: "11 mins",
    reward: 5,
    icon: ShieldCheck
  }
];

export default function AcademyPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [filter, setCategoryFilter] = useState<string | null>(null);

  const workerRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "workerProfiles", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(workerRef);
  const completedIds = profile?.completedCourses || [];

  const categories = ["Remote Pro", "Financial Excellence", "Reputation Mastery", "Trade Mastery"] as const;

  const filteredCourses = useMemo(() => {
    return filter ? COURSES.filter(c => c.category === filter) : COURSES;
  }, [filter]);

  const pathProgress = useMemo(() => {
    const stats: Record<string, { total: number; done: number }> = {};
    categories.forEach(cat => {
      const total = COURSES.filter(c => c.category === cat).length;
      const done = COURSES.filter(c => c.category === cat && completedIds.includes(c.id)).length;
      stats[cat] = { total, done };
    });
    return stats;
  }, [completedIds]);

  return (
    <div className="flex flex-col gap-8 py-4 max-w-5xl mx-auto px-4 pb-24">
      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          <GraduationCap className="h-3.5 w-3.5" /> Globlync Professional Academy
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">Watch. Learn. <span className="text-primary">Earn.</span></h1>
            <p className="text-muted-foreground text-sm font-medium">Earn Knowledge Points (KP) and boost your Trust Score by mastering global skills.</p>
          </div>
          <div className="bg-primary/5 p-4 rounded-3xl border border-primary/10 flex items-center gap-4 shrink-0">
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Award className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">My Knowledge</p>
              <p className="text-xl font-black">{profile?.knowledgePoints || 0} KP</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button 
          variant={filter === null ? "default" : "outline"} 
          size="sm" 
          className="rounded-full font-bold h-9"
          onClick={() => setCategoryFilter(null)}
        >
          All Paths
        </Button>
        {categories.map(cat => {
          const stats = pathProgress[cat];
          const isFinished = stats.total > 0 && stats.total === stats.done;
          return (
            <Button 
              key={cat}
              variant={filter === cat ? "default" : "outline"} 
              size="sm" 
              className={cn(
                "rounded-full font-bold h-9 gap-2",
                isFinished && "border-green-500 text-green-600 hover:bg-green-50"
              )}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
              {isFinished && <CheckCircle2 className="h-3 w-3" />}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredCourses.map((course) => {
          const isDone = completedIds.includes(course.id);
          const Icon = course.icon;
          
          return (
            <Card key={course.id} className={cn(
              "border-none shadow-sm hover:shadow-xl transition-all rounded-[2rem] overflow-hidden group border-l-8 border-l-transparent",
              isDone && "border-l-green-500 bg-green-50/30"
            )}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-3 rounded-2xl shadow-sm bg-white text-primary", isDone && "text-green-600")}>
                    {isDone ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="text-[8px] font-black uppercase bg-muted/50 text-muted-foreground border-none">
                      {course.category}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
                      <Sparkles className="h-3 w-3" /> +{course.reward} KP {profile?.isPro && "(VIP 2x Active)"}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl font-black leading-tight group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="font-medium text-sm line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {course.duration}</div>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <div className="flex items-center gap-1.5 text-secondary"><Star className="h-3.5 w-3.5 fill-secondary" /> Professional Tier</div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 p-6 flex justify-between items-center">
                {isDone ? (
                  <span className="text-[10px] font-black uppercase text-green-600 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Certification Earned
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Not Started</span>
                )}
                <Button className={cn("rounded-full font-black px-8 h-12 shadow-lg", isDone && "bg-green-600 hover:bg-green-700")} asChild>
                  <Link href={`/academy/${course.id}`}>
                    {isDone ? "Review Course" : "Start Learning"} <Play className="ml-2 h-4 w-4 fill-current" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="border-none bg-primary text-primary-foreground p-10 rounded-[3rem] shadow-xl relative overflow-hidden group mt-8">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Award className="h-40 w-40" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <Badge className="bg-white/20 text-white font-black mb-2 uppercase text-[10px]">Continuous Learning</Badge>
            <h3 className="text-3xl font-black tracking-tight">Master a Path. Unlock a Badge.</h3>
            <p className="text-sm opacity-80 max-w-md font-medium leading-relaxed">
              Complete all masterclasses in any category to earn a <b>Specialist Badge</b> on your profile. High Knowledge Points prove you are ready for global remote work.
            </p>
          </div>
          <div className="bg-white/10 p-6 rounded-[2rem] border border-white/20 backdrop-blur-md flex flex-col items-center gap-2 shrink-0">
             <Star className="h-8 w-8 text-secondary fill-secondary animate-pulse" />
             <p className="text-[10px] font-black uppercase">Verified Expert</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
