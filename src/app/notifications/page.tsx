"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Star, Award, TrendingUp, MoreHorizontal, Loader2, Info, Sparkles } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow, subHours, subDays } from "date-fns";

const ICON_MAP: Record<string, any> = {
  'job_verified': CheckCircle2,
  'new_rating': Star,
  'profile_update': TrendingUp,
  'badge_earned': Award,
  'system': Info,
  'app': Sparkles,
};

const COLOR_MAP: Record<string, string> = {
  'job_verified': "text-green-500",
  'new_rating': "text-amber-500",
  'profile_update': "text-primary",
  'badge_earned': "text-primary",
  'system': "text-blue-500",
  'app': "text-secondary",
};

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'sys-1',
    type: 'system',
    message: 'Welcome to Globlync! Build your professional reputation with every verified job.',
    isRead: false,
    createdAt: subHours(new Date(), 2),
  },
  {
    id: 'app-1',
    type: 'app',
    message: 'New Feature: AI Photo Verification is now live. Every AI-proven job boosts your Trust Score.',
    isRead: false,
    createdAt: subDays(new Date(), 1),
  },
  {
    id: 'sys-2',
    type: 'system',
    message: 'Tip: Share your Public Profile on WhatsApp to show clients your verified expertise.',
    isRead: false,
    createdAt: subDays(new Date(), 2),
  }
];

export default function NotificationsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const notificationsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "notifications");
  }, [db, user?.uid]);

  const notificationsQuery = useMemoFirebase(() => {
    if (!notificationsRef) return null;
    return query(notificationsRef, orderBy("createdAt", "desc"), limit(20));
  }, [notificationsRef]);

  const { data: dbNotifications, isLoading } = useCollection(notificationsQuery);

  const displayNotifications = [
    ...(dbNotifications || []),
    ...DEFAULT_NOTIFICATIONS
  ].sort((a, b) => {
    const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
    const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
    return timeB - timeA;
  });

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
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted" /></div>
        ) : displayNotifications.length > 0 ? (
          displayNotifications.map((n) => {
            const Icon = ICON_MAP[n.type] || Bell;
            const colorClass = COLOR_MAP[n.type] || "text-muted-foreground";
            const dateStr = n.createdAt instanceof Date 
              ? formatDistanceToNow(n.createdAt, { addSuffix: true })
              : n.createdAt?.seconds 
                ? formatDistanceToNow(new Date(n.createdAt.seconds * 1000), { addSuffix: true }) 
                : "just now";
            
            return (
              <Card key={n.id} className={`border-none shadow-sm transition-colors hover:bg-muted/30 ${!n.isRead ? 'bg-accent/30' : ''}`}>
                <CardContent className="p-4 flex gap-4">
                  <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm shrink-0`}>
                    <Icon className={`h-6 w-6 ${colorClass}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-xs uppercase tracking-tight">{n.type.replace('_', ' ')} Notification</h3>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {dateStr}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground">No notifications yet. Complete jobs to start seeing updates!</p>
          </div>
        )}
      </div>

      {displayNotifications.length > 0 && (
        <Button variant="outline" className="w-full rounded-full mt-4">Mark All as Read</Button>
      )}
    </div>
  );
}
