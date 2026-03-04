
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  CheckCircle2, 
  Star, 
  Award, 
  TrendingUp, 
  MoreHorizontal, 
  Loader2, 
  Info, 
  Sparkles,
  Trash2,
  Check
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { formatDistanceToNow, subHours, subDays } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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

export default function NotificationsPage() {
  const { user } = useUser();
  const db = useFirestore();

  const notificationsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "workerProfiles", user.uid, "notifications");
  }, [db, user?.uid]);

  const notificationsQuery = useMemoFirebase(() => {
    if (!notificationsRef) return null;
    return query(notificationsRef, orderBy("createdAt", "desc"), limit(30));
  }, [notificationsRef]);

  const { data: notifications, isLoading } = useCollection(notificationsQuery);

  const markAllAsRead = () => {
    if (!notifications) return;
    notifications.forEach(n => {
      if (!n.isRead && notificationsRef) {
        updateDocumentNonBlocking(doc(notificationsRef, n.id), { isRead: true });
      }
    });
  };

  const markAsRead = (id: string) => {
    if (notificationsRef) {
      updateDocumentNonBlocking(doc(notificationsRef, id), { isRead: true });
    }
  };

  const deleteNotification = (id: string) => {
    if (notificationsRef) {
      deleteDocumentNonBlocking(doc(notificationsRef, id));
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your reputation growth.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={markAllAsRead}>Mark all as read</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted" /></div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n) => {
            const Icon = ICON_MAP[n.type] || Bell;
            const colorClass = COLOR_MAP[n.type] || "text-muted-foreground";
            const dateStr = n.createdAt?.seconds 
                ? formatDistanceToNow(new Date(n.createdAt.seconds * 1000), { addSuffix: true }) 
                : "just now";
            
            return (
              <Card key={n.id} className={`group border-none shadow-sm transition-all hover:bg-muted/30 ${!n.isRead ? 'bg-accent/30' : ''}`}>
                <CardContent className="p-4 flex gap-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm shrink-0">
                    <Icon className={`h-6 w-6 ${colorClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[10px] uppercase tracking-widest opacity-70">{n.type.replace('_', ' ')}</h3>
                      <span className="text-[10px] font-medium text-muted-foreground">{dateStr}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                    <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-tighter" onClick={() => markAsRead(n.id)}>
                          <Check className="h-3 w-3 mr-1" /> Mark Read
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-tighter text-destructive hover:text-destructive" onClick={() => deleteNotification(n.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
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
            <p className="text-muted-foreground">Your inbox is clear! Check back later for updates.</p>
          </div>
        )}
      </div>

      {notifications && notifications.some(n => !n.isRead) && (
        <Button variant="outline" className="w-full rounded-full mt-4" onClick={markAllAsRead}>
          Mark All as Read
        </Button>
      )}
    </div>
  );
}
