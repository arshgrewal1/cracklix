
'use client';

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
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
import AnnouncementBar from "@/components/layout/AnnouncementBar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

/**
 * @fileOverview Root Layout v70.1 [Production Hardened].
 * FIXED: Added unique keys to global siblings to resolve React "key" prop warnings.
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const registryVersion = INSTITUTIONAL_PAYLOAD.version;

  return (
    <html lang="en" suppressHydrationWarning className="bg-white">
      <body
        className={`
          ${poppins.variable}
          font-body
          antialiased
          bg-white
          text-[#0F172A]
          overflow-x-hidden
          w-full
        `}
      >
        <FirebaseClientProvider>
          <div key="main-app-container" className="min-h-screen flex flex-col">
            <AnnouncementBar />
            {children}
          </div>

          <GlobalStudyTracker key="global-tracker" />
          <PWAInstallHandler key="pwa-handler" />
          <MobileNav key="mobile-navigation" />
          <CapacitorManager key="native-manager" />
          <PWAManager key="pwa-manager-ui" />
          <NetworkStatus key="connectivity-status" />
          <Toaster key="global-toaster" />
          <ServiceWorkerRegistration key="sw-reg" />

          <div key="platform-version-node" className="hidden" data-node-version={registryVersion}></div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
