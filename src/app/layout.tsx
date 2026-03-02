import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { InstallPrompt } from '@/components/InstallPrompt';
import Script from 'next/script';

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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Globlync',
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
        url: 'https://picsum.photos/seed/globlync-og/1200/630',
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
    images: ['https://picsum.photos/seed/globlync-twitter/1200/630'],
  },
  other: {
    'monetag': 'eb40c85c2360cc20f8269caf685d4cd8',
  }
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
        {/* Monetag Domain Verification */}
        <meta name="monetag" content="eb40c85c2360cc20f8269caf685d4cd8" />
        {/* Global Structured Data for AI Trust */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Globlync",
              "url": "https://globlync.vercel.app",
              "logo": "https://picsum.photos/seed/globlync-logo/200/200",
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

        {/* Monetag Vignette Banner Script */}
        <Script
          id="monetag-vignette"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='10674894',s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
          }}
        />
      </body>
    </html>
  );
}
