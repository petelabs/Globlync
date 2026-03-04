
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
        <h1 className="text-4xl font-bold">Terms of Service</h1>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Agreement to Terms</CardTitle>
          <p className="text-sm text-muted-foreground">Last Updated: March 1, 2026</p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h3 className="text-lg font-bold mb-2">1. Platform Description</h3>
            <p>Globlync is a digital reputation platform provided by Petediano Tech. It allows workers to log work, receive verifications, and build a verifiable professional history.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">2. User Accounts</h3>
            <p>By creating an account, you agree to provide accurate and truthful information. You are responsible for maintaining the security of your account and for all activities that occur under your profile.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">3. Acceptable Use</h3>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Log fake or fraudulent work history.</li>
              <li>Upload photos that do not belong to you or do not represent your actual work.</li>
              <li>Use the platform to harass, deceive, or defraud clients or other workers.</li>
              <li>Impersonate any person or entity.</li>
            </ul>
            <p className="mt-2 text-destructive font-bold">Violations of these rules will result in immediate account termination and loss of all earned trust scores and badges.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">4. Content Ownership</h3>
            <p>You retain ownership of the photos and descriptions you upload. However, by uploading them, you grant Globlync a license to display this content on your public profile for the purpose of building your reputation.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">5. Limitation of Liability</h3>
            <p>Globlync provides a tool for reputation building. We are not a party to any agreements made between workers and clients. Petediano Tech is not responsible for the quality of work performed, payment disputes, or any physical injury or property damage resulting from services logged on the platform.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">6. Changes to Terms</h3>
            <p>We may update these terms from time to time. Your continued use of the app after changes are posted constitutes your acceptance of the new terms.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">7. Contact</h3>
            <p>Questions about these terms should be sent to <a href="mailto:globlync.pro@gmail.com" className="text-primary font-bold">globlync.pro@gmail.com</a>.</p>
          </section>
        </CardContent>
      </Card>

      <footer className="text-center text-[10px] text-muted-foreground mt-8">
        © 2026 Petediano Tech • Malawi
      </footer>
    </div>
  );
}
