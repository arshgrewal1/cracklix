
'use client';

import { useEffect } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

// Native security plugin
const Security = registerPlugin<any>('Security');

/**
 * @fileOverview Institutional Anti-Cheat Node v2.0.
 * @description Leverages native Android FLAG_SECURE to prevent screenshots and screen recording
 * during live tests. This is a OS-level feature and is more secure and user-friendly
 * than JavaScript-based tab monitoring.
 * 
 * @see https://developer.android.com/reference/android/view/WindowManager.LayoutParams#FLAG_SECURE
 */
export default function AntiCheat() {

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

    const enableSecureMode = async () => {
      try {
        await Security.setPrivacyScreen({ enabled: true });
        console.log('[AntiCheat] Secure mode enabled.');
      } catch (e) {
        console.error('[AntiCheat] Failed to enable secure mode:', e);
      }
    };

    const disableSecureMode = async () => {
      try {
        await Security.setPrivacyScreen({ enabled: false });
        console.log('[AntiCheat] Secure mode disabled.');
      } catch (e) {
        console.error('[AntiCheat] Failed to disable secure mode:', e);
      }
    };

    enableSecureMode();
    
    // Cleanup on unmount
    return () => {
      disableSecureMode();
    };
  }, []);

  return null;
}
