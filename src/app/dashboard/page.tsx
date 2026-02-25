
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PlusCircle, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  QrCode, 
  History, 
  Award,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { month: "Jan", jobs: 4 },
  { month: "Feb", jobs: 6 },
  { month: "Mar", jobs: 8 },
  { month: "Apr", jobs: 5 },
  { month: "May", jobs: 9 },
  { month: "Jun", jobs: 12 },
];

const chartConfig = {
  jobs: {
    label: "Verified Jobs",
    color: "hsl(var(--primary))",
  },
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, John</h1>
          <p className="text-muted-foreground">Your reputation is growing. 3 new verifications this week.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/public/john-doe">
              <QrCode className="mr-2 h-4 w-4" />
              Public QR
            </Link>
          </Button>
          <Button size="sm" className="rounded-full" asChild>
            <Link href="/jobs">
              <PlusCircle className="mr-2 h-4 w-4" />
              Log New Job
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Trust Score Card */}
        <Card className="md:col-span-4 bg-primary text-primary-foreground border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trust Score
            </CardTitle>
            <CardDescription className="text-primary-foreground/70">Calculated from 24 verified jobs</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="text-white/20"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-secondary"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - 0.82)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black">82</span>
                <span className="text-xs font-bold uppercase opacity-70">Gold Tier</span>
              </div>
            </div>
            <p className="mt-6 text-sm">You are in the top 5% of plumbers in your area.</p>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Verification History</CardTitle>
            <CardDescription>Verified jobs completed over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="month" hide />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="jobs" fill="var(--color-jobs)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Achievements / Badges */}
        <Card className="md:col-span-12">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Milestones & Badges</CardTitle>
              <CardDescription>Achievements earned for high-quality work</CardDescription>
            </div>
            <Award className="h-6 w-6 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {[
                { name: "Top Rated", level: "Gold", icon: Star },
                { name: "Quick Response", level: "Silver", icon: CheckCircle2 },
                { name: "Reliable Worker", level: "Platinum", icon: Award },
                { name: "First 10 Jobs", level: "Bronze", icon: History },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-2 rounded-xl bg-accent p-4 transition-transform hover:scale-105">
                  <badge.icon className="h-8 w-8 text-primary" />
                  <span className="text-xs font-bold text-primary">{badge.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{badge.level}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card className="md:col-span-12">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Verified Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              { client: "Alice Smith", job: "Kitchen Pipe Repair", date: "2 hours ago", rating: 5 },
              { client: "Bob Wilson", job: "Full Bathroom Install", date: "Yesterday", rating: 4 },
              { client: "Charity Health Clinic", job: "Emergency Drain Cleared", date: "3 days ago", rating: 5 },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4 shadow-sm transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">{activity.job}</h4>
                    <p className="text-sm text-muted-foreground">For {activity.client} • {activity.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="text-sm font-bold">{activity.rating}.0</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
