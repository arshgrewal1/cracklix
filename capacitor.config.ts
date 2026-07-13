
import { CapacitorConfig } from '@capacitor/cli';

/**
 * @fileOverview Hardened Capacitor Configuration v4.5 [PRODUCTION READY].
 * UPDATED: Optimized splash screen behavior for Android 14/15 gestural navigation.
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
      splashImmersive: true,
      fadeShowDuration: 200,
      fadeHideDuration: 200
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
