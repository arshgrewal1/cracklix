
import { CapacitorConfig } from '@capacitor/cli';

/**
 * @fileOverview Hardened Capacitor Configuration v4.6 [PRODUCTION READY].
 * UPDATED: Set launchShowDuration to 0 to bypass native blue splash in favor of React Splash.
 */

const config: CapacitorConfig = {
  appId: 'com.cracklix.app',
  appName: 'Cracklix',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#000000",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
      fadeShowDuration: 0,
      fadeHideDuration: 0
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    StatusBar: {
      backgroundColor: '#000000',
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
