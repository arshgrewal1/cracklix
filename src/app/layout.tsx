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

const brandIcon = 'https://i.ibb.co/S76nk4XG/IMG-20260613-215742.jpg';

export const metadata: Metadata = {
  title: "Cracklix | Punjab's Mock Test Platform",
  description: "Punjab's most trusted government exam preparation platform. PSSSB, PPSC, Punjab Police, and more.",
  manifest: '/manifest.webmanifest',
  authors: [{ name: 'Arsh Grewal', url: 'https://cracklix.com' }],
  icons: {
    icon: [
      { url: brandIcon, sizes: '32x32', type: 'image/jpeg' },
      { url: brandIcon, sizes: '192x192', type: 'image/jpeg' },
      { url: brandIcon, sizes: '512x512', type: 'image/jpeg' },
    ],
    apple: brandIcon,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cracklix',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1528',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPrompt = null;
              
              window.addEventListener('beforeinstallprompt', (e) => {
                console.log('[PWA] beforeinstallprompt fired');
                e.preventDefault();
                window.deferredPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-installable'));
              });

              window.addEventListener('appinstalled', (e) => {
                console.log('[PWA] appinstalled fired');
                window.deferredPrompt = null;
                window.dispatchEvent(new CustomEvent('pwa-installed'));
              });

              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(reg => {
                    console.log('[PWA] SW Registered');
                    if (reg.active) console.log('[PWA] SW Controlling page');
                  }).catch(err => {
                    console.error('[PWA] SW registration failed:', err);
                  });
                });
              }
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
