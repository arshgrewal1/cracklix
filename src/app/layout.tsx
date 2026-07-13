import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import MobileNav from "@/components/layout/MobileNav";
import PWAManager from "@/components/pwa/PWAManager";
import PWAInstallHandler from "@/components/pwa/PWAInstallHandler";
import NetworkStatus from "@/components/pwa/NetworkStatus";
import CapacitorManager from "@/components/native/CapacitorManager";
import { Toaster } from "@/components/ui/toaster";
import { INSTITUTIONAL_PAYLOAD } from "@/lib/institutional-payload";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import GlobalStudyTracker from "@/components/analytics/GlobalStudyTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

/**
 * @fileOverview Root Layout v66.0 [PRODUCTION HARDENED].
 * UPDATED: Integrated GlobalStudyTracker for universal time counting.
 */
export const metadata: Metadata = {
  title: "Cracklix | Punjab's Smart Mock Test Platform",
  description: "Punjab's most trusted government exam preparation platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cracklix",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/icons/icon-192x192.png",
    apple: [
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const registryVersion = INSTITUTIONAL_PAYLOAD.version;

  return (
    <html lang="en" suppressHydrationWarning>
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
          <div className="min-h-screen flex flex-col pt-safe">
            {children}
          </div>

          <GlobalStudyTracker />
          <PWAInstallHandler />
          <MobileNav />
          <CapacitorManager />
          <PWAManager />
          <NetworkStatus />
          <Toaster />
          <ServiceWorkerRegistration />

          <div className="hidden" data-node-version={registryVersion}></div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
