import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { InstallPrompt } from '@/components/InstallPrompt';

export const viewport: Viewport = {
  themeColor: '#00796B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Globlync | Evidence-Based Reputation for Skilled Workers',
  description: 'Globlync helps informal workers (plumbers, electricians, cleaners) build a digital, evidence-based reputation with AI-verified job logs and client ratings.',
  keywords: 'skilled workers, informal labor, professional reputation, job verification, plumber reputation, electrician trust, verified workers, Globlync',
  manifest: '/manifest.json',
  icons: {
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://globlync.vercel.app',
    title: 'Globlync | Evidence-Based Reputation for Skilled Workers',
    description: 'Portable, verifiable trust for skilled workers in any trade.',
    siteName: 'Globlync',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Globlync Professional Reputation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Globlync | Skilled Worker Reputation',
    description: 'Get verified, earn badges, and grow your career with Globlync.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        {/* Global Structured Data for AI Trust */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Globlync",
              "url": "https://globlync.vercel.app",
              "logo": "https://globlync.vercel.app/icon-512.png",
              "description": "A digital reputation platform for skilled manual workers using AI-based verification.",
              "sameAs": []
            })
          }}
        />
      </head>
      <body className="font-body antialiased bg-background">
        <FirebaseClientProvider>
          <Navigation />
          <main className="mx-auto min-h-screen max-w-screen-xl px-4 pb-24 pt-6 md:pb-6 md:pt-24">
            {children}
          </main>
          <InstallPrompt />
          <Toaster />
        </FirebaseClientProvider>

        {/* BEGIN AADS AD UNIT 2429261 */}
        <div style={{ position: "absolute", zIndex: 99999 }}>
          <input autoComplete="off" type="checkbox" id="aadsstickymm9q4oin" hidden />
          <div style={{ paddingTop: "auto", paddingBottom: 0 }}>
            <div style={{ width: "100%", height: "auto", position: "fixed", textAlign: "center", fontSize: 0, top: 0, left: 0, right: 0, margin: "auto" }}>
              <label htmlFor="aadsstickymm9q4oin" style={{ top: "50%", transform: "translateY(-50%)", right: "24px", position: "absolute", borderRadius: "4px", background: "rgba(248, 248, 249, 0.70)", padding: "4px", zIndex: 99999, cursor: "pointer" }}>
                <svg fill="#000000" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490">
                  <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "/>
                </svg>
              </label>
              <div id="frame" style={{ width: "100%", margin: "auto", position: "relative", zIndex: 99998 }}>
                <iframe data-aa="2429261" src="//acceptable.a-ads.com/2429261/?size=Adaptive" style={{ border: 0, padding: 0, width: "70%", height: "auto", overflow: "hidden", margin: "auto" }}></iframe>
              </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
              #aadsstickymm9q4oin:checked + div {
                display: none;
              }
            ` }} />
          </div>
        </div>
        {/* END AADS AD UNIT 2429261 */}
      </body>
    </html>
  );
}
