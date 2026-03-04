
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
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
          <p className="text-sm text-muted-foreground">Last Updated: May 20, 2024</p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h3 className="text-lg font-bold mb-2">1. Information We Collect</h3>
            <p>At Globlync (built by Petediano Tech), we collect information to help skilled workers build a digital reputation. This includes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, and profile picture provided through Google Auth or Email Sign-in.</li>
              <li><strong>Professional Details:</strong> Your trade/skill, professional bio, and location.</li>
              <li><strong>Job Data:</strong> Job titles, descriptions, and photos of completed work for verification purposes.</li>
              <li><strong>Feedback:</strong> Ratings and comments provided by your clients.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">2. How We Use Your Information</h3>
            <p>We use your data strictly to provide our services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To create and maintain your public professional profile.</li>
              <li>To process AI-based photo verification of your work logs.</li>
              <li>To calculate and display your Trust Score and professional badges.</li>
              <li>To allow potential clients to verify your work history via QR codes.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">3. Data Sharing and Third Parties</h3>
            <p>We value your privacy. We do not sell your personal information. We share data only in the following contexts:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Public Profiles:</strong> Your name, trade, bio, and verified job history are public so clients can find and trust you.</li>
              <li><strong>Service Providers:</strong> We use Google Firebase for hosting/auth and Monetag for non-personalized advertising to keep the platform free.</li>
              <li><strong>Legal Requirements:</strong> If required by Malawian law, we may disclose information to authorities.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">4. Data Security and Storage</h3>
            <p>Your data is stored securely using Google Cloud Infrastructure (Firebase). We implement industry-standard security measures to protect against unauthorized access or disclosure.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">5. Your Choices and Rights</h3>
            <p>You can manage your data directly in the app:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Edit Profile:</strong> Update your trade, bio, and photos at any time.</li>
              <li><strong>Delete Account:</strong> You can request account deletion via Settings, which removes all your logs and reputation data.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2">6. Contact Us</h3>
            <p>If you have questions about this policy, please contact Petediano Tech at <a href="mailto:globlync.pro@gmail.com" className="text-primary font-bold">globlync.pro@gmail.com</a>.</p>
          </section>
        </CardContent>
      </Card>
      
      <footer className="text-center text-[10px] text-muted-foreground mt-8">
        © 2024 Petediano Tech • Malawi
      </footer>
    </div>
  );
}
