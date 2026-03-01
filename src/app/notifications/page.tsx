"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Star, Award, TrendingUp, MoreHorizontal, Loader2 } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP: Record<string, any> = {
  'job_verified': CheckCircle2,
  'new_rating': Star,
  'profile_update': TrendingUp,
  'badge_earned': Award,
};

const COLOR_MAP: Record<string, string> = {
  'job_verified': "text-green-500",
  'new_rating': "text-amber-500",
  'profile_update': "text-primary",
  'badge_earned': "text-primary",
};

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

  const { data: notifications, isLoading } = useCollection(notificationsQuery);

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
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n) => {
            const Icon = ICON_MAP[n.type] || Bell;
            const colorClass = COLOR_MAP[n.type] || "text-muted-foreground";
            
            return (
              <Card key={n.id} className={`border-none shadow-sm transition-colors hover:bg-muted/30 ${!n.isRead ? 'bg-accent/30' : ''}`}>
                <CardContent className="p-4 flex gap-4">
                  <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm shrink-0`}>
                    <Icon className={`h-6 w-6 ${colorClass}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold">{n.type.replace('_', ' ').toUpperCase()}</h3>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {n.createdAt ? formatDistanceToNow(new Date(n.createdAt.seconds * 1000), { addSuffix: true }) : "just now"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
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

      {notifications && notifications.length > 0 && (
        <Button variant="outline" className="w-full rounded-full mt-4">Mark All as Read</Button>
      )}
    </div>
  );
}
