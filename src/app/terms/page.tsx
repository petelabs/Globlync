"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
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
        <CardHeader className="bg-muted/30">
          <CardTitle>User Agreement</CardTitle>
          <p className="text-xs text-muted-foreground font-bold">Last Updated: March 1, 2026</p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed p-8">
          <section>
            <h3 className="text-lg font-black mb-2 text-primary">1. Service Description</h3>
            <p>Globlync provides a digital reputation platform. Users may access standard features for free, or upgrade to VIP status via direct payment (PayChangu) or by completing sponsored tasks in the Reward Center.</p>
          </section>

          <section>
            <h3 className="text-lg font-black mb-2 text-primary">2. Reward Center Integrity</h3>
            <p>Users attempting to "game" or use fraudulent methods to complete Reward Center tasks will face immediate permanent account termination. This ensures the integrity of our partnership with offer wall networks.</p>
          </section>

          <section>
            <h3 className="text-lg font-black mb-2 text-primary">3. VIP Status</h3>
            <p>VIP status earned via the Reward Center provides identical benefits to paid VIP status, including enhanced search visibility and high-resolution photo uploads.</p>
          </section>

          <section>
            <h3 className="text-lg font-black mb-2 text-primary">4. Liability</h3>
            <p>Globlync is not responsible for any disputes between workers and clients. We provide the tools for reputation measurement, but do not guarantee employment or specific earnings.</p>
          </section>
        </CardContent>
      </Card>

      <footer className="text-center text-[10px] text-muted-foreground mt-8 font-black uppercase tracking-widest">
        © 2026 Petediano Tech • Malawi
      </footer>
    </div>
  );
}
