import { CapacitorConfig } from '@capacitor/cli';

/**
 * @fileOverview Hardened Capacitor Configuration v4.8 [Direct Launch Sync].
 * FIXED: Re-synchronized launch duration and background nodes to eliminate logo flash.
 */

const config: CapacitorConfig = {
  appId: 'com.cracklix.app',
  appName: 'Cracklix',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#FFFFFF",
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
      backgroundColor: '#FFFFFF',
      style: 'LIGHT'
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