
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Feed has been removed to focus on direct professional profile building.
 */
export default function FeedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Redirecting to Professional Hub...</p>
    </div>
  );
}
