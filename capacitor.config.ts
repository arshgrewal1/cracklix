
import { CapacitorConfig } from '@capacitor/cli';

/**
 * @fileOverview Hardened Capacitor Configuration v4.0.
 * UPDATED: Splash screen background and duration synchronized with official branding.
 */

const config: CapacitorConfig = {
  appId: 'com.cracklix.app',
  appName: 'Cracklix',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#2563EB",
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
      backgroundColor: '#2563EB',
      style: 'DARK'
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    buildOptions: {
      keystorePath: 'keystore.jks',
      keystoreAlias: 'cracklix-release-key',
    }
  }
};

export default config;
