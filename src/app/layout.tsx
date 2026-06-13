import type {Metadata, Viewport} from 'next';
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

const brandIcon = 'https://i.ibb.co/5WjGyLhn/1000110132-removebg-preview.png';

export const metadata: Metadata = {
  title: "Cracklix | Punjab's Mock Test Platform",
  description: "Punjab's most trusted government exam preparation platform. PSSSB, PPSC, Punjab Police, and more.",
  manifest: '/manifest.webmanifest',
  authors: [{ name: 'Arsh Grewal', url: 'https://cracklix.com' }],
  icons: {
    icon: [
      { url: brandIcon, sizes: '32x32', type: 'image/png' },
      { url: brandIcon, sizes: '192x192', type: 'image/png' },
      { url: brandIcon, sizes: '512x512', type: 'image/png' },
    ],
    apple: brandIcon,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cracklix',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'Cracklix',
    'apple-mobile-web-app-title': 'Cracklix',
    'theme-color': '#0B1528',
    'msapplication-navbutton-color': '#0B1528',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-starturl': '/'
  }
};

export const viewport: Viewport = {
  themeColor: '#0B1528',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

/**
 * @fileOverview Master Layout v24.0 (PWA Persistent).
 * UPDATED: Refined native script for more robust PWA event persistence and installability.
 */
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
        {/* Early capture and persistent storage of PWA install prompt */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPrompt = window.deferredPrompt || null;
              window.addEventListener('beforeinstallprompt', (e) => {
                // Prevent Chrome 67 and earlier from automatically showing the prompt
                e.preventDefault();
                // Stash the event so it can be triggered later.
                window.deferredPrompt = e;
                // Update UI notify that the PWA is installable
                window.dispatchEvent(new CustomEvent('pwa-installable'));
                console.log('[PWA] Installation prompt captured and stored.');
              });
              window.addEventListener('appinstalled', (e) => {
                console.log('[PWA] App successfully installed.');
                window.deferredPrompt = null;
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-body antialiased bg-white text-[#0F172A] min-h-screen pb-20 md:pb-0`}>
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen">
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
