
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { InstallPrompt } from '@/components/InstallPrompt';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';

export const viewport: Viewport = {
  themeColor: '#00796B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Globlync | Evidence-Based Reputation for Skilled Workers',
  description: 'Globlync helps informal workers (plumbers, electricians, cleaners) build a digital, evidence-based reputation with AI-verified job logs and client ratings.',
  keywords: 'skilled workers, informal labor, professional reputation, job verification, plumber reputation, electrician trust, verified workers, Globlync',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
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
  verification: {
    google: 'pf3wUPFRMjh7iH06e_yc8dutjITQF7WtulH1GEwAxhk',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="monetag" content="eb40c85c2360cc20f8269caf685d4cd8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const darkMode = localStorage.getItem('darkMode') === 'true';
                  const animationsDisabled = localStorage.getItem('animationsDisabled') === 'true';
                  if (darkMode) document.documentElement.classList.add('dark');
                  if (animationsDisabled) document.documentElement.classList.add('no-animations');
                } catch (e) {}
              })();
            `,
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Globlync",
              "url": "https://globlync.vercel.app",
              "logo": "https://globlync.vercel.app/logo.png",
              "description": "A digital reputation platform for skilled manual workers using AI-based verification.",
              "sameAs": []
            })
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <FirebaseClientProvider>
          <Navigation />
          <main className="mx-auto min-h-screen max-w-screen-xl px-4 pb-28 pt-20 md:pb-12 md:pt-28">
            {children}
          </main>
          <OnboardingTutorial />
          <InstallPrompt />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
