
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Star, Award, TrendingUp, MoreHorizontal } from "lucide-react";

const NOTIFICATIONS = [
  { 
    id: 1, 
    type: "verification", 
    title: "Job Verified!", 
    desc: "Alice Smith verified 'Kitchen Leak Fix'. Your score increased by +2.", 
    time: "2 hours ago", 
    isNew: true,
    icon: CheckCircle2,
    color: "text-green-500"
  },
  { 
    id: 2, 
    type: "rating", 
    title: "New 5-Star Rating", 
    desc: "Bob Wilson left a 5-star review for your electrical work.", 
    time: "Yesterday", 
    isNew: true,
    icon: Star,
    color: "text-amber-500"
  },
  { 
    id: 3, 
    type: "badge", 
    title: "New Badge Earned", 
    desc: "You've earned the 'Reliable Worker' Silver badge!", 
    time: "2 days ago", 
    isNew: false,
    icon: Award,
    color: "text-primary"
  },
  { 
    id: 4, 
    type: "system", 
    title: "Trust Score Updated", 
    desc: "You reached Tier 2 Gold reputation. More clients can now see you.", 
    time: "1 week ago", 
    isNew: false,
    icon: TrendingUp,
    color: "text-primary"
  },
];

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your reputation growth.</p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </header>

      <div className="grid gap-3">
        {NOTIFICATIONS.map((n) => (
          <Card key={n.id} className={`border-none shadow-sm transition-colors hover:bg-muted/30 ${n.isNew ? 'bg-accent/30' : ''}`}>
            <CardContent className="p-4 flex gap-4">
              <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm shrink-0`}>
                <n.icon className={`h-6 w-6 ${n.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold">{n.title}</h3>
                  <span className="text-[10px] font-medium text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{n.desc}</p>
              </div>
              {n.isNew && (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="w-full rounded-full mt-4">Mark All as Read</Button>
    </div>
  );
}
