import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import MobileNav from "@/components/layout/Navbar"; // Note: This is incorrectly named but preserved as per original structure
import PWAManager from "@/components/pwa/PWAManager";
import PWAInstallHandler from "@/components/pwa/PWAInstallHandler";
import NetworkStatus from "@/components/pwa/NetworkStatus";
import CapacitorManager from "@/components/native/CapacitorManager";
import { Toaster } from "@/components/ui/toaster";
import { INSTITUTIONAL_PAYLOAD } from "@/lib/institutional-payload";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import GlobalStudyTracker from "@/components/analytics/GlobalStudyTracker";
import StudyTimerManager from "@/components/analytics/StudyTimerManager";
import SplashScreen from "@/components/pwa/SplashScreen";
import { ThemeProvider } from "@/components/theme-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: 'swap',
  preload: true,
});

/**
 * @fileOverview Global Layout Registry v17.0.
 * UPDATED: Consolidated icon metadata to use the existing blue Cracklix logo consistently.
 */

export const metadata: Metadata = {
  metadataBase: new URL("https://cracklix.in"),
  title: {
    default: "Cracklix | Punjab's Smart Mock Test Platform",
    template: "%s | Cracklix"
  },
  description: "Punjab's most trusted government exam preparation platform. Practice Unlimited Mock Tests for PSSSB, PPSC, Punjab Police and Central Government Exams.",
  keywords: ["Punjab Government Exams", "PSSSB Patwari Mock Test", "PPSC PCS Preparation", "Punjab Police Constable Mock Test", "Punjab Previous Year Papers", "Current Affairs Punjab", "Cracklix App"],
  authors: [{ name: "Arsh Grewal" }],
  creator: "Arsh Grewal",
  publisher: "Cracklix",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logo/cracklix-icon.png", sizes: "any", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo/cracklix-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Cracklix | Punjab's Smart Mock Test Platform",
    description: "Prepare for Punjab Government Exams with verified patterns, detailed solutions, and state-wide merit rankings.",
    url: "https://cracklix.in",
    siteName: "Cracklix",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cracklix Punjab Exam Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cracklix | Punjab's Smart Mock Test Platform",
    description: "Punjab's smartest preparation portal for PSSSB, PPSC & Police Exams.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cracklix",
  },
  verification: {
    google: "google-site-verification-id", 
  }
};

export const viewport: Viewport = {
  themeColor: "#0B1528",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const registryVersion = INSTITUTIONAL_PAYLOAD.version;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Cracklix",
    "url": "https://cracklix.in",
    "description": "Punjab's smartest government exam preparation platform.",
    "applicationCategory": "EducationApplication",
    "operatingSystem": "Android, iOS, Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "author": {
      "@type": "Person",
      "name": "Arsh Grewal"
    }
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Cracklix",
    "url": "https://cracklix.in",
    "logo": "https://cracklix.in/logo/cracklix-icon.png",
    "sameAs": [
      "https://www.instagram.com/cracklix.in/",
      "https://t.me/cracklixapp"
    ]
  };

  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className="scroll-smooth"
    >
      <head>
        {/* Favicons & manifest - directly referencing existing public assets */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo/cracklix-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo/cracklix-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1528" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body
        className={`
          ${poppins.variable}
          font-body
          antialiased
          bg-background
          text-foreground
          w-full
          min-h-screen
          overflow-x-hidden
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <SplashScreen key="app-splash-screen" />
            
            <div key="main-app-container" className="min-h-screen flex flex-col relative bg-background">
              <div className="flex-1">
                {children}
              </div>
            </div>

            <StudyTimerManager key="global-timer-manager" />
            <GlobalStudyTracker key="global-tracker" />
            <PWAInstallHandler key="pwa-handler" />
            <CapacitorManager key="native-manager" />
            <PWAManager key="pwa-manager-ui" />
            <NetworkStatus key="connectivity-status" />
            <Toaster key="global-toaster" />
            <ServiceWorkerRegistration key="sw-reg" />

            <div key="platform-version-registry" className="hidden" data-app-version={registryVersion}></div>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
