
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, X } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the custom install UI
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsVisible(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 md:bottom-8 md:left-auto md:right-8 md:w-80">
      <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-2xl flex flex-col gap-3 border border-white/20">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Install Globlync</p>
              <p className="text-[10px] opacity-80">Access your reputation faster from your home screen.</p>
            </div>
          </div>
          <button onClick={() => setIsVisible(false)} className="opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Button 
          onClick={handleInstallClick} 
          variant="secondary" 
          size="sm" 
          className="w-full rounded-full font-bold text-xs h-9"
        >
          Install Now
        </Button>
      </div>
    </div>
  );
}
