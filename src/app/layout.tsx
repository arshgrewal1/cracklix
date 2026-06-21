import type { Metadata, Viewport } from "next";
import "./globals.css";

import { Inter } from "next/font/google";

import { FirebaseClientProvider } from "@/firebase/client-provider";

import MobileNav from "@/components/layout/MobileNav";
import PWAManager from "@/components/pwa/PWAManager";
import NetworkStatus from "@/components/pwa/NetworkStatus";

import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

/**
 * @fileOverview Root Layout v52.3 (Production Hardened).
 */
export const metadata: Metadata = {
  title: "Cracklix | Punjab's Smart Mock Test Platform",

  description:
    "Punjab's most trusted government exam preparation platform. PSSSB, PPSC, Punjab Police, Patwari, Clerk and more.",

  manifest: "/manifest.json",

  other: {
    "color-scheme": "light",
  },

  icons: {
    icon: [
      {
        url: "/icons/icon-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
      {
        url: "/icons/icon-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
    shortcut: "/icons/icon-192x192.png",
    apple: [
      {
        url: "/icons/icon-512x512.png",
        sizes: "512x512",
      },
    ],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cracklix",
  },

  applicationName: "Cracklix",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body
        className={`
          ${inter.variable}
          font-body
          antialiased
          bg-white
          text-[#0F172A]
          overflow-x-hidden
        `}
      >
        <FirebaseClientProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />

          {/* PWA & Network Management */}
          <PWAManager />
          <NetworkStatus />

          {/* Toasts */}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}