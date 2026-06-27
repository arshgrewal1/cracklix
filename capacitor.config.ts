import { CapacitorConfig } from '@capacitor/cli';

/**
 * @fileOverview Production Capacitor Configuration for Cracklix Android.
 * Optimized for Live Server mode to support SSR and Payment Gateways.
 */

const config: CapacitorConfig = {
  appId: 'com.cracklix.app',
  appName: 'Cracklix',
  webDir: 'out',
  server: {
    // Primary: Load production URL to support dynamic API routes and payments
    url: 'https://cracklix.vercel.app',
    allowNavigation: ['*'],
    androidScheme: 'https',
    cleartext: true
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
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
