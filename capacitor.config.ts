
import { CapacitorConfig } from '@capacitor/cli';

/**
 * @fileOverview Production Capacitor Configuration for Cracklix Android.
 * Hardened for signed APK release with deep linking and security flags.
 */

const config: CapacitorConfig = {
  appId: 'com.cracklix.app',
  appName: 'Cracklix',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    // For production APKs, we point to the live URL for live updates,
    // but the local assets in 'out' are the fallback.
    url: 'https://cracklix.vercel.app',
    allowNavigation: ['*'],
    androidScheme: 'https',
    cleartext: false // Secure HTTPS only for production
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
    webContentsDebuggingEnabled: false,
    // Ensure the app can handle high-density assets
    buildOptions: {
      keystorePath: 'keystore.jks',
      keystoreAlias: 'cracklix',
    }
  }
};

export default config;
