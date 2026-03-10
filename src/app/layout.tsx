
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { InstallPrompt } from '@/components/InstallPrompt';

export const viewport: Viewport = {
  themeColor: '#00796B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Globlync | Global Evidence-Based Reputation',
  description: 'Globlync helps professionals worldwide build a digital, evidence-based reputation with AI-verified job logs and verified ratings. Headquartered in Malawi, serving the globe.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://globlync.vercel.app',
    title: 'Globlync | Global Professional Reputation',
    description: 'Verifiable trust for skilled professionals everywhere. Headquartered in Malawi.',
    images: [{ 
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Globlync Global Professional Network'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Globlync | Global Professional Reputation',
    description: 'Verifiable trust for skilled professionals everywhere. Headquartered in Malawi.',
    images: ['/og-image.png'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const darkMode = localStorage.getItem('darkMode') === 'true';
                  if (darkMode) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground w-full flex flex-col min-h-full">
        <FirebaseClientProvider>
          <Navigation />
          <main className="flex-1 w-full max-w-screen-xl mx-auto px-0 sm:px-4 pt-20 pb-40 md:pt-28 md:pb-24">
            {children}
          </main>
          <Footer />
          <InstallPrompt />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
