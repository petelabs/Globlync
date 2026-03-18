
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";

/**
 * Messaging is currently paused to ensure permission stability during launch.
 */
export default function ChatDetailRedirect() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-6 text-center px-6">
      <div className="bg-primary/10 p-6 rounded-[2.5rem] animate-float">
        <MessageSquare className="h-16 w-16 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Direct Gateway Paused</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">This channel is currently being encrypted for the Malawian community.</p>
      </div>
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
      <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest" onClick={() => router.replace('/profile')}>
        Return to My Hub
      </Button>
    </div>
  );
}

function Button({ children, ...props }: any) {
  return <button {...props} className={cn("bg-muted px-6 py-2 rounded-full", props.className)}>{children}</button>;
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
