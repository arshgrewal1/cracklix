'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Share } from '@capacitor/share';
import { Browser } from '@capacitor/browser';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * @fileOverview Global Native App Bridge v1.7 (Build Fixed).
 * Intercepts web behaviors to provide a high-fidelity Android experience.
 * FIXED: Wrapped all native API calls in strict isNativePlatform guards.
 */
export default function CapacitorManager() {
  useEffect(() => {
    // 1. Device Handshake - Strict Native Container Check
    if (!Capacitor.isNativePlatform()) {
      console.log('[NATIVE_BRIDGE] Standard Browser Environment Detected.');
      return;
    }

    console.log('[NATIVE_BRIDGE] Initializing Android Environment');

    // 2. Share Bridge: Intercept navigator.share for Native Share Sheet
    if (typeof navigator !== 'undefined') {
      const originalShare = navigator.share;
      navigator.share = async (data: any) => {
        try {
          if (Capacitor.isNativePlatform()) {
            await Share.share({
              title: data.title || 'Cracklix',
              text: data.text || 'Prepare for Punjab Government Exams with Cracklix.',
              url: data.url || window.location.href,
            });
            return undefined;
          }
          return originalShare(data);
        } catch (err) {
          if (originalShare) return originalShare(data);
        }
        return undefined;
      };
    }

    // 3. Hardware Back Button Handling
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    // 4. Status Bar Node Configuration
    try {
      if (Capacitor.isNativePlatform()) {
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: '#0B1528' });
      }
    } catch (e) {
      console.warn('[NATIVE_BRIDGE] StatusBar plugin fail');
    }

    // 5. Deep Link Listener
    App.addListener('appUrlOpen', (data) => {
      const slug = data.url.split('.app').pop();
      if (slug) window.location.href = slug;
    });

    // 6. External Browser Interceptor
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href && Capacitor.isNativePlatform()) {
        try {
          const url = new URL(anchor.href);
          const isExternal = url.hostname !== window.location.hostname;
          const isPdf = anchor.href.endsWith('.pdf');

          if (isExternal || isPdf) {
            e.preventDefault();
            Browser.open({ url: anchor.href });
          }
        } catch (e) {}
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  return null;
}
