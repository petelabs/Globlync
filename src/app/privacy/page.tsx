"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col gap-6 py-8 max-w-3xl mx-auto px-4">
      <Button variant="ghost" size="sm" asChild className="w-fit mb-4">
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-xl">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter">Privacy Policy</h1>
      </div>

      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle>Data Protection & Transparency</CardTitle>
          <p className="text-xs text-muted-foreground font-bold">Last Updated: March 1, 2026</p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed p-8">
          <section>
            <h3 className="text-lg font-black mb-2 text-primary">1. Information Collection</h3>
            <p>Globlync collects minimal data to build your professional reputation. This includes your name, email, and trade skills. For Reward Center users, we may share non-sensitive demographic data with partners like Adscend Media to provide relevant tasks.</p>
          </section>

          <section>
            <h3 className="text-lg font-black mb-2 text-primary">2. Reward Center Usage</h3>
            <p>When you participate in our Reward Center to earn "VIP Status," third-party networks may collect data such as IP addresses or device IDs to verify task completion. This is governed by their respective privacy policies.</p>
          </section>

          <section>
            <h3 className="text-lg font-black mb-2 text-primary">3. Professional Verification</h3>
            <p>Photos uploaded for job logs are used strictly for AI-based skill verification and are displayed on your public profile to build trust with clients.</p>
          </section>

          <section>
            <h3 className="text-lg font-black mb-2 text-primary">4. Data Rights</h3>
            <p>You have the absolute right to delete your profile and all associated logs at any time via the Settings page. This permanently removes your data from our active databases.</p>
          </section>
        </CardContent>
      </Card>
      
      <footer className="text-center text-[10px] text-muted-foreground mt-8 font-black uppercase tracking-widest">
        © 2026 Petediano Tech • Malawi
      </footer>
    </div>
  );
}
