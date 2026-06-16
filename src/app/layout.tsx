
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import MobileNav from '@/components/layout/MobileNav';
import PWAManager from '@/components/pwa/PWAManager';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Cracklix | Punjab's Smart Mock Test Platform",
  description: "Punjab's most trusted government exam preparation platform. PSSSB, PPSC, Punjab Police, and more.",
  manifest: '/manifest.json',
  authors: [{ name: 'Arsh Grewal', url: 'https://cracklix.com' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/logo/cracklix-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cracklix',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cracklix" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 1. PWA Installation Listeners
              window.deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.deferredPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-installable'));
              });
              window.addEventListener('appinstalled', function() {
                window.deferredPrompt = null;
                window.dispatchEvent(new CustomEvent('pwa-installed'));
              });

              // 2. Service Worker Cleanup (Purge stale/custom workers for stability)
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let registration of registrations) {
                    // Only unregister if it's not the current managed one
                    // or force unregister once during architectural migration
                    registration.unregister();
                  }
                });
              }
              
              // 3. Clear Stale Caches for Reliability
              if (typeof window !== 'undefined' && 'caches' in window) {
                caches.keys().then(function(names) {
                  for (let name of names) {
                    if (name.includes('cracklix-cache-v1')) continue; // keep current
                    caches.delete(name);
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-body antialiased bg-white text-[#0F172A] min-h-screen pb-20 md:pb-0`}>
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen app-content-wrapper">
            {children}
          </div>
          <MobileNav />
          <PWAManager />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
