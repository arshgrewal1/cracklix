'use client';

import { useEffect } from 'react';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * @fileOverview Global Native App Bridge v2.8.
 * FIXED: Properly handled async listener removal logic to resolve TypeScript errors.
 */
export default function CapacitorManager() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let backListener: PluginListenerHandle | null = null;
    let urlListener: PluginListenerHandle | null = null;

    const setupListeners = async () => {
      // Hardware Back Button Handling
      backListener = await App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });

      // Deep Link Listener
      urlListener = await App.addListener('appUrlOpen', (data) => {
        const slug = data.url.split('.app').pop();
        if (slug) window.location.href = slug;
      });
    };

    setupListeners();

    // Status Bar Configuration
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#0B1528' });
    } catch (e) {
      console.warn('[NATIVE_BRIDGE] StatusBar plugin error');
    }

    // External Browser Interceptor
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
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
      if (backListener) backListener.remove();
      if (urlListener) urlListener.remove();
    };
  }, []);

  return null;
}