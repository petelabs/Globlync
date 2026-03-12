"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, ShieldCheck, Coins } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col gap-6 py-8 max-w-3xl mx-auto px-4">
      <Button variant="ghost" size="sm" asChild className="w-fit mb-4">
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-xl">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter">Terms of Service</h1>
      </div>

      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-muted/30 p-8">
          <CardTitle>Professional User Agreement</CardTitle>
          <p className="text-xs text-muted-foreground font-bold">Effective Date: March 1, 2026</p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed p-8">
          <section>
            <h3 className="text-lg font-black mb-3 text-primary flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> 1. Service Description
            </h3>
            <p>Globlync provides a digital, evidence-based reputation platform for global professionals. Users build "Trust Scores" through verified work logs. Standard features are provided free of charge, with premium "Pro VIP" benefits available through direct purchase or virtual currency (Credits).</p>
          </section>

          <section className="bg-secondary/5 p-6 rounded-2xl border-2 border-secondary/10">
            <h3 className="text-lg font-black mb-3 text-secondary flex items-center gap-2">
              <Coins className="h-5 w-5" /> 2. Reward Credits & Virtual Currency
            </h3>
            <div className="space-y-4">
              <p>Users may earn <b>"Reward Credits"</b> by completing sponsored tasks through our official reward partners. These credits have no cash value and can only be redeemed within the Globlync platform for professional benefits (e.g., VIP status, ranking boosts).</p>
              <p>Globlync acts as a publisher. All task tracking and credit allocation are managed by the reward network's postback system. We reserve the right to revoke credits if they were earned through fraudulent means.</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-black mb-3 text-primary">3. Reward Integrity & Anti-Fraud</h3>
            <p>To maintain our partnership with reward providers and protect our professional ecosystem, we enforce a <b>Strict Anti-Fraud Policy</b>. The following actions will result in an immediate permanent account ban and forfeiture of all credits/trust scores:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2 font-medium">
              <li>Use of Virtual Private Networks (VPNs) or Proxy services.</li>
              <li>Creation of multiple accounts by a single professional.</li>
              <li>Use of automated scripts, bots, or browser emulators.</li>
              <li>Submission of fraudulent or stock photos for job logs.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-black mb-3 text-primary">4. Professional Ethics</h3>
            <p>By using Globlync, you agree to log only genuine, original work. Submission of work belonging to others or misrepresenting your skills degrades the evidence-based economy and is strictly prohibited.</p>
          </section>

          <section className="pt-6 border-t">
            <h3 className="text-lg font-black mb-3 text-primary">5. Liability & Disputes</h3>
            <p>Globlync provides tools for reputation measurement but does not guarantee employment or specific earnings. We are not responsible for disputes between users and their respective clients or third-party offer wall partners.</p>
          </section>
        </CardContent>
      </Card>

      <footer className="text-center text-[10px] text-muted-foreground mt-8 font-black uppercase tracking-widest leading-loose">
        © 2026 Petediano Tech • Malawi<br/>
        Building a Verifiable Global Labor Market
      </footer>
    </div>
  );
}
