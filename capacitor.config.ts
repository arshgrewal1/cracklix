import { CapacitorConfig } from '@capacitor/cli';

/**
 * @fileOverview Capacitor 7 Configuration for Cracklix Android.
 * FIXED: Strictly pointing to 'out' directory for Next.js 15 static export.
 */

const config: CapacitorConfig = {
  appId: 'com.cracklix.app',
  appName: 'Cracklix',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#FFFFFF",
      showSpinner: false,
      androidScaleType: "CENTER_CROP"
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    }
  }
};

export default config;
