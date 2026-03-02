"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the custom install UI after a short delay
      setTimeout(() => setIsVisible(true), 3000);
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
      setIsVisible(false);
    }
    
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 md:bottom-8 md:left-auto md:right-8 md:w-96">
      <Card className="border-primary bg-primary text-primary-foreground shadow-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="bg-white/20 p-2 rounded-xl h-fit">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm leading-none">Get the Globlync App</p>
                <p className="text-[11px] opacity-90">Install to manage your professional reputation directly from your home screen.</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full text-white hover:bg-white/10" 
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleInstallClick} 
              variant="secondary" 
              size="sm" 
              className="flex-1 rounded-full font-bold text-xs h-9"
            >
              <Download className="mr-2 h-3 w-3" />
              Install Now
            </Button>
            <Button 
              onClick={() => setIsVisible(false)} 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-xs text-white hover:bg-white/10"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
