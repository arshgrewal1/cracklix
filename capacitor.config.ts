import { CapacitorConfig } from '@capacitor/cli';

/**
 * @fileOverview Production Capacitor Configuration for Cracklix Android.
 * Optimized for institutional readiness and high-fidelity static asset rendering.
 * FIXED: Ensured webDir points to 'out' to match Next.js static export.
 */

const config: CapacitorConfig = {
  appId: 'com.cracklix.app',
  appName: 'Cracklix',
  webDir: 'out',
  server: {
    // FALLBACK: Load production URL if local assets fail or for authenticated sessions
    url: 'https://cracklix.vercel.app',
    allowNavigation: ['*'],
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#0B1528",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    StatusBar: {
      backgroundColor: '#0B1528',
      style: 'DARK'
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
