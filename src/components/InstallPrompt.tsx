
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Custom PWA Install Prompt.
 * Catches the 'beforeinstallprompt' event to provide a robust install button for Android 9+ users.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the browser's default mini-infobar
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the custom UI
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native install prompt
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
    <div className="fixed bottom-20 left-4 right-4 z-[100] animate-in slide-in-from-bottom-10 md:bottom-8 md:left-auto md:right-8 md:w-96">
      <Card className="border-primary bg-primary text-primary-foreground shadow-2xl overflow-hidden rounded-[2rem]">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="bg-white/20 p-2.5 rounded-2xl h-fit shadow-inner">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-black text-sm leading-tight uppercase tracking-tight">Globlync App Ready</p>
                <p className="text-[11px] opacity-90 font-medium leading-tight">Install for a faster experience and instant reputation alerts.</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-white hover:bg-white/10 shrink-0" 
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleInstallClick} 
              variant="secondary" 
              className="flex-1 rounded-full font-black text-[10px] uppercase h-11 shadow-lg tracking-widest"
            >
              <Download className="mr-2 h-4 w-4" />
              Install Now
            </Button>
            <Button 
              onClick={() => setIsVisible(false)} 
              variant="ghost" 
              className="flex-1 text-[10px] font-black uppercase text-white hover:bg-white/10 h-11"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
