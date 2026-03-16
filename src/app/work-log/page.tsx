
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Work Log has been deprecated to focus on social networking and the Feed.
 */
export default function WorkLogRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/feed");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Redirecting to Social Feed...</p>
    </div>
  );
}
